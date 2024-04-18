use socketioxide::extract::SocketRef;
use crate::handlers;

pub mod http;
pub mod socketio;

pub fn ns_callback(s: SocketRef) {
    println!("client connected to /");
    s.on("login", socketio::login);
}
