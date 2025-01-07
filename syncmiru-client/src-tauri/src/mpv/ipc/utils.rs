//! This module contains utility functions for IPC with mpv.

use std::fmt::Display;
use crate::result::Result;
use interprocess::local_socket::{GenericFilePath, GenericNamespaced, ToFsName, ToNsName};
use crate::mpv::get_pipe_ipc_path;


/// Creates a command string to get a property from mpv.
///
/// # Parameters:
/// - `prop`: The name of the property to retrieve.
/// - `req_id`: The unique request ID associated with this command.
///
/// # Returns:
/// - A formatted string that represents a JSON command to get the specified property.
pub(super) fn create_get_property_cmd(prop: &str, req_id: u32) -> String {
    format!("{{\"command\": [\"get_property\", \"{}\"], \"request_id\": {}}}\n", prop, req_id)
}


/// Creates a command string to set a property in mpv.
///
/// # Parameters:
/// - `prop`: The name of the property to set.
/// - `value`: The value to set for the property, which can be of any type that implements `Display` and `serde::Serialize`.
///
/// # Returns:
///  - A formatted string that represents a JSON command to set the specified property with the given value.
pub(super) fn create_set_property_cmd<T: Display + serde::Serialize>(prop: &str, value: &T) -> String {
    let value_string = serde_json::to_string(value).unwrap();
    format!("{{\"command\": [\"set_property\", \"{}\", {}]}}\n", prop, value_string)
}

/// Retrieves the appropriate IPC pipe name for the specified `pipe_id`.
/// The method differs based on the platform (Windows or Unix-like).
///
/// # Parameters:
/// - `pipe_id`: The unique identifier of the pipe.
///
/// # Returns:
/// - A result containing either the IPC pipe name (as `interprocess::local_socket::Name`) or an error if there was an issue generating the name.
pub(super) fn get_pipe_name(pipe_id: &str) -> Result<interprocess::local_socket::Name> {
    let pipe_path = get_pipe_ipc_path(pipe_id);
    if cfg!(target_family = "windows") {
        Ok(pipe_path.to_ns_name::<GenericNamespaced>()?)
    } else {
        Ok(pipe_path.to_fs_name::<GenericFilePath>()?)
    }
}

/// Converts a boolean value to a "yes" or "no" string representation.
///
/// # Parameters:
/// - `b`: The boolean value to convert.
///
/// # Returns:
/// A string, either "yes" if the value is `true`, or "no" if the value is `false`.
pub(super) fn bool2_yn(b: bool) -> String {
    if b {
        "yes".to_string()
    }
    else {
        "no".to_string()
    }
}
