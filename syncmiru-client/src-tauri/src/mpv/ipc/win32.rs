//! This module contains specific utility functions for Win32 for interacting with the mpv through IPC.

use crate::mpv::ipc::{IpcData, Property, send_with_response};
use crate::mpv::ipc::Interface;
use crate::result::Result;


/// Checks if mpv is in fullscreen mode and ensures it is set to `false` if it is.
///
/// This function sends an IPC request to the `mpv` player to check the fullscreen state, and if it is `true`,
/// it sends another request to set the fullscreen mode to `false`.
///
/// # Parameters
/// - `ipc_data`: A reference to `IpcData` containing necessary application state and IPC details.
///
/// # Returns
/// - `Result<()>`: A result indicating the success or failure of the operation. If the fullscreen state
///   is changed, it returns `Ok(())`. Any errors encountered in the IPC communication result in an `Err`.
pub async fn make_fullscreen_false_if_not(ipc_data: &IpcData) -> Result<()> {
    let mut rx = send_with_response(ipc_data, Property::Fullscreen).await?;
    if let Some(json) = rx.recv().await {
        if let Some(data) = json.get("data") {
            if let Some(fullscreen) = data.as_bool() {
                if fullscreen {
                    let mpv_ipc_tx_rl = ipc_data.app_state.mpv_ipc_tx.read().await;
                    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();
                    mpv_ipc_tx.send(Interface::SetFullscreen(false)).await?;
                }
            }
        }
    }
    Ok(())
}
