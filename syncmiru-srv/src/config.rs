use std::path::PathBuf;

pub struct Config {
    reg_allowed: bool,
    port: u16,
    db_connection_str: String,
    log: LogConfig,
}

struct LogConfig {
    output: LogOutput,
    level: LogLevel,
}

enum LogOutput {
    File(PathBuf),
    Stdout,
    StdErr
}

enum LogLevel {
    Error, Warn, Info, Debug, Trace
}

struct EmailConf {
    smtp_host: String,
    smtp_port: u16,
    username: String,
    password: String,
    from_mail: String,
    security: String
}