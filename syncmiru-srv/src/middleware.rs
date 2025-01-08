//! This module provides middleware functionality for authenticating Socket.IO clients
//! and managing user sessions. It ensures secure client connections by validating
//! login tokens and handles scenarios such as multiple logins by the same user.

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


/// Authenticates a Socket.IO client based on the provided login tokens.
///
/// # Parameters
/// - `State(state): State<Arc<SrvState>>`:
///   A server state object containing configuration, database access, etc.
/// - `s: SocketRef`:
///   A reference to the current Socket.IO client connection.
/// - `Data(payload): Data<LoginTkns>`:
///   The login tokens provided by the client, which include the hardware ID hash.
///
/// # Returns
/// - `Result<()>`:
///   Returns `Ok(())` if authentication is successful. Otherwise, returns an error.
/// # Errors
/// - Returns `AuthError` if the login token is invalid or the client is unauthorized.
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


/// Registers a new client and manages session conflicts, including handling multiple logins by the same user.
/// # Parameters
/// - `state: &Arc<SrvState>`:
///   A server state object containing configuration, database access, etc.
/// - `s: &SocketRef`:
///   A reference to the current Socket.IO client connection.
/// - `uid: Id`:
///   The user ID associated with the client.
/// - `hwid_hash: &str`:
///   The hash of the hardware ID provided by the client.
///
/// # Returns
/// - `Result<()>`:
///   Returns `Ok(())` if the session is successfully managed. Otherwise, returns an error.
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