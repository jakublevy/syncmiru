use std::process::Command;
use winreg::enums::{HKEY_LOCAL_MACHINE, KEY_READ};
use winreg::RegKey;
use crate::error::SyncmiruError;
use crate::result::Result;

pub(super) fn serial_number() -> Result<String> {
    if let Ok(s) = read_machine_guid() {
        return Ok(s)
    }
    if let Ok(s) = wmic_baseboard_serial_number() {
        return Ok(s)
    }
    if let Ok(s) = pwsh_baseboard_serial_number() {
        return Ok(s)
    }
    else {
        Ok("".to_string())
    }
}

fn read_machine_guid() -> Result<String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let cryptography = hklm.open_subkey_with_flags("SOFTWARE\\Microsoft\\Cryptography", KEY_READ)?;
    let machine_guid: String = cryptography.get_value("MachineGuid")?;
    Ok(machine_guid)
}

fn wmic_baseboard_serial_number() -> Result<String> {
    let wmic_output = Command::new("wmic")
        .arg("baseboard")
        .arg("get")
        .arg("serialnumber")
        .output()?
        .stdout;

    let wmic_str_out = String::from_utf8_lossy(wmic_output.as_slice());
    let strip_whitespace = wmic_str_out
        .split_whitespace()
        .collect::<Vec<&str>>();

    if strip_whitespace.len() != 2 {
        return Err(SyncmiruError::SystemSerialError)
    }
    Ok(strip_whitespace.get(1).unwrap().to_string())
}

fn pwsh_baseboard_serial_number() -> Result<String> {
    let pwsh_output = Command::new("powershell")
        .arg("-Command")
        .arg("(Get-WmiObject Win32_BaseBoard).SerialNumber")
        .output()?
        .stdout;

    let pwsh_str_output = String::from_utf8_lossy(pwsh_output.as_slice());
    let strip_whitespace = pwsh_str_output
        .split_whitespace()
        .collect::<String>();
    Ok(strip_whitespace)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn machine_guid_test() {
        assert_eq!(read_machine_guid().unwrap(), "test")
    }

    #[test]
    fn wmic_test() {
        assert_eq!(serial_number().unwrap(), "4387543095490")
    }

    #[test]
    fn pwsh_test() {
        assert_eq!(pwsh_baseboard_serial_number().unwrap(), "4387543095490")
    }
}