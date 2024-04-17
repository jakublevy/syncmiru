#[cfg(target_family = "windows")]
mod windows;

#[cfg(target_family = "unix")]
mod unix;

use crate::result::Result;
use sha256::digest;

pub fn id_hashed() -> Result<String> {
    cfg_if::cfg_if! {
        if #[cfg(target_family = "windows")] {
            Ok(digest(windows::serial_number()?))
        }
        else if #[cfg(target_family = "unix")] {
            Ok(digest(unix::serial_number()?))

        }
        else {
            Ok("".to_string())
        }
    }
}