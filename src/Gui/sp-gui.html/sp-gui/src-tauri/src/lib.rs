use std::process::Command;
use std::fs::File;
use std::io::Write;
use std::path::Path;
use tauri::Emitter;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(
    name: &str, 
    window: tauri::Window
) -> String {

    let tmp_file_path = Path::new("tmp");
    let mut file = File::create(&tmp_file_path).expect("failed to create tmp file");
    file.write_all(name.as_bytes()).expect("failed to write to tmp file");
    file.flush().expect("failed to flush tmp file");
    
    window.emit("progress-update", "test").ok();

    let output = Command::new("popeye/py").arg("tmp").output().expect("failed to execute process");
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    return stdout;
    
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
