use std::sync::Arc;
use rust_socketio::asynchronous::{Client};
use rust_socketio::Payload;
use crate::result::Result;

pub async fn test(
    state: Arc<i32>,
    payload: Payload,
    socket: Client,
    ) {
    println!("test callback");
    println!("state: {:?}", state);
    println!("payload: {:?}", payload);
}

pub async fn error(payload: Payload, socket: Client) {
    eprintln!("Error: {:#?}", payload)
}