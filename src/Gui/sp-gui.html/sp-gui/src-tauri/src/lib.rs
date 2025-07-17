use std::process::{Command, Stdio};
use std::fs::File;
use std::io::{BufReader, Write};
use std::io::BufRead;
use std::path::Path;
use tauri::{Emitter, Runtime};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn run_popeye(
    name: &str, 
    window: tauri::Window
) -> String {

    let tmp_file_path = Path::new("tmp");
    let mut file = File::create(&tmp_file_path).expect("failed to create tmp file");
    file.write_all(name.as_bytes()).expect("failed to write to tmp file");
    file.flush().expect("failed to flush tmp file");
    // Spawn the process
    let mut process = Command::new("popeye/py")
        .arg("tmp")
        .stdout(Stdio::piped())
        .spawn()
        .expect("Failed to spawn process");

    // Read stdout line by line
    {
        let stdout = process.stdout.as_mut().unwrap();
        let stdout_reader = BufReader::new(stdout);
        let stdout_lines = stdout_reader.lines();

        for line in stdout_lines {
            match line {
                Ok(trimmed) => {
                    window.emit("popeye-update", format!("{}", trimmed)).ok();
                    println!("Read: {}", trimmed);
                },
                Err(e) => {
                    window.emit("popeye-update", format!("[E] {}", e)).ok();
                    println!("Error: {}", e)
                },
            }
        }
    }

    process.wait().unwrap();

    return "done".to_string();
    
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

        .invoke_handler(tauri::generate_handler![
            close_app, 
            run_popeye
        ])

        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
