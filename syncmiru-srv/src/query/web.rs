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