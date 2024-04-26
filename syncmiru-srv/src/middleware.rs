use std::sync::Arc;
use anyhow::Context;
use socketioxide::extract::{Data, SocketRef, State};
use validator::Validate;
use crate::error::SyncmiruError::AuthError;
use crate::models::http::Jwt;
use crate::models::query::Id;
use crate::result::Result;
use crate::srvstate::SrvState;
use crate::tkn;

pub async fn auth(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    Data(payload): Data<Jwt>
) -> Result<()> {
    payload.validate()?;
    let (valid, uid) = tkn::login_jwt_check(&payload.jwt, &state.config.login_jwt, &state.db).await?;
    if !valid {
        return Err(AuthError)
    }
    new_client(&state, &s, uid.unwrap()).await?;
    Ok(())
}

pub async fn new_client(
    state: &Arc<SrvState>,
    s: &SocketRef,
    uid: Id
) -> Result<()> {
    let mut socket_uid =  state.socket_uid.write()?;
    if socket_uid.contains_right(&uid) {
        let io_lock = state.io.read()?;
        let io = io_lock.as_ref().unwrap();
        let old_sid = socket_uid.get_by_right(&uid).unwrap();
        let old_socket = io.get_socket(*old_sid).context("socket does not exist")?;
        old_socket.emit("new-login", {})?;
        old_socket.disconnect()?;
    }
    socket_uid.insert(s.id, uid);
    Ok(())
}