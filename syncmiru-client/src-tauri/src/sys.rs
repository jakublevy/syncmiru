use crate::result::Result;
use machineid_rs::{IdBuilder, Encryption, HWIDComponent};
use anyhow::{anyhow, Context};
use crate::constants;

pub fn id_hashed() -> Result<String> {
    let mut builder = IdBuilder::new(Encryption::SHA256);
    builder.add_component(HWIDComponent::SystemID)
        .add_component(HWIDComponent::OSName)
        .add_component(HWIDComponent::CPUID);

    let hwid = builder.build(constants::HWID_KEY)
        .map_err(|e| anyhow!(e).context("HWID error"))?;
    Ok(hwid)
}

pub fn device() -> String {
    whoami::devicename()
}


#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn id_test() {
        assert_eq!(id_hashed().unwrap(), "afds")
    }

    #[test]
    fn device_test() {
        assert_eq!(device(), "Desktop")
    }
}