struct DepsState {
    mpv_version: Option<String>,
    yt_dlp_version: Option<String>
}

impl DepsState {
    fn mpv_ok(&self) -> bool {
        return self.mpv_version.is_some()
    }
    fn yt_dlp_ok(&self) -> bool {
        return self.yt_dlp_version.is_some()
    }
    fn ok(&self) -> bool {
        return self.mpv_ok() && self.yt_dlp_ok()
    }
}