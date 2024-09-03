use tokio::sync::mpsc;
use crate::mpv::ipc::{IpcData, Property, send_with_response};
use crate::mpv::ipc::Interface;
use crate::result::Result;

pub async fn make_fullscreen_false_if_not(ipc_data: &IpcData) -> Result<()> {
    let mut rx = send_with_response(ipc_data, Property::GetFullscreen).await?;
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
