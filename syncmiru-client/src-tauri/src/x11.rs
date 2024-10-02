use x11rb::resource_manager::new_from_default;
use x11rb::rust_connection::RustConnection;
use crate::constants;
use crate::result::Result;

pub fn get_scale_factor(conn: &RustConnection) -> Result<f64> {
    let db = new_from_default(conn)?;
    let dpi: u32 = db.get_value("Xft.dpi", "")?.unwrap_or(1);
    Ok(dpi as f64 / constants::DEFAULT_DPI as f64)
}