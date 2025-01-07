//! This module provides utility functions for managing application files and directories.

use std::fs;
use std::fs::File;
use std::path::{Path, PathBuf};
use anyhow::Context;
use zip::ZipArchive;
use crate::constants;
use crate::result::Result;

/// Returns the path to the Syncmiru data directory, used to store application data.
/// # Returns:
/// * `Result<PathBuf>` - A result containing the path to the data directory if successful, or an error if the path could not be determined.
pub fn syncmiru_data_dir() -> Result<PathBuf> {
    Ok(dirs::data_dir().context("data directory not available")?.join(constants::APP_NAME))
}

/// Returns the path to the Syncmiru configuration directory, used to store configuration files.
/// # Returns:
/// * `Result<PathBuf>` - A result containing the path to the configuration directory if successful, or an error if the path could not be determined.
pub fn syncmiru_config_dir() -> Result<PathBuf> {
    Ok(dirs::config_dir().context("config directory not available")?.join(constants::APP_NAME))
}

/// Returns the path to the Syncmiru INI configuration file.
/// # Returns:
/// * `Result<PathBuf>` - A result containing the path to the configuration INI file if successful, or an error if the path could not be determined.
pub fn syncmiru_config_ini() -> Result<PathBuf> {
    Ok(syncmiru_config_dir()?.join(constants::CONFIG_INI_FILE_NAME))
}

/// Creates the necessary directories for the application: config and data directories.
/// # Returns:
/// * `Result<()>` - An empty result, if directories are created successfully, or an error if the creation of directories fails.
pub fn create_app_dirs() -> Result<()> {
    fs::create_dir_all(syncmiru_config_dir()?)?;
    fs::create_dir_all(syncmiru_data_dir()?)?;
    Ok(())
}

/// Deletes temporary files and directories starting with an underscore (`_`).
/// # Returns:
/// * `Result<()>` - An empty result, which will be `Ok(())` if temporary files are deleted successfully, or an error if any deletion fails.
pub fn delete_tmp() -> Result<()> {
    let data_dir = syncmiru_data_dir()?;
    let dir_read = fs::read_dir(data_dir);
    if let Ok(entries) = dir_read {
        for entry in entries {
            let entry = entry?;
            if let Some(filename) = entry.file_name().to_str() {
                if filename.starts_with("_") {
                    let path = entry.path();
                    if path.is_dir() {
                        fs::remove_dir_all(path)?;
                    }
                    else {
                        fs::remove_file(path)?;
                    }
                }
            }
        }
    }
    Ok(())
}

/// Decompresses a 7z archive from the `from` path into the `into` directory.
///
/// # Arguments:
/// * `from` - The path to the source 7z file to decompress.
/// * `into` - The target directory where the files should be decompressed.
///
/// # Returns:
/// * `Result<()>` - An empty result, if decompression is successful, or an error if the decompression process fails.
pub fn decompress_7z(from: impl AsRef<Path>, into: impl AsRef<Path>) -> Result<()> {
    if !into.as_ref().exists() {
        fs::create_dir_all(&into)?;
    }
    sevenz_rust::decompress_file(from, into)?;
    Ok(())
}

/// Decompresses a ZIP archive from the `from` path into the `into` directory.
///
/// # Arguments:
/// * `from` - The path to the source ZIP file to decompress.
/// * `into` - The target directory where the files should be decompressed.
///
/// # Returns:
/// * `Result<()>` - An empty result, which will be `Ok(())` if decompression is successful, or an error if the decompression process fails.
pub fn decompress_zip(from: impl AsRef<Path>, into: impl AsRef<Path>) -> Result<()> {
    if !into.as_ref().exists() {
        fs::create_dir_all(&into)?;
    }
    let file = File::open(from)?;
    let mut archive = ZipArchive::new(file)?;
    archive.extract(into)?;
    Ok(())
}