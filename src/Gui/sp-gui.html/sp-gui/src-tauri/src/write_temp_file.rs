// funzione che scrive un file temporaneo
use std::fs::File;
use std::io::Write;
use std::path::Path;

pub fn write_temp_file(fname: &str, content: &str) -> std::io::Result<()> {
    let tmp_file_path = Path::new(fname);
    let file_r = File::create(&tmp_file_path);
    match file_r {
        Err(e) => {
            return Err(e);
        }
        Ok(mut file) => {
            let wr_res = file.write_all(content.as_bytes());
            match wr_res {
                Err(e) => {
                  Err(e)
                }
                Ok(_) => {
                  file.flush().expect("failed to flush tmp file");
                  Ok(())
                },
            }
        }
    }
}
