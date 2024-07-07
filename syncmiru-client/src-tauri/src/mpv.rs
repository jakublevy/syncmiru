pub mod frontend;

use std::fs;
use tauri::State;
use crate::appstate::AppState;
use crate::constants::PRELUDE_LOCATION;
use crate::files::syncmiru_data_dir;
use crate::hash;
use crate::result::Result;

pub fn init_prelude() -> Result<()> {
    let d = syncmiru_data_dir()?;
    let prelude_path = d.join("prelude.lua");
    let mut prelude_hash = "".to_string();
    if prelude_path.exists() {
       prelude_hash = hash::of_file(prelude_path.as_path())?;
    }
    let correct_hash = hash::of_file(&PRELUDE_LOCATION)?;
    if prelude_hash != correct_hash {
        fs::copy(PRELUDE_LOCATION, prelude_path)?;
        println!("file updated")
    }
    else {
        println!("file ok")
    }
    Ok(())
}

pub fn start_process(state: &State<AppState>) -> Result<()> {
    Ok(())
}

pub fn stop_process() -> Result<()> {
    Ok(())
}

pub fn gen_pipe_name() -> String {
    "todo".to_string()
}