use std::fs;
use std::sync::RwLock;
use anyhow::Context;
use ini::Ini;
use crate::config::Language;
use crate::result::Result;
use crate::files::syncmiru_config_ini;
use crate::config::Theme;
use crate::config::utils::{get_preferred_locale, ini_bool_to_string, ini_str_to_bool};

pub struct AppData {
    pub first_run_seen: bool,
    pub home_srv: Option<String>,
    pub deps_managed: bool,
    pub mpv_version: Option<String>,
    pub yt_dlp_version: Option<String>,
    pub lang: Language,
    pub theme: Theme,
    pub auto_ready: bool,
}

impl Default for AppData {
    fn default() -> Self {
        Self {
            first_run_seen: false,
            home_srv: None,
            deps_managed: false,
            mpv_version: None,
            yt_dlp_version: None,
            theme: Theme::System,
            lang: get_preferred_locale(),
            auto_ready: false,
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
    settings.set("auto_ready", ini_bool_to_string(config.auto_ready));

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

pub mod extract {
    use std::sync::RwLock;
    use crate::config::appdata::AppData;

    pub fn home_srv(appdata: &RwLock<AppData>) -> crate::result::Result<String> {
        let mut home_srv: String;
        {
            let appdata = appdata.read()?;
            home_srv = appdata.home_srv.clone().unwrap_or("".to_string());
        }
        Ok(home_srv)
    }
}
