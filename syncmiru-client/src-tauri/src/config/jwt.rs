use keyring::Entry;
use crate::constants;
use crate::result::Result;
use crate::error::SyncmiruError;
use keyring::error::Error as keyring_err;

pub fn read() -> Result<Option<String>> {
    let entry = Entry::new(constants::KEYRING_SERVICE, constants::KEYRING_LOGIN_JWT_USER)?;
    let jwt = entry.get_password();
    Ok(match jwt {
        Ok(tkn) => Some(tkn),
        Err(_) => None
    })
}

pub fn write(jwt: &str) -> Result<()> {
    let entry = Entry::new(constants::KEYRING_SERVICE, constants::KEYRING_LOGIN_JWT_USER)?;
    entry.set_password(jwt)?;
    Ok(())
}

pub fn clear() -> Result<()> {
    let entry = Entry::new(constants::KEYRING_SERVICE, constants::KEYRING_LOGIN_JWT_USER)?;
    match entry.delete_password() {
        Ok(_) => Ok(()),
        Err(keyring_err::NoEntry) => Ok(()),
        Err(e) => Err(SyncmiruError::KeyringError(e)),
    }
}

#[cfg(test)]
mod tests {
    use serial_test::serial;
    use super::*;

    #[test]
    #[serial]
    fn read_login_tkn_no_value_test() {
        clear().unwrap();
        let tkn = read().unwrap();
        assert_eq!(None, tkn);
    }

    #[test]
    #[serial]
    fn read_write_login_tkn_test() {
        let jwt = "ahoj svete";
        write(jwt).unwrap();
        let tkn = read().unwrap();
        clear().unwrap();
        assert_eq!(Some(jwt.to_string()), tkn);
    }
}