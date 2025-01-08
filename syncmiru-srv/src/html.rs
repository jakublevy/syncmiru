//! This module provides pre-defined HTML responses

use axum::response::Html;
use rust_i18n::t;


/// Returns an HTML response for a successful email verification.
///
/// # Arguments
/// - `lang`: A string slice representing the language code (e.g., "en", "cs") for localization.
pub fn ok_verified(lang: &str) -> Html<String> {
    Html(format!("
        <html>
        <head>
            <meta charset=\"UTF-8\">
            <title>OK</title>
        </head>
        <body>
            <h1>{}</h1>
        </body>
        </html>
    ", t!("email-verify-ok-content", locale = lang)
        )
    )
}
