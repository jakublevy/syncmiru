use std::fmt::Display;
use interprocess::local_socket::{GenericFilePath, GenericNamespaced, ToFsName, ToNsName};
use crate::mpv::get_pipe_ipc_path;

pub(super) fn create_get_property_cmd(prop: &str, req_id: u32) -> String {
    format!("{{\"command\": [\"get_property\", \"{}\"], \"request_id\": {}}}\n", prop, req_id)
}

pub(super) fn create_set_property_cmd<T: Display + serde::Serialize>(prop: &str, value: &T) -> String {
    let value_string = serde_json::to_string(value).unwrap();
    format!("{{\"command\": [\"set_property\", \"{}\", {}]}}\n", prop, value_string)
}

pub(super) fn get_pipe_name(pipe_id: &str) -> crate::result::Result<interprocess::local_socket::Name> {
    let pipe_path = get_pipe_ipc_path(pipe_id);
    if cfg!(target_family = "windows") {
        Ok(pipe_path.to_ns_name::<GenericNamespaced>()?)
    } else {
        Ok(pipe_path.to_fs_name::<GenericFilePath>()?)
    }
}

pub(super) fn bool2_yn(b: bool) -> String {
    if b {
        "yes".to_string()
    }
    else {
        "no".to_string()
    }
}
