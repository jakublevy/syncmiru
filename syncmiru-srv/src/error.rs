#[derive(thiserror::Error, Debug)]
pub enum SyncmiruError {
    #[error("")]
    CliParseFailed
}
