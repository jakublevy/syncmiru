use std::collections::BTreeMap;
use std::error::Error;
use jwt::{Header, PKeyWithDigest, SignWithKey, Token, VerifyWithKey};
use jwt::header::HeaderType;
use openssl::pkey::PKey;
use sqlx::PgPool;
use crate::config::LoginJwt;
use crate::error::SyncmiruError::AuthError;
use crate::query;
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

pub async fn login_jwt_check(
    jwt: &str,
    login_jwt_conf: &LoginJwt,
    db: &PgPool
) -> Result<bool> {
    let key = PKeyWithDigest {
        digest: login_jwt_conf.alg.digest(),
        key: PKey::public_key_from_pem(&login_jwt_conf.pub_pem)?,
    };
    if let Ok(claims) = jwt.verify_with_key(&key) as std::result::Result<BTreeMap<String, i32>, jwt::Error> {
        let sub_opt = claims.get("sub");
        if sub_opt.is_none() {
            return Ok(false)
        }
        let sub = sub_opt.unwrap();
        let valid = query::session_valid(db, jwt, *sub).await?;
        if !valid {
            return Ok(false)
        }
        Ok(true)
    }
    else {
        Ok(false)
    }
}
