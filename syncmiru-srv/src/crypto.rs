use anyhow::{anyhow, Context};
use argon2::{Argon2, password_hash, PasswordHash, PasswordHasher, PasswordVerifier};
use argon2::password_hash::SaltString;
use tokio::task;
use crate::error::SyncmiruError;
use crate::result::Result;

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