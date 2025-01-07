//! This module defines the application constants

use once_cell::sync::OnceCell;
use crate::window;
use crate::result::Result;

/// The `APP_NAME` constant holds the unique application identifier used for various purposes
pub const APP_NAME: &'static str = "cz.levy.jakub.client.syncmiru";


/// The `CONFIG_INI_FILE_NAME` constant specifies the name of the configuration
/// file used for storing application settings.
pub const CONFIG_INI_FILE_NAME: &'static str = "config.ini";


/// The `KEYRING_SERVICE` constant stores the service name used in the keyring for storing
/// sensitive data such as JWT tokens.
pub const KEYRING_SERVICE: &'static str = APP_NAME;


/// The `KEYRING_LOGIN_JWT_USER` constant specifies the user used in the keyring for storing
/// sensitive data such as JWT tokens.
pub const KEYRING_LOGIN_JWT_USER: &'static str = "jwt";


/// The `MPV_AVX2_RELEASES_URL` constant provides the URL where AVX2-enabled
/// versions of the mpv player can be downloaded.
pub const MPV_AVX2_RELEASES_URL: &'static str = "https://sourceforge.net/projects/mpv-player-windows/rss?path=/64bit-v3/";


/// The `MPV_RELEASES_URL` constant provides the URL where non-AVX2-enabled
/// versions of the mpv player can be downloaded.
pub const MPV_RELEASES_URL: &'static str = "https://sourceforge.net/projects/mpv-player-windows/rss?path=/64bit/";


/// The `HTTP_TIMEOUT` constant defines the timeout period (in seconds) for all  HTTP requests.
pub const HTTP_TIMEOUT: u64 = 5;


/// The `HWID_SEED` constant is used as a seed value for generating a unique
/// hardware identifier (HWID) for the machine running the application
pub const HWID_SEED: &'static str = "&-]#pBy7Wkxn72l|r#lW$6rAD:I7;ksbX976_ltp=LVM8iGKqzpQsK0v+<(Yf7e";


/// The `MPV_IGNORE_FULLSCREEN_MILLIS` constant specifies the duration (in milliseconds)
/// to ignore the fullscreen mode when starting MPV player to prevent screen flicker.
pub const MPV_IGNORE_FULLSCREEN_MILLIS: u128 = 300;


/// The `MPV_MIN_USER_REQ_ID` constant defines the lowest allowable ID for user-initiated requests
/// when communicating with the MPV player via Inter-Process Communication (IPC).
pub const MPV_MIN_USER_REQ_ID: u32 = 100;


/// The `DEFAULT_DPI` constant defines the default DPI value
/// for rendering graphical elements in the application.
pub const DEFAULT_DPI: u32 = 96;


/// The `WIN32_CREATE_NO_WINDOW` constant is a flag used when creating a process
/// on Windows that ensures no window is created for the process.
pub const WIN32_CREATE_NO_WINDOW: u32 = 0x08000000;


/// The `SUPPORTED_WINDOW_SYSTEM` is a `OnceCell` that stores a boolean indicating
/// whether the current windowing system is supported by the application.
/// This value is determined during runtime.
pub static SUPPORTED_WINDOW_SYSTEM: OnceCell<bool> = OnceCell::new();


/// The `init_runtime_constants` function is used to initialize runtime constants,
/// specifically setting the `SUPPORTED_WINDOW_SYSTEM` value based on whether
/// the current windowing system is supported by the application.
pub async fn init_runtime_constants() -> Result<()> {
    SUPPORTED_WINDOW_SYSTEM.set(window::is_supported_window_system())?;
    Ok(())
}