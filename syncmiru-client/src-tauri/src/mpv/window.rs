#[cfg(target_family = "windows")]
pub mod win32;

#[cfg(target_family = "unix")]
pub mod x11;

use std::env;
#[cfg(target_family = "windows")]
pub use self::win32::*;

#[cfg(target_family = "unix")]
pub use self::x11::*;

use serde::Deserialize;
use crate::result::Result;

#[derive(Deserialize, Debug)]
pub struct HtmlElementRect {
    x: f64,
    y: f64,
    top: f64,
    right: f64,
    bottom: f64,
    left: f64,
    width: f64,
    height: f64,
}