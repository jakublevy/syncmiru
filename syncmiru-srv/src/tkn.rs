use josekit::jws::{JwsHeader};
use josekit::jwt::JwtPayload;
use sqlx::PgPool;
use crate::config::{JwtSigner, JwtVerifier, LoginJwt};
use crate::models::query::Id;
use crate::models::socketio::LoginTkns;
use crate::query;
use crate::result::Result;

pub fn new_login(login_jwt_conf: &LoginJwt, uid: Id) -> Result<String> {
    let mut header = JwsHeader::new();
    header.set_token_type("JWT");
    let mut payload = JwtPayload::new();
    payload.set_subject(uid.to_string());
    let signer = login_jwt_conf.jwt_signer()?;
    header.set_algorithm(signer.algorithm().name());
    let signed = josekit::jwt::encode_with_signer(&payload, &header, &*signer)?;
    Ok(signed)
}

pub async fn login_jwt_check(
    login_tkns: &LoginTkns,
    login_jwt_conf: &LoginJwt,
    db: &PgPool
) -> Result<(bool, Option<Id>)> {
    let verifier = login_jwt_conf.jwt_verifier()?;
    let (payload, _) = josekit::jwt::decode_with_verifier(&login_tkns.jwt, &*verifier)?;
    let sub_opt = payload.claim("sub");
    if sub_opt.is_none() {
        return Ok((false, None))
    }
    let uid = sub_opt.unwrap().as_str().unwrap().parse::<i32>()?;
    let exists = query::session_exists(db, &login_tkns.hwid_hash, uid).await?;
    if !exists {
        return Ok((false, None))
    }
    Ok((true, Some(uid)))
}