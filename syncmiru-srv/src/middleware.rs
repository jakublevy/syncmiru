use std::sync::Arc;
use socketioxide::extract::{Data, SocketRef, State};
use validator::Validate;
use crate::error::SyncmiruError::AuthError;
use crate::models::http::Jwt;
use crate::result::Result;
use crate::srvstate::SrvState;
use crate::tkn;

pub async fn auth(
    state: State<Arc<SrvState>>,
    s: SocketRef,
    Data(payload): Data<Jwt>
) -> Result<()> {
    payload.validate()?;
    let (valid, uid) = tkn::login_jwt_check(&payload.jwt, &state.config.login_jwt, &state.db).await?;
    if !valid {
        return Err(AuthError)
    }

    let mut socket_id2_uid_lock = state.socket_id2_uid.write()?;
    socket_id2_uid_lock.insert(s.id, uid.unwrap());
    Ok(())
}