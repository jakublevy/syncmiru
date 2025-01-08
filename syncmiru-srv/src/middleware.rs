use std::sync::Arc;
use anyhow::Context;
use socketioxide::extract::{Data, SocketRef, State};
use validator::Validate;
use crate::error::SyncmiruError::AuthError;
use crate::models::query::Id;
use crate::models::socketio::LoginTkns;
use crate::result::Result;
use crate::srvstate::SrvState;
use crate::tkn;

pub async fn auth(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    Data(payload): Data<LoginTkns>,
) -> Result<()> {
    payload.validate()?;
    let (valid, uid) = tkn::login_jwt_check(&payload, &state.config.login_jwt, &state.db).await?;
    if !valid {
        return Err(AuthError);
    }
    new_client(&state, &s, uid.unwrap(), &payload.hwid_hash).await?;
    Ok(())
}

async fn new_client(
    state: &Arc<SrvState>,
    s: &SocketRef,
    uid: Id,
    hwid_hash: &str,
) -> Result<()> {
    let mut kick_old_session = false;
    {
        let socket_uid_rl = state.socket_uid.read().await;
        if socket_uid_rl.contains_right(&uid) {
            kick_old_session = true;
            let io_lock = state.io.read().await;
            let io = io_lock.as_ref().unwrap();
            let old_sid = socket_uid_rl.get_by_right(&uid).unwrap().clone();
            drop(socket_uid_rl);

            let old_socket = io.get_socket(old_sid).context("socket does not exist")?;
            {
                let mut socket_uid_disconnect_wl = state.socket_uid_disconnect.write().await;
                socket_uid_disconnect_wl.insert(old_sid, uid);
            }
            {
                let mut socket_uid_wl = state.socket_uid.write().await;
                socket_uid_wl.insert(s.id, uid);
            }
            old_socket.emit("new_login", &{})?;
            old_socket.disconnect()?;
        }
    }
    if !kick_old_session {
        let mut socket_uid_wl = state.socket_uid.write().await;
        socket_uid_wl.insert(s.id, uid);
    }

    let mut sid2hwid_hash_wl = state.sid_hwid_hash.write().await;
    sid2hwid_hash_wl.insert(s.id, hwid_hash.to_string());
    Ok(())
}