use std::process::{Command};
use anyhow::Context;
use serde::{Serialize, Serializer};
use crate::result::Result;
use crate::deps::utils::{mpv_exe, yt_dlp_exe};


#[derive(Serialize)]
pub struct DepsStateFrontend {
    mpv: bool,
    yt_dlp: bool
}

impl DepsStateFrontend {
    pub fn from_params(deps_managed: bool) -> Result<Self> {
        let mut mpv = "mpv".to_string();
        let mut yt_dlp = "yt-dlp".to_string();
        if deps_managed {
            mpv = mpv_exe()?.to_str().context("mpv dir invalid")?.to_string();
            yt_dlp = yt_dlp_exe()?.to_str().context("yt-dlp dir invalid")?.to_string();
        }

        let mut mpv_res = false;
        let mut yt_dlp_res = false;

        let mpv_output_r = Command::new(mpv)
            .arg("--version")
            .output();
        if let Ok(mpv_output) = mpv_output_r {
            let mpv_stdout_output = String::from_utf8_lossy(mpv_output.stdout.as_slice());
            let mpv_stdout_first = mpv_stdout_output
                .split_whitespace()
                .take(1)
                .collect::<String>();

            mpv_res = mpv_stdout_first == "mpv"
        }

        let yt_dlp_output = Command::new(yt_dlp)
            .arg("--version")
            .output();
        if let Ok(yt_dlp_output) = yt_dlp_output {
            let yt_dlp_stdout_output = String::from_utf8_lossy(yt_dlp_output.stdout.as_slice());
            let yt_dlp_version = yt_dlp_stdout_output
                .strip_suffix("\r\n")
                .or(yt_dlp_stdout_output.strip_suffix("\n"))
                .unwrap_or(yt_dlp_stdout_output.as_ref())
                .to_string();

            yt_dlp_res = yt_dlp_version.len() == 10;
        }

        Ok(DepsStateFrontend { mpv: mpv_res, yt_dlp: yt_dlp_res })
    }
    pub fn ok(&self) -> bool {
        self.mpv && self.yt_dlp
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dep_state() {
        let s = DepsStateFrontend::from_params(false).unwrap();
        assert_eq!(s.mpv, true);
        assert_eq!(s.yt_dlp, true);
        assert_eq!(s.ok(), true);
    }

    #[test]
    fn test_dep_state2() {
        let s = DepsStateFrontend::from_params(true).unwrap();
        assert_eq!(s.mpv, false);
        assert_eq!(s.yt_dlp, false);
        assert_eq!(s.ok(), false);
    }
}