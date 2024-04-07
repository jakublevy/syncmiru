use socketioxide::extract::SocketRef;
use crate::handlers;

pub mod web;
pub mod login;

pub fn ns_callback(s: SocketRef) {
    println!("client connected to /");
    s.on("login", handlers::login::login);
}
