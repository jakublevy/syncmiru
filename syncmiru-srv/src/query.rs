use sqlx::PgPool;
use crate::models::query::EmailTknType;
use crate::result::Result;

pub async fn username_unique(db: &PgPool, username: &str) -> Result<bool> {
    let unique: (bool, ) = sqlx::query_as("select COUNT(*) = 0 from users where username = $1")
        .bind(username.to_string())
        .fetch_one(db).await?;

    Ok(unique.0)
}

pub async fn email_unique(db: &PgPool, email: &str) -> Result<bool> {
    let unique: (bool, ) = sqlx::query_as("select COUNT(*) = 0 from users where email = $1")
        .bind(email.to_string())
        .fetch_one(db).await?;

    Ok(unique.0)
}

pub async fn new_account(
    db: &PgPool,
    username: &str,
    displayname: &str,
    email: &str,
    hash: &str
) -> Result<()> {
    sqlx::query("INSERT INTO public.users(username, display_name, email, hash, reg_tkn_id) VALUES ($1, $2, $3, $4, NULL)")
        .bind(username)
        .bind(displayname)
        .bind(email)
        .bind(hash)
        .execute(db).await?;
    Ok(())
}

pub async fn unverified_account_exist(db: &PgPool, email: &str) -> Result<bool> {
    let unverified: (bool,) = sqlx::query_as("select COUNT(*) = 1 from users where email = $1 and verified = FALSE")
        .bind(email)
        .fetch_one(db).await?;
    Ok(unverified.0)
}

pub async fn out_of_email_quota(
    db: &PgPool,
    email: &str,
    email_type: EmailTknType,
    max: i64,
    interval: i64,
) -> Result<bool> {
    let query = r#"
        select COUNT(*) > $1 from email_tkn_log
        inner join users on users.id = email_tkn_log.user_id
        where
        users.email = $2
        and email_tkn_log.reason = $3
        and email_tkn_log.sent_at > now() - interval '1 seconds' * $4
    "#;
    let out_of_quota: (bool,) = sqlx::query_as(query)
        .bind(max)
        .bind(email)
        .bind(email_type)
        .bind(interval)
        .fetch_one(db).await?;
    Ok(out_of_quota.0)
}

pub async fn new_email_tkn(
    db: &PgPool,
    email: &str,
    email_type: EmailTknType,
    hash: &str,
) -> Result<()> {
    let user_id: (i32, ) = sqlx::query_as("select id from users where email = $1")
        .bind(email)
        .fetch_one(db).await?;

    sqlx::query(r#"insert into email_tkn_log (reason, hash, user_id)
                       values ($1, $2, $3)"#)
        .bind(email_type)
        .bind(hash)
        .bind(user_id.0)
        .execute(db).await?;
    Ok(())
}