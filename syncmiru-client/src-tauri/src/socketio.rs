pub mod frontend;
pub mod handlers;

use crate::result::Result;

async fn drop_connection(socket_opt: &Option<rust_socketio::asynchronous::Client>) -> Result<()> {
    if let Some(socket) = socket_opt {
        socket.disconnect_no_msg().await?;
    }
    Ok(())
}