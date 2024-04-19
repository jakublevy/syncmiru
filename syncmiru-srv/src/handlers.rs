use socketioxide::extract::{SocketRef, State};
use crate::srvstate::SrvState;

pub mod http;
pub mod socketio;

pub fn ns_callback(state: State<SrvState>, s: SocketRef) {
    println!("client connected to /");
    s.on("login", socketio::login);
}
