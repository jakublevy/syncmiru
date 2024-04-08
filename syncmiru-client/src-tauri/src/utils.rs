use std::sync::RwLock;
use crate::result::Result;
use crate::config::appdata::AppData;

pub fn extract_home_srv(appdata: &RwLock<AppData>) -> Result<String> {
    let mut home_srv: String;
    {
        let appdata = appdata.read()?;
        home_srv = appdata.home_srv.clone().unwrap_or("".to_string());
    }
    Ok(home_srv)
}