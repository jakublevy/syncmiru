use keyring::Entry;
use crate::constants;

pub fn read_login_tkn() -> crate::result::Result<String> {
    let entry = Entry::new(constants::KEYRING_SERVICE, constants::KEYRING_LOGIN_JWT_USER)?;
    Ok(entry.get_password()?)
}

pub fn write_login_tkn(jwt: &str) -> crate::result::Result<()> {
    let entry = Entry::new(constants::KEYRING_SERVICE, constants::KEYRING_LOGIN_JWT_USER)?;
    entry.set_password(jwt)?;
    Ok(())
}
