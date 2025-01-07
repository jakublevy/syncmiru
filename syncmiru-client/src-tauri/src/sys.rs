//! This module contains functions for system and device identification.

use crate::result::Result;
use machineid_rs::{IdBuilder, Encryption, HWIDComponent};
use anyhow::{anyhow};
use crate::constants;

/// Generates a unique device ID by hashing various hardware and system components.
///
/// # Returns
/// a `Result<String>`, which will contain the generated device ID if successful,
/// or an error if any of the steps in the ID generation process fail.
///
/// # Errors
/// This function can return an error if:
/// - The components cannot be added to the `IdBuilder` due to system access issues.
pub fn id_hashed() -> Result<String> {
    let mut builder = IdBuilder::new(Encryption::SHA256);
    builder.add_component(HWIDComponent::SystemID)
        .add_component(HWIDComponent::OSName)
        .add_component(HWIDComponent::MachineName)
        .add_component(HWIDComponent::CPUID);

    let hwid = builder.build(constants::HWID_SEED)
        .map_err(|e| anyhow!(e).context("HWID error"))?;
    Ok(hwid)
}

/// Returns the device name of the current system.
/// # Returns
/// - A `String` representing the device name of the current system.
pub fn device() -> String {
    whoami::devicename()
}
