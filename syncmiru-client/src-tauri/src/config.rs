use std::fs;
use std::path::PathBuf;

use anyhow::Context;
use ini::Ini;

use crate::config::Language::{Czech, English};
use crate::config::Theme::{Dark, Light, Auto};
use crate::config::utils::*;
use crate::result::Result;

mod utils;

#[derive(Debug)]
pub struct AppData {
    pub first_run_seen: bool,
    pub jwt: Option<String>,
    pub home_srv: Option<String>,
    pub deps_managed: bool,
    pub mpv_path: Option<PathBuf>,
    pub yt_dlp_path: Option<PathBuf>,
    pub lang: Language,
    pub theme: Theme,
    pub auto_ready: bool,
}

#[derive(Debug)]
pub enum Language {
    Czech,
    English,
}

impl Language {
    pub fn from(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "czech" => Some(Czech),
            "english" => Some(English),
            _ => None
        }
    }
    pub fn as_str(&self) -> &'static str {
        match self {
            Czech => "czech",
            English => "english"
        }
    }
}

#[derive(Debug)]
pub enum Theme {
    Light,
    Dark,
    Auto,
}

impl Theme {
    pub fn from(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "light" => Some(Light),
            "dark" => Some(Dark),
            "auto" => Some(Auto),
            _ => None
        }
    }
    pub fn as_str(&self) -> &'static str {
        match self {
            Light => "light",
            Dark => "dark",
            Auto => "auto"
        }
    }
}

impl Default for AppData {
    fn default() -> Self {
        let syncmiru_data_dir = syncmiru_data_dir();

        let mut mpv_path: Option<PathBuf> = None;
        let mut yt_dlp_path: Option<PathBuf> = None;
        let mut deps_managed: bool = false;
        if cfg!(target_family = "windows") {
            deps_managed = true;
            mpv_path = Some(syncmiru_data_dir.clone().join("mpv"));
            yt_dlp_path = Some(syncmiru_data_dir.clone().join("yt-dlp"));
        }
        AppData {
            first_run_seen: false,
            jwt: None,
            home_srv: None,
            deps_managed,
            mpv_path,
            yt_dlp_path,
            theme: Theme::Auto,
            lang: get_preferred_locale(),
            auto_ready: false,
        }
    }
}

pub fn read_config() -> Result<AppData> {
    let syncmiru_config = syncmiru_config_ini();
    let mut appdata = AppData::default();
    let conf = Ini::load_from_file(syncmiru_config)?;

    let settings_opt = conf.section(Some("Settings"));
    if let Some(settings) = settings_opt {
        let first_run_seen_opt = settings.get("first_run_seen");
        if let Some(first_run_seen) = first_run_seen_opt {
            appdata.first_run_seen = ini_str_to_bool(first_run_seen, false);
        }

        let home_srv = settings.get("home_srv");
        appdata.home_srv = home_srv.map(|s|s.to_string());

        let lang_opt = settings.get("language");
        if let Some(lang_s) = lang_opt {
            let lang_opt = Language::from(lang_s);
            if let Some(lang) = lang_opt {
                appdata.lang = lang;
            }
        }

        let theme_opt = settings.get("theme");
        if let Some(theme_s) = theme_opt {
            let theme_opt = Theme::from(theme_s);
            if let Some(theme) = theme_opt {
                appdata.theme = theme;
            }
        }

        let auto_ready_opt = settings.get("auto_ready");
        if let Some(auto_ready) = auto_ready_opt {
            appdata.auto_ready = ini_str_to_bool(auto_ready, false);
        }
    }

    if cfg!(target_family = "windows") {
        let windows_opt = conf.section(Some("Windows"));
        if let Some(windows) = windows_opt {
            let deps_managed_opt = windows.get("deps_managed");
            if let Some(deps_managed) = deps_managed_opt {
                appdata.deps_managed = ini_str_to_bool(deps_managed, true);
                let mpv_path_opt = windows.get("mpv_path").map(|s| PathBuf::from(s));
                let yt_dlp_path_opt = windows.get("yt-dlp_path").map(|s| PathBuf::from(s));
                appdata.mpv_path = mpv_path_opt;
                appdata.yt_dlp_path = yt_dlp_path_opt;
            }
        }
    }

    Ok(appdata)
}

pub fn write_config(config: &AppData) -> Result<()> {
    let mut ini = Ini::new();
    let mut settings = &mut ini.with_section(Some("Settings"));
    settings = settings.set("first_run_seen", ini_bool_to_string(config.first_run_seen));
    if let Some(srv) = &config.home_srv {
        settings = settings.set("home_srv", srv);
    }
    settings = settings.set("language", config.lang.as_str());
    settings = settings.set("theme", config.theme.as_str());
    settings = settings.set("auto_ready", ini_bool_to_string(config.auto_ready));

    if cfg!(target_family = "windows") {
        let mut windows = &mut ini.with_section(Some("Windows"));
        windows = windows.set("deps_managed", ini_bool_to_string(config.deps_managed));
        if config.deps_managed {
            let mpv_path_cpy = config.mpv_path
                .clone()
                .context("mpv_path is missing")?;
            let mpv_str = mpv_path_cpy
                .to_str()
                .context("mpv_path is missing")?;
            let yt_dlp_cpy = config.yt_dlp_path
                .clone()
                .context("yt-dlp_path is missing")?;
            let yt_dlp_str = yt_dlp_cpy
                .to_str()
                .context("yt-dlp_path is missing")?;

            windows = windows.set("mpv_path", mpv_str);
            windows = windows.set("yt-dlp_path", yt_dlp_str);
        }
    }

    let syncmiru_conf_ini = syncmiru_config_ini();
    let parent = syncmiru_conf_ini.parent().context("conf.ini has no parent")?;
    if !parent.exists() {
        fs::create_dir_all(parent)?;
    }
    ini.write_to_file(syncmiru_conf_ini)?;
    if let Some(jwt) = &config.jwt {
        write_login_jwt(jwt.as_str())?;
    }
    Ok(())
}
