use std::path::PathBuf;
use std::process::{Command, Output};
use anyhow::Context;
use serde::{Serialize, Serializer};
use crate::result::Result;
use crate::config::appdata::AppData;

pub struct DepsInfo {
    mpv_version: Option<String>,
    yt_dlp_version: Option<String>
}

#[derive(Serialize)]
pub struct DepsStateFrontend {
    mpv: bool,
    yt_dlp: bool
}

impl DepsInfo {
    pub fn from_appdata(appdata: &AppData) -> Result<Self> {
        Self::from_params(appdata.deps_managed, &appdata.mpv_path, &appdata.yt_dlp_path)
    }
    pub fn from_params(deps_managed: bool, mpv_path: &Option<PathBuf>, yt_dlp_path: &Option<PathBuf>) -> Result<Self> {
        let mut mpv = "mpv".to_string();
        let mut yt_dlp = "yt-dlp".to_string();
        if deps_managed {
            mpv = mpv_path
                .clone()
                .context("mpv_path is missing")?
                .join(PathBuf::from("mpv.exe"))
                .to_string_lossy()
                .to_string();

            yt_dlp = yt_dlp_path
                .clone()
                .context("yt_dlp_path is missing")?
                .join(PathBuf::from("yt-dlp.exe"))
                .to_string_lossy()
                .to_string();
        }
        let mut mpv_v: Option<String> = None;
        let mut yt_dlp_v: Option<String> = None;

        let mpv_output_r = Command::new(mpv)
            .arg("--version")
            .output();
        if let Ok(mpv_output) = mpv_output_r {
            let mpv_stdout_output = String::from_utf8_lossy(mpv_output.stdout.as_slice());
            let mpv_version = mpv_stdout_output
                .split_whitespace()
                .skip(1)
                .take(1)
                .collect::<String>();

            mpv_v = Some(mpv_version);
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

            yt_dlp_v = Some(yt_dlp_version);
        }

        // let mpv_output: Output = Command::new(mpv)
        //     .arg("--version")
        //     .output()?;
        // let mpv_stdout_output = String::from_utf8_lossy(mpv_output.stdout.as_slice());
        // let mpv_version = mpv_stdout_output
        //     .split_whitespace()
        //     .skip(1)
        //     .take(1)
        //     .collect::<String>();
        //
        // let yt_dlp_output: Output = Command::new(yt_dlp)
        //     .arg("--version")
        //     .output()?;
        // let yt_dlp_stdout_output = String::from_utf8_lossy(yt_dlp_output.stdout.as_slice());
        // let yt_dlp_version = yt_dlp_stdout_output
        //     .strip_suffix("\r\n")
        //     .or(yt_dlp_stdout_output.strip_suffix("\n"))
        //     .unwrap_or(yt_dlp_stdout_output.as_ref());
       // Ok(DepsState { mpv_version: Some(mpv_version), yt_dlp_version: Some(yt_dlp_version.to_string()) })
        Ok(DepsInfo { mpv_version: mpv_v, yt_dlp_version: yt_dlp_v })
    }
    pub fn mpv_ok(&self) -> bool {
        return self.mpv_version.is_some()
    }
    pub fn yt_dlp_ok(&self) -> bool {
        return self.yt_dlp_version.is_some()
    }
    pub fn ok(&self) -> bool {
        return self.mpv_ok() && self.yt_dlp_ok()
    }
    pub fn to_frontend(&self) -> DepsStateFrontend {
        DepsStateFrontend { mpv: self.mpv_ok(), yt_dlp: self.yt_dlp_ok() }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dep_state() {
        let s = DepsInfo::from_params(false, &None, &None).unwrap();
        assert_eq!(s.mpv_version.clone().unwrap(), "1c9c2f5");
        assert_eq!(s.yt_dlp_version.clone().unwrap(), "2024.03.10");
        assert!(s.ok());
    }

    #[test]
    fn test_dep_state2() {
        let s = DepsInfo::from_params(
            true,
            &Some(PathBuf::from("C:\\ProgramData\\chocolatey\\lib\\mpv.install\\tools")),
            &Some(PathBuf::from("C:\\ProgramData\\chocolatey\\lib\\yt-dlp\\tools\\x64"))).unwrap();
        assert_eq!(s.mpv_version.clone().unwrap(), "1c9c2f5");
        assert_eq!(s.yt_dlp_version.clone().unwrap(), "2024.03.10");
        assert!(s.ok());
    }

    #[test]
    fn test_dep_state3() {
        let s = DepsInfo::from_params(
            true,
            &Some(PathBuf::from("C:\\ProgramData\\chocolatey\\")),
            &Some(PathBuf::from("C:\\ProgramData\\chocolatey\\lib"))).unwrap();
        assert_eq!(s.mpv_version.clone(), None);
        assert_eq!(s.yt_dlp_version.clone(), None);
        assert!(!s.ok());
    }
}