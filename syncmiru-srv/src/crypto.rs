//! This module provides cryptographic functions for password hashing and token generation.

use anyhow::{anyhow};
use argon2::{Argon2, password_hash, PasswordHash, PasswordHasher, PasswordVerifier};
use argon2::password_hash::rand_core::OsRng;
use argon2::password_hash::SaltString;
use base64::Engine;
use rand::RngCore;
use tokio::task;
use crate::error::SyncmiruError;
use crate::result::Result;


/// Hashes a password using the Argon2 algorithm and returns the hashed result as a string.
///
/// # Arguments
/// - `password`: The plaintext password to be hashed. It should be provided as a `String`.
///
/// # Returns
/// - `Result<String>`: The result is a `String` containing the hashed password. If the hashing fails,
///   an error is returned as a `Result` type.
///
pub async fn hash(password: String) -> Result<String> {
    task::spawn_blocking(move || {
        let salt = SaltString::generate(rand::thread_rng());
        Ok(Argon2::default()
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| anyhow!(e).context("Failed to hash password"))?
            .to_string())
    })
        .await?
}


/// Verifies if a given password matches the provided hash using the Argon2 algorithm.
///
/// # Arguments
/// - `password`: The plaintext password to be verified.
/// - `hash`: The hashed password to compare against. This is a `String` that contains the hash.
///
/// # Returns
/// - `Result<bool>`: The result is `true` if the password matches the hash, or `false` if it does not.
///   If an error occurs (e.g., invalid hash), an error is returned.
pub async fn verify(password: String, hash: String) -> Result<bool> {
    task::spawn_blocking(move || {
        let hash = PasswordHash::new(&hash)
            .map_err(|e| anyhow!(e).context("Password hash invalid"))?;

        let res = Argon2::default().verify_password(password.as_bytes(), &hash);

        match res {
            Ok(()) => Ok(true),
            Err(password_hash::Error::Password) => Ok(false),
            Err(e) => Err(SyncmiruError::from(anyhow!(e)))
        }
    }).await?
}


/// Generates a random token encoded in base64. The token is 16 bytes of random data.
///
/// # Returns
/// - `String`: A base64-encoded string representing the generated token.
pub fn gen_tkn() -> String {
    let mut random_bytes = [0u8; 16];
    let mut rnd = OsRng::default();
    rnd.fill_bytes(&mut random_bytes);

    let engine = base64::engine::general_purpose::STANDARD;
    engine.encode(random_bytes)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[tokio::test]
    async fn hash_test() {
        let h = hash("pa$$word".to_string()).await.unwrap();
        let b = verify("pa$$word".to_string(), h).await.unwrap();
        assert!(b)
    }
}