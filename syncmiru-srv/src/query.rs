use sqlx::PgPool;
use crate::models::query::EmailTknType;
use crate::result::Result;

pub async fn username_unique(db: &PgPool, username: &str) -> Result<bool> {
    let unique: (bool, ) = sqlx::query_as("select COUNT(*) = 0 from users where username = $1 limit 1")
        .bind(username.to_string())
        .fetch_one(db).await?;

    Ok(unique.0)
}

pub async fn email_unique(db: &PgPool, email: &str) -> Result<bool> {
    let unique: (bool, ) = sqlx::query_as("select COUNT(*) = 0 from users where email = $1 limit 1")
        .bind(email.to_string())
        .fetch_one(db).await?;

    Ok(unique.0)
}

pub async fn new_user(
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
    let unverified: (bool,) = sqlx::query_as("select COUNT(*) = 1 from users where email = $1 and verified = FALSE limit 1")
        .bind(email)
        .fetch_one(db).await?;
    Ok(unverified.0)
}

pub async fn user_id_from_email(
    db: &PgPool,
    email: &str
) -> Result<Option<i32>> {
    if let Some(uid) = sqlx::query_as::<_, (i32,)>("select id from users where email = $1 limit 1")
        .bind(email)
        .fetch_optional(db).await? {
        Ok(Some(uid.0))
    }
    else {
        Ok(None)
    }
}

pub async fn out_of_email_tkn_quota(
    db: &PgPool,
    uid: i32,
    email_type: &EmailTknType,
    max: i64,
    interval: i64,
) -> Result<bool> {
    let query = r#"
        select COUNT(*) >= $1 from email_tkn_log
        inner join users on users.id = email_tkn_log.user_id
        where
        users.id = $2
        and email_tkn_log.reason = $3
        and email_tkn_log.sent_at > now() - interval '1 seconds' * $4
        limit 1
    "#;
    let out_of_quota: (bool,) = sqlx::query_as(query)
        .bind(max)
        .bind(uid)
        .bind(email_type)
        .bind(interval)
        .fetch_one(db).await?;
    Ok(out_of_quota.0)
}

pub async fn waited_before_last_email_tkn(
    db: &PgPool,
    uid: i32,
    email_type: &EmailTknType,
    wait_before_resend: i64
) -> Result<bool> {
    let query = r#"
        select count(*) = 0 from email_tkn_log
        where
        user_id = $1
        and reason = $2
        and sent_at >= now() - interval '1 seconds' * $3
        limit 1
    "#;
    let waited: (bool, ) = sqlx::query_as(query)
        .bind(uid)
        .bind(email_type)
        .bind(wait_before_resend)
        .fetch_one(db)
        .await?;
    Ok(waited.0)
}

pub async fn new_email_tkn(
    db: &PgPool,
    uid: i32,
    email_type: EmailTknType,
    hash: &str,
) -> Result<()> {
    sqlx::query(r#"insert into email_tkn_log (reason, hash, user_id)
                       values ($1, $2, $3) limit 1"#)
        .bind(email_type)
        .bind(hash)
        .bind(uid)
        .execute(db).await?;
    Ok(())
}

pub async fn get_valid_hashed_tkn(
    db: &PgPool,
    uid: i32,
    email_type: EmailTknType,
    valid_time: i64
) -> Result<Option<String>> {
    let query = r#"
        select hash from email_tkn_log
        where
        user_id = $1
        and reason = $2
        and sent_at > now() - interval '1 seconds' * $3
        order by sent_at desc
        limit 1
    "#;
    if let Some(hash) = sqlx::query_as::<_, (String,)>(query)
        .bind(uid)
        .bind(email_type)
        .bind(valid_time)
        .fetch_optional(db).await? {
        Ok(Some(hash.0))
    }
    else {
        Ok(None)
    }
}

pub async fn get_verified_unsafe(
    db: &PgPool,
    uid: i32
) -> Result<bool> {
    let is_verified: (bool,) = sqlx::query_as("select verified from users where id = $1 limit 1")
        .bind(uid)
        .fetch_one(db).await?;
    Ok(is_verified.0)
}

pub async fn set_verified(db: &PgPool, uid: i32) -> Result<()> {
    sqlx::query("update users set verified = TRUE where id = $1")
        .bind(uid)
        .execute(db).await?;
    Ok(())
}

pub async fn email_verified(db: &PgPool, email: &str) -> Result<Option<bool>> {
    if let Some(verified) = sqlx::query_as::<_, (bool,)>("select verified from users where email = $1 limit 1")
        .bind(email)
        .fetch_optional(db).await? {
        Ok(Some(verified.0))
    }
    else {
        Ok(None)
    }
}

pub async fn set_user_hash(db: &PgPool, uid: i32, hash: &str) -> Result<()> {
    sqlx::query("update users set hash = $1 where id = $2")
        .bind(hash)
        .bind(uid)
        .execute(db).await?;
    Ok(())
}

pub async fn get_user_hash_unsafe(db: &PgPool, uid: i32) -> Result<String> {
    let hash: (String, ) = sqlx::query_as("select hash from users where id = $1 limit 1")
        .bind(uid)
        .fetch_one(db).await?;
    Ok(hash.0)
}

pub async fn new_session(
    db: &PgPool,
    os: &str,
    device_name: &str,
    hash: &str,
    uid: i32
) -> Result<()> {
    let query = r#"
    insert into session (os, device_name, hash, user_id)
    values ($1, $2, $3, $4)
    "#;
    sqlx::query(query)
        .bind(os)
        .bind(device_name)
        .bind(hash)
        .bind(uid)
        .execute(db).await?;
    Ok(())
}

pub async fn update_session(
    db: &PgPool,
    os: &str,
    device_name: &str,
    hash: &str,
) -> Result<()> {
    let query = r#"
    update session
    set os = $1, device_name = $2, last_access_at = now()
    where hash = $3
    "#;
    sqlx::query(query)
        .bind(os)
        .bind(device_name)
        .bind(hash)
        .execute(db)
        .await?;
    Ok(())
}

pub async fn session_valid(
    db: &PgPool,
    jwt: &str,
) -> Result<bool> {
    let allowed: (bool,) = sqlx::query_as("select count(*) = 0 from session_deleted where jwt = $1 limit 1")
        .bind(jwt)
        .fetch_one(db)
        .await?;
    Ok(allowed.0)

}

pub async fn exists_session_with_hwid(db: &PgPool, hwid_hash: &str) -> Result<bool> {
    let exists: (bool, ) = sqlx::query_as("select count(*) > 0 from session where hash = $1 limit 1")
        .bind(hwid_hash)
        .fetch_one(db)
        .await?;
    Ok(exists.0)
}