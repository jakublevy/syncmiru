use ::log::{debug, error};
use clap::Parser;
use crate::args::Args;
use crate::config::read_config;
use crate::log::setup_logger;
use crate::result::Result;

mod error;
mod result;
mod args;
mod config;
mod srvstate;
mod log;

fn main() -> Result<()> {
   let args = Args::parse()?;
   let config = read_config(args.config_file)?;
   setup_logger(config.log)?;
   error!("Tohle je test erroru");
   debug!("Tohle je test debugu");
   // TODO: setup logging based on config
   // TODO: create web server
   // TODO: connect to DB
   // TODO: bootstrap DB
   // TODO: create socket io connection
   Ok(())
}
