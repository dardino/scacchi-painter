use std::io::BufRead;
use std::io::BufReader;
use std::process::{Command, Stdio};
use std::ptr::eq;
use tauri::Manager;
use tauri::{Emitter, Runtime};
// windows
#[cfg(target_os = "windows")] use std::os::windows::process::CommandExt;

// import write_temp_file as module
mod write_temp_file;

fn get_popeye_executable() -> &'static str {
    #[cfg(all(target_os = "macos", target_arch = "aarch64"))]
    {
        return "pymacArm64";
    }
    #[cfg(all(target_os = "macos", target_arch = "x86_64"))]
    {
        return "pymacIntel64";
    }
    #[cfg(all(target_os = "windows", target_arch = "x86_64"))]
    {
        return "pywin64.exe";
    }
    #[cfg(all(target_os = "windows", target_arch = "aarch64"))]
    {
        return "pywinArm64.exe";
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
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
    name: &str
) -> Result<String, String> {

    let tmp_path = app.path().temp_dir();
    if tmp_path.is_err() {
        return Ok("[E] Failed to get temp dir".to_string());
    }
    let bin = tmp_path.unwrap().join("temp_file");
    let fname = bin.to_str().unwrap();
    let done = write_temp_file::write_temp_file(fname, name);
    
    if done.is_err() {
        window.emit("popeye-update", format!("[E] {}", done.err().unwrap())).ok();
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

    process_def.arg("-maxmem")
        .arg("8G")
        .arg("-maxtime")
        .arg("600")
        .arg(fname)
        .stdout(Stdio::piped());

    #[cfg(target_os = "windows")] {
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
            // Read stdout line by line
            {
                let stdout = resp.stdout.as_mut().unwrap();
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

            resp.wait().unwrap();

            return Ok("[I] done".to_string());
        }
    }
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
        .invoke_handler(tauri::generate_handler![close_app, run_popeye])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
