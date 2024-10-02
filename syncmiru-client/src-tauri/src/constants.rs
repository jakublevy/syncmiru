use once_cell::sync::OnceCell;
use crate::window;
use crate::result::Result;
pub const APP_NAME: &'static str = "syncmiru";
pub const CONFIG_INI_FILE_NAME: &'static str = "config.ini";
pub const KEYRING_SERVICE: &'static str = APP_NAME;
pub const KEYRING_LOGIN_JWT_USER: &'static str = "jwt";
pub const MPV_AVX2_RELEASES_URL: &'static str = "https://sourceforge.net/projects/mpv-player-windows/rss?path=/64bit-v3/";
pub const MPV_RELEASES_URL: &'static str = "https://sourceforge.net/projects/mpv-player-windows/rss?path=/64bit/";
pub const HTTP_TIMEOUT: u64 = 5;
pub const HWID_KEY: &'static str = "&-]#pBy7Wkxn72l|r#lW$6rAD:I7;ksbX976_ltp=LVM8iGKqzpQsK0v+<(Yf7e";
pub const MPV_IGNORE_FULLSCREEN_MILLIS: u128 = 300;
pub const MPV_MIN_USER_REQ_ID: u32 = 100;
pub const DEFAULT_DPI: u32 = 96;
pub const WIN32_CREATE_NO_WINDOW: u32 = 0x08000000;
pub static SUPPORTED_WINDOW_SYSTEM: OnceCell<bool> = OnceCell::new();

pub async fn init_runtime_constants() -> Result<()> {
    SUPPORTED_WINDOW_SYSTEM.set(window::is_supported_window_system())?;
    Ok(())
}