//! This module contains utility functions for securely storing JWTs

use keyring::Entry;
use crate::constants;
use crate::result::Result;
use crate::error::SyncmiruError;
use keyring::error::Error as keyring_err;

/// Reads the JWT token from the system keyring.
///
/// # Returns:
/// - `Ok(Some(String))` if the JWT is successfully retrieved.
/// - `Ok(None)` if no JWT is found.
/// - `Err(SyncmiruError::KeyringError)` if an error occurs while accessing the keyring.
pub fn read() -> Result<Option<String>> {
    let entry = Entry::new(constants::KEYRING_SERVICE, constants::KEYRING_LOGIN_JWT_USER)?;
    let jwt = entry.get_password();
    Ok(match jwt {
        Ok(tkn) => Some(tkn),
        Err(_) => None
    })
}

/// Writes the provided JWT token to the system keyring.
///
/// # Parameters:
/// - `jwt`: The JWT string to store securely in the keyring.
///
/// # Returns:
/// - `Ok(())` if the JWT is successfully stored.
/// - `Err(SyncmiruError::KeyringError)` if an error occurs while writing to the keyring.
pub fn write(jwt: &str) -> Result<()> {
    let entry = Entry::new(constants::KEYRING_SERVICE, constants::KEYRING_LOGIN_JWT_USER)?;
    entry.set_password(jwt)?;
    Ok(())
}

/// Clears the JWT token from the system keyring.
///
/// # Returns:
/// - `Ok(())` if the JWT is successfully removed or if it does not exist.
/// - `Err(SyncmiruError::KeyringError)` if an error occurs while deleting the JWT.
pub fn clear() -> Result<()> {
    let entry = Entry::new(constants::KEYRING_SERVICE, constants::KEYRING_LOGIN_JWT_USER)?;
    match entry.delete_credential() {
        Ok(_) => Ok(()),
        Err(keyring_err::NoEntry) => Ok(()),
        Err(e) => Err(SyncmiruError::KeyringError(e)),
    }
}
