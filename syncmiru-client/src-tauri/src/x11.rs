//! This module contains utility methods for interacting with the X11 window system.

use x11rb::resource_manager::new_from_default;
use x11rb::rust_connection::RustConnection;
use crate::constants;
use crate::result::Result;

/// Calculates the scale factor for rendering based on the DPI settings.
///
/// # Arguments
/// * `conn` - A reference to a [`RustConnection`] object used to query the X server.
///
/// # Returns
/// a `Result<f64>` containing the calculated scale factor. The scale factor is the ratio of the
/// retrieved DPI value to the default DPI (`constants::DEFAULT_DPI`).
///
/// # Errors
/// Returns an error if:
/// - The connection to the X server is invalid or fails.
/// - The `Xft.dpi` setting cannot be queried.
pub fn get_scale_factor(conn: &RustConnection) -> Result<f64> {
    let db = new_from_default(conn)?;
    let dpi: u32 = db.get_value("Xft.dpi", "")?.unwrap_or(1);
    Ok(dpi as f64 / constants::DEFAULT_DPI as f64)
}