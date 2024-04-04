use socketioxide::extract::SocketRef;
use crate::handlers;

pub mod public;
pub mod login;

pub fn auth_callback(s: SocketRef) {
    println!("client connected to /auth");
    s.on("login", handlers::login::login);
}

pub fn pub_callback(s: SocketRef) {
    s.on("register", handlers::public::register);
    s.on("forgotten-password", handlers::public::forgotten_password);
}