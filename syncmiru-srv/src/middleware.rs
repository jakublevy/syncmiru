use socketioxide::extract::{Data, SocketRef};
use crate::error::SyncmiruError::AuthError;
use crate::result::Result;

pub async fn auth(s: SocketRef, Data(tkn): Data<String>) -> Result<()> {
    println!("token is {}", tkn);
    if tkn != "secret" {
        return Err(AuthError)
    }
    Ok(())
}