use base64::Engine;
use lettre::{Message, SmtpTransport, Transport};
use lettre::message::header::ContentType;
use crate::config::EmailConf;
use crate::result::Result;
use rust_i18n::t;

pub async fn send_verification_email(
    email_conf: &EmailConf,
    to: &str,
    tkn: &str,
    srv_url: &str,
    lang: &str
) -> Result<()> {
    let mut url = join_url(srv_url, "email-verify");
    url = format!("{}?tkn={}&lang={}", url, tkn, lang);
    let a = format!("<a href=\"{}\">{}</a>", url, url);
    send_email(
        &email_conf,
        to,
        srv_url,
        &t!("email-verify-subject", locale = lang),
        &format!("{} {}", t!("email-verify-body", locale = lang), a)
    ).await?;
    Ok(())
}



async fn send_email(
    email_conf: &EmailConf,
    to: &str,
    srv_url: &str,
    subject: &str,
    body: &str,
) -> Result<()> {
    let email = Message::builder()
        .from(email_conf.from.parse()?)
        .to(to.parse()?)
        .subject(subject)
        .header(ContentType::TEXT_HTML)
        .body(String::from(format!("{}<br/><br/>Syncmiru<br/>{}", body, srv_url)))?;
    let mailer = SmtpTransport::relay(&email_conf.smtp_host)?
        .port(email_conf.smtp_port)
        .credentials(email_conf.credentials.clone())
        .build();
    mailer.send(&email)?;
    Ok(())
}

fn join_url(url1: &str, url2: &str) -> String {
    if url1.ends_with("/") {
        format!("{}{}", url1, url2)
    }
    else {
        format!("{}/{}", url1, url2)
    }
}