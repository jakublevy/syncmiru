use jwt::{Header, PKeyWithDigest, SignWithKey, Token};
use jwt::header::HeaderType;
use openssl::pkey::PKey;
use crate::config::LoginJwt;
use crate::result::Result;

pub fn new_login(login_jwt_conf: &LoginJwt, uid: i32) -> Result<String> {
    let mut header = Header::default();
    header.algorithm = login_jwt_conf.alg.into();
    header.type_ = Some(HeaderType::JsonWebToken);
    let claims = serde_json::json!({
        "sub": uid
    });
    let tkn = Token::new(header, claims);
    let key = PKeyWithDigest {
        digest: login_jwt_conf.alg.digest(),
        key: PKey::private_key_from_pem(&login_jwt_conf.priv_pem)?,
    };
    let signed = tkn.sign_with_key(&key)?;
    Ok(signed.as_str().to_string())
}

pub fn login_jwt_valid(jwt: &str, login_jwt_conf: &LoginJwt) -> Result<bool> {
    Ok(true)
}