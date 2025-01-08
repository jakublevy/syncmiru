//! This module contains functions for creating and verifying login JWTs.

use josekit::jws::{JwsHeader};
use josekit::jwt::JwtPayload;
use sqlx::PgPool;
use crate::config::{JwtSigner, JwtVerifier, LoginJwt};
use crate::models::query::Id;
use crate::models::socketio::LoginTkns;
use crate::query;
use crate::result::Result;


/// Creates a new login JWT for a user with the given user ID.
///
/// # Arguments
/// * `login_jwt_conf` - Configuration object that holds the JWT signing information.
/// * `uid` - The user ID for which the login token will be generated.
///
/// # Returns
/// A `Result` containing either the generated JWT string (`Ok(String)`) or an error (`Err`).
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


/// Verifies the validity of a login JWT and checks whether the user with a given session exist in the database.
///
/// # Arguments
/// * `login_tkns` - The `LoginTkns` struct containing the JWT and hardware ID hash.
/// * `login_jwt_conf` - Configuration object for JWT verification.
/// * `db` - Database pool for querying the session information.
///
/// # Returns
/// A `Result` containing a tuple with:
/// - A boolean indicating if the JWT is valid (`true` or `false`).
/// - An optional `Id` of the user if valid, or `None` if invalid.
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