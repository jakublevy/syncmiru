use std::fs;
use std::fs::File;
use std::path::{Path, PathBuf};
use anyhow::Context;
use zip::ZipArchive;
use crate::constants;
use crate::result::Result;

pub fn syncmiru_data_dir() -> Result<PathBuf> {
    Ok(dirs::data_dir().context(t!("data-dir-panic"))?.join(constants::APP_NAME))
}

pub fn syncmiru_config_dir() -> Result<PathBuf> {
    Ok(dirs::config_dir().context(t!("config-dir-panic"))?.join(constants::APP_NAME))
}

pub fn syncmiru_config_ini() -> Result<PathBuf> {
    Ok(syncmiru_config_dir()?.join(constants::CONFIG_INI_FILE_NAME))
}

pub fn delete_tmp() -> Result<()> {
    let data_dir = syncmiru_data_dir()?;
    for entry in fs::read_dir(data_dir)? {
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
    Ok(())
}

pub fn decompress_7z(from: impl AsRef<Path>, into: impl AsRef<Path>) -> Result<()> {
    if !into.as_ref().exists() {
        fs::create_dir_all(&into)?;
    }
    sevenz_rust::decompress_file(from, into)?;
    Ok(())
}

pub fn decompress_zip(from: impl AsRef<Path>, into: impl AsRef<Path>) -> Result<()> {
    if !into.as_ref().exists() {
        fs::create_dir_all(&into)?;
    }
    let file = File::open(from)?;
    let mut archive = ZipArchive::new(file)?;
    archive.extract(into)?;
    Ok(())
}