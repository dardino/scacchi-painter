use std::io::BufRead;
use std::io::BufReader;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::{Mutex, OnceLock};
use tauri::Manager;
use tauri::{Emitter, Runtime};
use std::sync::atomic::{AtomicBool, Ordering};
use serde::Deserialize;
use serde::Serialize;
use std::fs;
use problem_io::{parse_popeye, ast_to_problem};
use problem_solver::{solve_streaming, SolverConfig, StreamDirective};
// windows
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

// import write_temp_file as module
mod write_temp_file;

fn running_popeye() -> &'static Mutex<Option<Child>> {
    static RUNNING_POPEYE: OnceLock<Mutex<Option<Child>>> = OnceLock::new();
    RUNNING_POPEYE.get_or_init(|| Mutex::new(None))
}

fn rust_solver_stop_flag() -> &'static AtomicBool {
    static STOP_FLAG: OnceLock<AtomicBool> = OnceLock::new();
    STOP_FLAG.get_or_init(|| AtomicBool::new(false))
}

fn custom_auth_redirect_response(request: tauri::http::Request<Vec<u8>>) -> tauri::http::Response<Vec<u8>> {
    let path = request.uri().path();
    let target_path = match path {
        "" | "/" | "/auth" | "/auth/redirect" => "/redirect",
        _ => path,
    };
    let query = request.uri().query().unwrap_or("");
    let redirect_url = if query.is_empty() {
        format!("tauri://localhost{target_path}")
    } else {
        format!("tauri://localhost{target_path}?{query}")
    };

    let script_target = serde_json::to_string(&redirect_url).unwrap();
    let body = format!(
        r#"<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url={redirect_url}" />
    <script>
      window.location.replace({script_target});
    </script>
    <title>Redirecting...</title>
  </head>
  <body></body>
</html>"#,
        redirect_url = redirect_url,
        script_target = script_target,
    );

    tauri::http::Response::builder()
        .status(200)
        .header("Content-Type", "text/html; charset=utf-8")
        .body(body.into_bytes())
        .unwrap()
}

#[derive(Debug, Clone, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
struct RustSolverOptionsInput {
    max_solutions: Option<usize>,
    refutations_count: Option<usize>,
    show_all_defenses: bool,
    show_attempts: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct LocalEntry {
    id: String,
    item_name: String,
    full_path: String,
    entry_type: String,
}

#[tauri::command]
fn list_local_roots() -> Result<Vec<LocalEntry>, String> {
    #[cfg(target_os = "windows")]
    {
        let mut roots = Vec::new();
        for letter in b'A'..=b'Z' {
            let root = format!("{}:\\", char::from(letter));
            let path = PathBuf::from(&root);
            if path.exists() {
                roots.push(LocalEntry {
                    id: root.clone(),
                    item_name: root.clone(),
                    full_path: root,
                    entry_type: "drive".to_string(),
                });
            }
        }
        if roots.is_empty() {
            roots.push(LocalEntry {
                id: "C:\\".to_string(),
                item_name: "C:\\".to_string(),
                full_path: "C:\\".to_string(),
                entry_type: "drive".to_string(),
            });
        }
        return Ok(roots);
    }

    #[cfg(not(target_os = "windows"))]
    {
        let mut roots = Vec::new();
        if let Ok(home) = std::env::var("HOME") {
            let home_path = PathBuf::from(home);
            if home_path.exists() {
                roots.push(LocalEntry {
                    id: home_path.to_string_lossy().into_owned(),
                    item_name: "Home".to_string(),
                    full_path: home_path.to_string_lossy().into_owned(),
                    entry_type: "folder".to_string(),
                });
            }
        }
        let root = PathBuf::from("/");
        if root.exists() {
            roots.push(LocalEntry {
                id: "/".to_string(),
                item_name: "Root".to_string(),
                full_path: "/".to_string(),
                entry_type: "root".to_string(),
            });
        }
        Ok(roots)
    }
}

#[tauri::command]
fn list_local_folder(path: String) -> Result<Vec<LocalEntry>, String> {
    let folder = PathBuf::from(&path);
    if !folder.is_dir() {
        return Err(format!("Local folder is missing or unavailable: {path}"));
    }

    let mut entries = Vec::new();
    let read_dir = fs::read_dir(&folder)
        .map_err(|error| format!("Unable to read folder '{path}': {error}"))?;

    for entry in read_dir {
        let entry = entry.map_err(|error| format!("Unable to inspect folder entry: {error}"))?;
        let entry_path = entry.path();
        let file_name = entry_path
            .file_name()
            .map(|name| name.to_string_lossy().into_owned())
            .unwrap_or_else(|| entry_path.to_string_lossy().into_owned());

        let metadata = entry.metadata()
            .map_err(|error| format!("Unable to inspect '{file_name}': {error}"))?;
        if metadata.is_dir() {
            entries.push(LocalEntry {
                id: entry_path.to_string_lossy().into_owned(),
                item_name: file_name,
                full_path: entry_path.to_string_lossy().into_owned(),
                entry_type: "folder".to_string(),
            });
        }
        else if metadata.is_file() {
            let lower_name = file_name.to_lowercase();
            if lower_name.ends_with(".sp2") || lower_name.ends_with(".sp3") {
                entries.push(LocalEntry {
                    id: entry_path.to_string_lossy().into_owned(),
                    item_name: file_name,
                    full_path: entry_path.to_string_lossy().into_owned(),
                    entry_type: "file".to_string(),
                });
            }
        }
    }

    entries.sort_by(|left, right| {
        right.entry_type.cmp(&left.entry_type).then_with(|| left.item_name.cmp(&right.item_name))
    });
    Ok(entries)
}

#[tauri::command]
fn read_local_file(path: String) -> Result<Vec<u8>, String> {
    fs::read(&PathBuf::from(&path))
        .map_err(|error| format!("Unable to read local file '{path}': {error}"))
}

#[tauri::command]
fn write_local_file(path: String, bytes: Vec<u8>) -> Result<(), String> {
    let target = PathBuf::from(&path);
    if let Some(parent) = target.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Unable to prepare local folder '{}': {error}", parent.display()))?;
    }
    fs::write(&target, bytes)
        .map_err(|error| format!("Unable to write local file '{path}': {error}"))
}

#[cfg(test)]
mod local_filesystem_tests {
    use super::{list_local_folder, write_local_file};
    use std::fs;

    #[test]
    fn filters_supported_database_files() {
        let folder = std::env::temp_dir().join(format!(
            "spx-local-files-{}",
            std::process::id()
        ));
        fs::create_dir_all(&folder).unwrap();
        fs::write(folder.join("problem.sp3"), b"{}").unwrap();
        fs::write(folder.join("problem.sp2"), b"<root/>").unwrap();
        fs::write(folder.join("ignored.txt"), b"ignored").unwrap();

        let entries = list_local_folder(folder.to_string_lossy().into_owned()).unwrap();
        let names: Vec<String> = entries.iter().map(|entry| entry.item_name.clone()).collect();

        assert!(names.contains(&"problem.sp3".to_string()));
        assert!(names.contains(&"problem.sp2".to_string()));
        assert!(!names.contains(&"ignored.txt".to_string()));
        fs::remove_dir_all(folder).unwrap();
    }

    #[test]
    fn writes_database_file() {
        let folder = std::env::temp_dir().join(format!(
            "spx-local-write-{}",
            std::process::id()
        ));
        fs::create_dir_all(&folder).unwrap();
        let target = folder.join("saved.sp3");

        write_local_file(target.to_string_lossy().into_owned(), b"{}".to_vec()).unwrap();

        assert_eq!(fs::read(target).unwrap(), b"{}");
        fs::remove_dir_all(folder).unwrap();
    }
}

fn get_popeye_executable() -> &'static str {
    #[cfg(all(target_os = "macos", target_arch = "aarch64"))]
    {
        return "pymacArm64";
    }
    #[cfg(all(target_os = "macos", target_arch = "x86_64"))]
    {
        return "pymacIntel64";
    }
    #[cfg(all(target_os = "linux", target_arch = "x86_64"))]
    {
        return "pyLinux64";
    }
    #[cfg(all(target_os = "windows", target_arch = "x86_64"))]
    {
        return "pywin64.exe";
    }
    #[cfg(all(target_os = "windows", target_arch = "aarch64"))]
    {
        return "pywinArm64.exe";
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    {
        return "unknown";
    }
    #[allow(unreachable_code)]
    {
        return "unknown";
    }
}

#[tauri::command]
fn available_engines() -> Vec<String> {
    let mut engines = vec!["SpCore".to_string()];
    if get_popeye_executable() != "unknown" {
        engines.insert(0, "Popeye".to_string());
    }
    engines
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
async fn run_popeye<R: Runtime>(
    window: tauri::Window,
    app: tauri::AppHandle<R>,
    name: &str,
    executable_path: Option<String>,
) -> Result<String, String> {
    let tmp_path = app.path().temp_dir();
    if tmp_path.is_err() {
        return Ok("[E] Failed to get temp dir".to_string());
    }
    let bin = tmp_path.unwrap().join("temp_file");
    let fname = bin.to_str().unwrap();
    let done = write_temp_file::write_temp_file(fname, name);

    if done.is_err() {
        window
            .emit("popeye-update", format!("[E] {}", done.err().unwrap()))
            .ok();
        return Ok("[E] Failed to write temp file".to_string());
    }

    // A custom executable path (configured in the solver settings for native
    // Popeye) takes precedence over the executable bundled with the app.
    let custom_path = executable_path
        .map(|path| path.trim().to_string())
        .filter(|path| !path.is_empty());

    let popeye_path: PathBuf = if let Some(path) = custom_path {
        PathBuf::from(path)
    } else {
        let exe = get_popeye_executable();
        if exe == "unknown" {
            return Ok("[E] Unknown platform or architecture".to_string());
        }

        let res = app.path().resource_dir();
        if res.is_err() {
            return Ok("[E] Failed to get resource dir".to_string());
        }
        let base_path = res.unwrap().join("popeye");
        base_path.join(exe)
    };

    // Spawn the process
    let mut process_def = Command::new(popeye_path);

    process_def
        .arg("-maxmem")
        .arg("8G")
        .arg("-maxtime")
        .arg("600")
        .arg(fname)
        .stdout(Stdio::piped());

    #[cfg(target_os = "windows")]
    {
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        process_def.creation_flags(CREATE_NO_WINDOW);
    }

    let process = process_def.spawn();

    match process {
        Err(e) => {
            window.emit("popeye-update", format!("[E] {}", e)).ok();
            println!("Error: {}", e);
            return Ok("[E] Failed to run popeye".to_string());
        }
        Ok(mut resp) => {
            let stdout = resp.stdout.take();
            {
                let mut running = running_popeye().lock().unwrap();
                *running = Some(resp);
            }

            // Read stdout line by line
            if let Some(stdout) = stdout {
                let stdout_reader = BufReader::new(stdout);
                let stdout_lines = stdout_reader.lines();

                for line in stdout_lines {
                    match line {
                        Ok(trimmed) => {
                            window.emit("popeye-update", format!("{}", trimmed)).ok();
                            println!("Read: {}", trimmed);
                        }
                        Err(e) => {
                            window.emit("popeye-update", format!("[E] {}", e)).ok();
                            println!("Error: {}", e)
                        }
                    }
                }
            }

            if let Some(mut child) = running_popeye().lock().unwrap().take() {
                let _ = child.wait();
            }

            return Ok("[I] done".to_string());
        }
    }
}

#[tauri::command]
async fn stop_popeye() -> Result<(), String> {
    let mut running = running_popeye().lock().unwrap();
    if let Some(child) = running.as_mut() {
        child.kill().map_err(|e| e.to_string())?;
        let _ = child.wait();
    }
    *running = None;
    Ok(())
}

#[tauri::command]
async fn run_rust_solver<R: Runtime>(
    window: tauri::Window<R>,
    input: String,
    options: Option<RustSolverOptionsInput>,
) -> Result<String, String> {
    rust_solver_stop_flag().store(false, Ordering::Relaxed);

    let ast = parse_popeye(&input).map_err(|e| e.to_string())?;
    let problem = ast_to_problem(ast).map_err(|e| e.to_string())?;
    let options = options.unwrap_or_default();
    
    let effective_refutations_try = if options.show_attempts {
        let count = options.refutations_count.unwrap_or(1);
        if count >= 1 {
            Some(count)
        } else {
            eprintln!("[WARN] refutations-count value ({}) is less than 1 and will be ignored. Using default value of 1.", count);
            Some(1)
        }
    } else {
        if let Some(rc) = options.refutations_count {
            if rc >= 1 {
                eprintln!("[WARN] refutations-count value ({}) will be ignored because show_attempts is not enabled.", rc);
            }
        }
        None
    };
    
    let config = SolverConfig {
        refutations_try: effective_refutations_try,
        show_all_defenses: options.show_all_defenses,
        show_attempts: options.show_attempts,
        ..SolverConfig::default()
    };

    let mut solution_index = 0usize;
    let result = solve_streaming(&problem, &config, options.max_solutions, |search_result| {
        if rust_solver_stop_flag().load(Ordering::Relaxed) {
            return StreamDirective::Stop;
        }
        solution_index += 1;
        let payload = serde_json::json!({
            "type": "solution",
            "index": solution_index,
            "winning_line": search_result.winning_line,
            "winning_line_popeye": search_result.winning_line_popeye,
            "explored_nodes": search_result.explored_nodes,
            "solution": search_result.solution,
        });
        window.emit("spcore-update", payload.to_string()).ok();
        StreamDirective::Continue
    });

    match result {
        Ok(summary) => {
            for (idx, try_line) in summary.tries.iter().enumerate() {
                let try_event = serde_json::json!({
                    "type": "try",
                    "index": idx + 1,
                    "try_move": try_line.try_move,
                    "threat_moves": try_line.threat_moves,
                    "threats": try_line.threats,
                    "refutations": try_line.refutations,
                });
                window.emit("spcore-update", try_event.to_string()).ok();
            }
            let done = serde_json::json!({
                "type": "done",
                "solutions_found": summary.solutions_found,
                "explored_nodes": summary.explored_nodes,
                "stopped_early": summary.stopped_early,
                "timed_out": summary.timed_out,
                            "elapsed_ms": summary.elapsed_ms,
            });
            window.emit("spcore-update", done.to_string()).ok();
        }
        Err(e) => {
            let error = serde_json::json!({
                "type": "error",
                "message": e.to_string(),
            });
            window.emit("spcore-update", error.to_string()).ok();
        }
    }

    Ok("done".to_string())
}

#[tauri::command]
async fn stop_rust_solver() -> Result<(), String> {
    rust_solver_stop_flag().store(true, Ordering::Relaxed);
    Ok(())
}

#[tauri::command]
async fn close_app<R: Runtime>(app: tauri::AppHandle<R>) -> Result<(), String> {
    app.exit(0);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .register_uri_scheme_protocol("scacchi-painter-x", |_, request| {
            custom_auth_redirect_response(request)
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            close_app,
            available_engines,
            list_local_roots,
            list_local_folder,
            read_local_file,
            write_local_file,
            run_popeye,
            stop_popeye,
            run_rust_solver,
            stop_rust_solver
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
