use socketioxide::extract::{Data, SocketRef, State};
use crate::result::Result;
use crate::srvstate::SrvState;

pub async fn auth(
    state: State<SrvState>,
    s: SocketRef,
    Data(tkn): Data<String>
) -> Result<()> {
    println!("auth middleware");
    //println!("auth called - state config: {:?}", state.config);
    // println!("token is {}", tkn);
    // if tkn != "secret" {
    //     return Err(AuthError)
    // }
    Ok(())
}