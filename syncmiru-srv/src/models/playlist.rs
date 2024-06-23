#[derive(Debug, Clone)]
pub struct PlaylistFile {
    pub entry: PlaylistEntry,
    //pub subtitles: Vec<SubtitlesEntry>
}

#[derive(Debug, Clone)]
pub enum PlaylistEntry {
    Video { source: String, path: String },
    Url { url: String }
}

// #[derive(Debug, Clone)]
// pub struct SubtitlesEntry {
//     pub source: String,
//     pub path: String,
// }