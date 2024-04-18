use socketioxide::extract::{SocketRef, State};
use crate::srvstate::SrvState;

pub async fn login(s: SocketRef, state: State<SrvState>) {
    println!("login message received")
}