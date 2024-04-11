use argon2::password_hash::rand_core::OsRng;
use base64::Engine;
use lettre::{Message, SmtpTransport, Transport};
use lettre::message::header::ContentType;
use rand::RngCore;
use crate::config::EmailConf;
use crate::result::Result;
use rust_i18n::t;

pub async fn send_verification_email(
    email_conf: &EmailConf,
    to: &str,
    tkn: &str,
    lang: &str
) -> Result<()> {
    send_email(
        &email_conf,
        to,
        &t!("email-verify-subject", locale = lang),
        &format!("{} {}", t!("email-verify-body", locale = lang), tkn)
    ).await?;
    Ok(())
}

pub fn gen_tkn() -> String {
    let mut random_bytes = [0u8; 16];
    let mut rnd = OsRng::default();
    rnd.fill_bytes(&mut random_bytes);

    let engine = base64::engine::general_purpose::STANDARD;
    engine.encode(random_bytes)
}

async fn send_email(
    email_conf: &EmailConf,
    to: &str,
    subject: &str,
    body: &str,
) -> Result<()> {
    let email = Message::builder()
        .from(email_conf.from.parse()?)
        .to(to.parse()?)
        .subject(subject)
        .header(ContentType::TEXT_PLAIN)
        .body(String::from(body))?;
    let mailer = SmtpTransport::relay(&email_conf.smtp_host)?
        .port(email_conf.smtp_port)
        .credentials(email_conf.credentials.clone())
        .build();
    mailer.send(&email)?;
    Ok(())
}
