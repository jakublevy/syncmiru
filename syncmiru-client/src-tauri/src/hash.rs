use std::fs::File;
use std::io::{BufReader, Read};
use std::path::Path;
use hex::encode;
use sha2::{Digest, Sha256};
use crate::result::Result;

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
