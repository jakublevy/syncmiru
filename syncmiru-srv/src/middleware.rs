use socketioxide::extract::{Data, SocketRef, State};
use validator::Validate;
use crate::error::SyncmiruError::AuthError;
use crate::models::http::Jwt;
use crate::result::Result;
use crate::srvstate::SrvState;
use crate::tkn;

pub async fn auth(
    state: State<SrvState>,
    s: SocketRef,
    Data(payload): Data<Jwt>
) -> Result<()> {
    payload.validate()?;
    println!("{}", payload.jwt);
    let valid = tkn::login_jwt_check(&payload.jwt, &state.config.login_jwt, &state.db).await?;
    if !valid {
        return Err(AuthError)
    }
    Ok(())
}