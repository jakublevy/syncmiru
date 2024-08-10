use crate::mpv::ipc::{IpcData, Property, send_get_property};
use crate::mpv::ipc::Interface;

pub async fn make_fullscreen_false_if_not(ipc_data: &IpcData) -> crate::result::Result<()> {
    let mut tx = send_get_property(ipc_data, Property::Fullscreen).await?;
    if let Some(json) = tx.recv().await {
        if let Some(data) = json.get("data") {
            if let Some(fullscreen) = data.as_bool() {
                if fullscreen {
                    let mut mpv_ignore_next_fullscreen_event_wl = ipc_data.app_state.mpv_ignore_next_fullscreen_event.write().await;
                    *mpv_ignore_next_fullscreen_event_wl = true;

                    let mpv_ipc_tx_rl = ipc_data.app_state.mpv_ipc_tx.read().await;
                    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();
                    mpv_ipc_tx.send(Interface::SetFullscreen(false)).await?;
                }
            }
        }
    }
    Ok(())
}