use sqlx::PgPool;
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

pub async fn new_user(
    db: &PgPool,
    username: &str,
    displayname: &str,
    email: &str,
    hash: &str
) -> Result<()> {
    sqlx::query("INSERT INTO public.users(username, display_name, email, hash, reg_tkn_id, verified) VALUES ($1, $2, $3, $4, NULL, FALSE)")
        .bind(username)
        .bind(displayname)
        .bind(email)
        .bind(hash)
        .execute(db).await?;
    Ok(())
}