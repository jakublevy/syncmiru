use std::fs;
use std::path::PathBuf;

use anyhow::Context;
use ini::Ini;

use crate::config::Language::{Czech, English};
use crate::config::Theme::{Dark, Light, System};
use crate::config::utils::*;
use crate::result::Result;

mod utils;

#[derive(Debug)]
pub struct AppData {
    pub first_run_seen: bool,
    pub jwt: Option<String>,
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
    System,
}

impl Theme {
    pub fn from(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "light" => Some(Light),
            "dark" => Some(Dark),
            "system" => Some(System),
            _ => None
        }
    }
    pub fn as_str(&self) -> &'static str {
        match self {
            Light => "light",
            Dark => "dark",
            System => "system"
        }
    }
}

impl Default for AppData {
    fn default() -> Self {
        let syncmiru_data_dir = syncmiru_data_dir();
        AppData {
            first_run_seen: false,
            jwt: None,
            deps_managed: true,
            mpv_path: Some(syncmiru_data_dir.clone().join("mpv")),
            yt_dlp_path: Some(syncmiru_data_dir.clone().join("yt-dlp")),
            theme: Theme::System,
            lang: get_preferred_locale(),
            auto_ready: false,
        }
    }
}

pub fn load_config() -> Result<AppData> {
    let syncmiru_config = syncmiru_config_ini();
    let mut appdata = AppData::default();
    let conf = Ini::load_from_file(syncmiru_config)?;
    let general = conf
        .section(Some("General"))
        .context("Section \"General\" is missing")?;
    let first_run_seen = ini_str_to_bool(
        general.get("first_run_seen").context("first_run_seen property is missing")?
    );
    appdata.first_run_seen = first_run_seen;
    if first_run_seen {
        let dependencies = conf
            .section(Some("Dependencies"))
            .context("Section \"Dependencies\" is missing")?;
        let program = conf
            .section(Some("Program"))
            .context("Section \"Program\" is missing")?;

        let managed = ini_str_to_bool(
            dependencies.get("managed").context("managed property is missing")?
        );
        appdata.deps_managed = managed;
        if managed {
            let mpv_path = PathBuf::from(dependencies.get("mpv_path")
                .context("mpv_path property is missing")?);
            let yt_dlp = PathBuf::from(dependencies.get("yt-dlp_path")
                .context("yt-dlp_path property is missing")?);
            appdata.mpv_path = Some(mpv_path);
            appdata.yt_dlp_path = Some(yt_dlp);
        }

        let lang = Language::from(
            program.get("language").context("language property is missing")?
        ).context("Invalid language property")?;
        let theme = Theme::from(
            program.get("theme").context("theme property is missing")?
        ).context("Invalid theme property")?;
        let auto_ready = ini_str_to_bool(
            program.get("auto_ready").context("auto_ready property is missing")?
        );
        appdata.lang = lang;
        appdata.theme = theme;
        appdata.auto_ready = auto_ready;

        let jwt_res = load_login_jwt();
        if let Ok(jwt) = jwt_res {
            appdata.jwt = Some(jwt);
        }
    }
    Ok(appdata)
}

pub fn write_config(config: &AppData) -> Result<()> {
    let mut conf = Ini::new();
    conf.with_section(Some("General"))
        .set("first_run_seen", ini_bool_to_str(config.first_run_seen));

    let mut deps = conf.with_section(Some("Dependencies"));

    let deps = deps.set("managed", ini_bool_to_str(config.deps_managed));
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
         let deps = deps.set("mpv_path", mpv_str);
         deps.set("yt-dlp_path", yt_dlp_str);
    }
    conf.with_section(Some("Program"))
        .set("language", config.lang.as_str())
        .set("theme", config.theme.as_str())
        .set("auto_ready", ini_bool_to_str(config.auto_ready));

    let syncmiru_conf_ini = syncmiru_config_ini();
    let parent = syncmiru_conf_ini.parent().context("conf.ini has no parent")?;
    if !parent.exists() {
        fs::create_dir_all(parent)?;
    }
    conf.write_to_file(syncmiru_conf_ini)?;
    if let Some(jwt) = &config.jwt {
        write_login_jwt(jwt.as_str())?;
    }
    Ok(())
}

pub fn config_file() -> PathBuf {
    syncmiru_config_ini()
}