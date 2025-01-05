use std::fs;
use anyhow::Context;
use ini::Ini;
use crate::config::Language;
use crate::result::Result;
use crate::files::syncmiru_config_ini;
use crate::config::Theme;
use crate::config::utils::{get_preferred_locale, ini_bool_to_string, ini_str_to_bool};

#[derive(Debug)]
pub struct AppData {
    pub first_run_seen: bool,
    pub home_srv: Option<String>,
    pub deps_managed: bool,
    pub mpv_version: Option<String>,
    pub yt_dlp_version: Option<String>,
    pub lang: Language,
    pub theme: Theme,
    pub users_shown: bool,
    pub audio_sync: bool,
    pub sub_sync: bool,
    pub mpv_win_detached: bool
}

impl Default for AppData {
    fn default() -> Self {
        Self {
            first_run_seen: false,
            home_srv: None,
            deps_managed: false,
            mpv_version: None,
            yt_dlp_version: None,
            theme: Theme::Auto,
            lang: get_preferred_locale(),
            users_shown: true,
            audio_sync: true,
            sub_sync: true,
            mpv_win_detached: false
        }
    }
}

pub fn read() -> Result<AppData> {
    let syncmiru_config = syncmiru_config_ini()?;
    let mut appdata = AppData::default();

    if syncmiru_config.exists() {
        let conf = Ini::load_from_file(syncmiru_config)?;
        let settings_opt = conf.section(Some("Settings"));
        if let Some(settings) = settings_opt {
            let first_run_seen_opt = settings.get("first_run_seen");
            if let Some(first_run_seen) = first_run_seen_opt {
                appdata.first_run_seen = ini_str_to_bool(first_run_seen, false);
            }

            let home_srv = settings.get("home_srv");
            appdata.home_srv = home_srv.map(|s| s.to_string());

            let lang_opt = settings.get("language");
            if let Some(lang_s) = lang_opt {
                let lang = Language::from(lang_s);
                appdata.lang = lang;
            }
            rust_i18n::set_locale(appdata.lang.as_str());

            let theme_opt = settings.get("theme");
            if let Some(theme_s) = theme_opt {
                let theme = Theme::from(theme_s);
                appdata.theme = theme;
            }

            let users_shown_opt = settings.get("users_shown");
            if let Some(users_shown) = users_shown_opt {
                appdata.users_shown = ini_str_to_bool(users_shown, true);
            }

            let audio_sync_opt = settings.get("audio_sync");
            if let Some(audio_sync) = audio_sync_opt {
                appdata.audio_sync = ini_str_to_bool(audio_sync, true);
            }

            let sub_sync_opt = settings.get("sub_sync");
            if let Some(sub_sync) = sub_sync_opt {
                appdata.sub_sync = ini_str_to_bool(sub_sync, true);
            }

            let mpv_win_detached_opt = settings.get("mpv_win_detached");
            if let Some(mpv_win_detached) = mpv_win_detached_opt {
                appdata.mpv_win_detached = ini_str_to_bool(mpv_win_detached, false);
            }
        }

        if cfg!(target_family = "windows") {
            let windows_opt = conf.section(Some("Windows"));
            if let Some(windows) = windows_opt {
                let deps_managed_opt = windows.get("deps_managed");
                if let Some(deps_managed) = deps_managed_opt {
                    appdata.deps_managed = ini_str_to_bool(deps_managed, true);
                    if appdata.deps_managed {
                        let mpv_version = windows
                            .get("mpv_version")
                            .context("mpv_version is missing")?;

                        appdata.mpv_version = Some(mpv_version.to_string());

                        let yt_dlp_version = windows
                            .get("yt-dlp_version")
                            .context("yt-dlp_version is missing")?;

                        appdata.yt_dlp_version = Some(yt_dlp_version.to_string());
                    }
                }
            }
        }
    }
    Ok(appdata)
}

pub fn write(config: &AppData) -> Result<()> {
    let mut ini = Ini::new();
    let mut settings = &mut ini.with_section(Some("Settings"));
    settings = settings.set("first_run_seen", ini_bool_to_string(config.first_run_seen));
    if let Some(srv) = &config.home_srv {
        settings = settings.set("home_srv", srv);
    }
    settings = settings.set("language", config.lang.as_str());
    settings = settings.set("theme", config.theme.as_str());
    settings = settings.set("users_shown", ini_bool_to_string(config.users_shown));
    settings = settings.set("audio_sync", ini_bool_to_string(config.audio_sync));
    settings = settings.set("sub_sync", ini_bool_to_string(config.sub_sync));
    settings = settings.set("mpv_win_detached", ini_bool_to_string(config.mpv_win_detached));

    if cfg!(target_family = "windows") {
        let mut windows = &mut ini.with_section(Some("Windows"));
        windows = windows.set("deps_managed", ini_bool_to_string(config.deps_managed));
        if config.deps_managed {
            let mpv_version = config.mpv_version
                .clone()
                .context("mpv_version is missing")?;
            let yt_dlp_version = config.yt_dlp_version
                .clone()
                .context("yt-dlp_version is missing")?;

            windows = windows.set("mpv_version", mpv_version);
            windows.set("yt-dlp_version", yt_dlp_version);
        }
    }

    let syncmiru_conf_ini = syncmiru_config_ini()?;
    let parent = syncmiru_conf_ini.parent().context("conf.ini has no parent")?;
    if !parent.exists() {
        fs::create_dir_all(parent)?;
    }
    ini.write_to_file(syncmiru_conf_ini)?;
    Ok(())
}