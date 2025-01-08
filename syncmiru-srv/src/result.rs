//! This module defines the `Result` type alias used throughout the project.

/// A type alias for the standard `Result` type used throughout the project.
pub type Result<T> = std::result::Result<T, crate::error::SyncmiruError>;