use std::sync::Arc;
use axum::extract::{Query, State};
use axum::response::{IntoResponse, Response};
use axum_typed_websockets::{JsonCodec, Message, WebSocket, WebSocketUpgrade};
use validator::Validate;
use crate::error::SyncmiruError::AuthError;
use crate::srvstate::SrvState;
use crate::result::Result;
use crate::{query, tkn};
use crate::models::Jwt;
use futures_util::{FutureExt, SinkExt, stream::{StreamExt}};
use crate::models::ws::{ClientMsg, SrvMsg};

#[axum::debug_handler]
pub async fn init(
    State(state): State<Arc<SrvState>>,
    ws: WebSocketUpgrade<SrvMsg, ClientMsg>,
    Query(payload): Query<Jwt>,
) -> Result<impl IntoResponse> {
    payload.validate()?;
    let (valid, uid) = tkn::login_jwt_check(&payload.jwt, &state.config.login_jwt, &state.db).await?;
    if !valid {
        return Err(AuthError);
    }
    Ok(ws.on_upgrade(move |websocket| { handle(state.clone(), uid.unwrap(), websocket).map(|_| ()) }))
}

async fn handle(
    state: Arc<SrvState>,
    uid: i32,
    mut socket: WebSocket<SrvMsg, ClientMsg>
) -> Result<()> {
    let my_profile = query::get_my_profile(&state.db, uid).await?;
    let (mut sender, mut receiver) = socket.split();

    let mut write_task = tokio::spawn(async move {
        //let data = JsonCodec::encode(my_profile).expect("df");
        sender.send(Message::Text(SrvMsg::MyProfile)).await.expect("error sending");
        loop {}
    });
    let mut read_task = tokio::spawn(async {

    });


    tokio::select! {
        rv_a = &mut write_task => {
            match rv_a {
                Ok(a) => println!("messages sent"),
                Err(a) => println!("Error sending messages")
            }
            read_task.abort();
            Ok(())
        },
        rv_b = &mut read_task => {
            match rv_b {
                Ok(b) => println!("Received messages"),
                Err(b) => println!("Error receiving messages")
            }
            write_task.abort();
            Ok(())
        }
    }
}

// async fn read(mut receiver: SplitStream<WebSocket>) {
//     loop {
//
//     }
// }
//
// async fn write(mut sender: SplitSink<WebSocket, Message>) {
//     loop {
//
//     }
    // for i in 1..=5 {
    //     if sender
    //         .send(Message::Text(format!("Hi {i} times!")))
    //         .await
    //         .is_err()
    //     {
    //         println!("client abruptly disconnected");
    //         return;
    //     }
    //     tokio::time::sleep(std::time::Duration::from_millis(1000)).await;
    // }
//}