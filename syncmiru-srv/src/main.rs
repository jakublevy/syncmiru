use std::path::PathBuf;
use clap::Parser;
use crate::args::Args;

mod error;
mod result;
mod args;
mod config;

fn main() {
   let args = Args::parse();
}
