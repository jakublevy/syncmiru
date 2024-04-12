// TODO: put here some html response constants for email links

use axum::response::Html;
use rust_i18n::t;

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
    ", t!("account-verify-ok-content", locale = lang)
        )
    )
}

pub fn err_verify_expired_invalid(lang: &str) -> Html<String> {
    Html(format!("
        <html>
        <head>
            <meta charset=\"UTF-8\">
            <title>{}</title>
        </head>
        <body>
            <h1>{}</h1>
        </body>
        </html>
    ", t!("html-err-title", locale = lang)
     , t!("account-verify-err-content", locale = lang)
    )
    )
}

pub fn err_verify_already_verified(lang: &str) -> Html<String> {
    Html(format!("
        <html>
        <head>
            <meta charset=\"UTF-8\">
            <title>{}</title>
        </head>
        <body>
            <h1>{}</h1>
        </body>
        </html>
    ", t!("html-err-title", locale = lang)
     , t!("account-already-verified-content", locale = lang)
    )
    )
}