//! This module provides functionality for generating hash values, specifically SHA-256 hashes,
//! for files.

use std::fs::File;
use std::io::{BufReader, Read};
use std::path::Path;
use hex::encode;
use sha2::{Digest, Sha256};
use crate::result::Result;

/// Generates the SHA-256 hash of a file.
///
/// This function opens the specified file, reads its content in chunks, and computes the SHA-256 hash.
/// The result is then encoded as a hexadecimal string.
///
/// # Arguments
/// - `p`: A path to the file to be hashed.
///
/// # Returns
/// - `Result<String>`: A `Result` containing the hexadecimal string of the hash if successful,
/// or an error if the file could not be read or processed.
///
/// # Errors
/// This function can return errors if:
/// - The file cannot be opened.
/// - There are issues reading from the file.
pub fn of_file(p: impl AsRef<Path>) -> Result<String> {
    let file = File::open(p)?;
    let mut reader = BufReader::new(file);

    let mut hasher = Sha256::new();
    let mut buffer = [0; 1024]; // 1 KB chunks

    loop {
        let bytes_read = reader.read(&mut buffer)?;
        if bytes_read == 0 {
            break;
        }
        hasher.update(&buffer[..bytes_read]);
    }

    let result = hasher.finalize();
    Ok(encode(result))
}
