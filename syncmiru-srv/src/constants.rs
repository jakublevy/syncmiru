use std::time::Duration;

pub const SOCKETIO_ACK_TIMEOUT: Duration = Duration::from_secs(5);
pub const HTTP_TIMEOUT: u64 = 5;
pub const TIMESTAMP_TICK_MAX_OLD_MS: u128 = 4000;