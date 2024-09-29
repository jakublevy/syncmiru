use lettre::{Transport};
use crate::config::EmailConf;
use crate::result::Result;
use rust_i18n::{t};
use crate::models::query::Id;

pub async fn send_verification_email(
    email_conf: &EmailConf,
    to: &str,
    tkn: &str,
    uid: Id,
    srv_url: &str,
    lang: &str
) -> Result<()> {
    #[derive(serde::Serialize)]
    struct Params {
        tkn: String,
        uid: Id,
        lang: String
    }
    let params = Params { tkn: tkn.to_string(), uid, lang: lang.to_string() };
    let encoded_params = serde_urlencoded::to_string(params)?;

    let mut url = join_url(srv_url, "email-verify");
    url += &format!("?{}", encoded_params);
    let a = format!("<a href=\"{}\">{}</a>", url, url);
    send_email(
        email_conf,
        to,
        srv_url,
        &t!("email-verify-subject", locale = lang),
        &format!("{} {}", t!("email-verify-body", locale = lang), a)
    ).await?;
    Ok(())
}

pub async fn send_change_emails(
    email_conf: &EmailConf,
    to_old: &str,
    tkn_to_old: &str,
    to_new: &str,
    tkn_to_new: &str,
    srv_url: &str,
    lang: &str
) -> Result<()> {
    send_email(
        email_conf,
        to_old,
        srv_url,
        &t!("email-change-tkn-subject", locale = lang),
        &format!("{} {}{} {}", t!("email-change-from-tkn-body-1", locale = lang), to_new, t!("email-change-from-tkn-body-2", locale = lang), tkn_to_old)
    ).await?;

    send_email(
        email_conf,
        to_new,
        srv_url,
        &t!("email-change-tkn-subject", locale = lang),
        &format!("{} {}", t!("email-change-to-tkn-body", locale = lang), tkn_to_new)
    ).await?;
    Ok(())
}


pub async fn send_forgotten_password_email(
    email_conf: &EmailConf,
    to: &str,
    tkn: &str,
    srv_url: &str,
    lang: &str
) -> Result<()> {
    send_email(
        email_conf,
        to,
        srv_url,
        &t!("forgotten-password-subject", locale = lang),
        &format!("{} {}", t!("forgotten-password-body", locale = lang), tkn)
    ).await?;
    Ok(())
}

pub async fn send_password_changed_warning(
    email_conf: &EmailConf,
    to: &str,
    srv_url: &str,
    lang: &str
) -> Result<()> {
    send_email(
        &email_conf,
        to,
        srv_url,
        &t!("password-changed-subject", locale = lang),
        &t!("password-changed-body", locale = lang)
    ).await?;
    Ok(())
}

pub async fn send_email_changed_warning(
    email_conf: &EmailConf,
    to: &str,
    srv_url: &str,
    new_email: &str,
    username: &str,
    lang: &str
) -> Result<()> {
    send_email(
        &email_conf,
        to,
        srv_url,
        &t!("email-change-subject", locale = lang),
        &format!("{} {} {} {} {} {}",
                &t!("email-change-body-1", locale = lang),
                username,
                &t!("email-change-body-2", locale = lang),
                to,
                &t!("email-change-body-3", locale = lang),
                new_email
        )
    ).await?;
    Ok(())
}

pub async fn send_delete_account_email(
    email_conf: &EmailConf,
    to: &str,
    tkn: &str,
    srv_url: &str,
    lang: &str
) -> Result<()> {
    send_email(
        &email_conf,
        to,
        srv_url,
        &t!("delete-account-subject", locale = lang),
        &format!("{} {}", &t!("delete-account-body", locale = lang), tkn)
    ).await?;
    Ok(())
}

pub async fn send_account_deleted_email_warning(
    email_conf: &EmailConf,
    to: &str,
    username: &str,
    srv_url: &str,
    lang: &str
) -> Result<()> {
    send_email(
        &email_conf,
        to,
        srv_url,
        &t!("account-deleted-subject", locale = lang),
        &format!("{} {}", t!("account-deleted-body", locale = lang), username)
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
    println!("EMAIL\n---------------------------------");
    println!("{}", body);
    // let email = Message::builder()
    //     .from(email_conf.from.parse()?)
    //     .to(to.parse()?)
    //     .subject(subject)
    //     .header(ContentType::TEXT_HTML)
    //     .body(String::from(format!("{}<br/><br/>Syncmiru<br/>{}", body, srv_url)))?;
    // let mailer = SmtpTransport::relay(&email_conf.smtp_host)?
    //     .port(email_conf.smtp_port)
    //     .credentials(email_conf.credentials.clone())
    //     .build();
    // mailer.send(&email)?;
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