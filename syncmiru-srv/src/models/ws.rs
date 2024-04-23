use serde::{Deserialize, Serialize};
use crate::models::MyProfile;

#[derive(Debug, Serialize)]
pub enum SrvMsg {
    MyProfile,
}

#[derive(Debug, Deserialize)]
pub enum ClientMsg {
    Stop,
    Start
}