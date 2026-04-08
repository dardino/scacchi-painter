use std::io::BufRead;
use std::io::BufReader;
use std::process::{Child, Command, Stdio};
use std::ptr::eq;
use std::sync::{Mutex, OnceLock};
use tauri::Manager;
use tauri::{Emitter, Runtime};
use std::sync::atomic::{AtomicBool, Ordering};
use serde::Deserialize;
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

#[derive(Debug, Clone, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
struct RustSolverOptionsInput {
    max_solutions: Option<usize>,
    refutations_try: Option<usize>,
    show_all_defenses: bool,
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

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
async fn run_popeye<R: Runtime>(
    window: tauri::Window,
    app: tauri::AppHandle<R>,
    name: &str,
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

    let exe = get_popeye_executable();
    if eq(exe, "unknown") {
        return Ok("[E] Unknown platform or architecture".to_string());
    }

    let res = app.path().resource_dir();
    if res.is_err() {
        return Ok("[E] Failed to get resource dir".to_string());
    }
    let base_path = res.unwrap().join("popeye");
    let popeye_path = base_path.join(exe);

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
    let config = SolverConfig {
        refutations_try: options.refutations_try,
        show_all_defenses: options.show_all_defenses,
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
        });
        window.emit("spcore-update", payload.to_string()).ok();
        StreamDirective::Continue
    });

    match result {
        Ok(summary) => {
            let done = serde_json::json!({
                "type": "done",
                "solutions_found": summary.solutions_found,
                "explored_nodes": summary.explored_nodes,
                "stopped_early": summary.stopped_early,
                "timed_out": summary.timed_out,
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
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![close_app, run_popeye, stop_popeye, run_rust_solver, stop_rust_solver])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
