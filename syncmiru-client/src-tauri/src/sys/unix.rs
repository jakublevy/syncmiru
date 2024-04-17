use std::fs;
use std::path::PathBuf;
use crate::error::SyncmiruError;
use crate::result::Result;

// machine-id
// blkid
// mac (ip, ipconfig)
// hostname
// ""

pub(super) fn serial_number() -> Result<String> {
    if let Ok(s) = read_machine_id() {
        return Ok(s)
    }
    else {
        Ok("".to_string())
    }
}

fn read_machine_id() -> Result<String> {
    let machine_id = PathBuf::from("/etc/machine-id");
    if !machine_id.exists() {
        Err(SyncmiruError::SystemSerialError)
    }
    Ok(fs::read_to_string(machine_id))
}