//! This module defines the application constants

use std::time::Duration;

/// The `APP_NAME` constant holds the unique application identifier used for various purposes.
pub const APP_NAME: &'static str = "syncmiru-srv";


/// `SOCKETIO_ACK_TIMEOUT` defines the timeout duration for Socket.IO acknowledgements.
pub const SOCKETIO_ACK_TIMEOUT: Duration = Duration::from_secs(5);


/// `HTTP_TIMEOUT` defines the HTTP request timeout in seconds.
pub const HTTP_TIMEOUT: u64 = 5;


/// `TIMESTAMP_TICK_MAX_OLD_MS` represents the maximum allowed age (in milliseconds) of a timestamp
/// before it is considered too old for synchronization purposes.
pub const TIMESTAMP_TICK_MAX_OLD_MS: u128 = 2000;


/// `DESYNC_TIMER_TICK_MS` represents the interval (in milliseconds) used for desynchronization checks
pub const DESYNC_TIMER_TICK_MS: u64 = 10;