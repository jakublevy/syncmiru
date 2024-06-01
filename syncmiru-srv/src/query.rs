use rust_decimal::Decimal;
use sqlx::{Executor, PgPool, Postgres, Transaction};
use crate::models::User;
use crate::models::query::{EmailTknType, Id, RegDetail, RegTkn, Room, RoomSettings};
use crate::models::query::UserSession;
use crate::models::socketio::DesyncTolerance;
use crate::result::Result;

pub async fn username_unique(db: &PgPool, username: &str) -> Result<bool> {
    let unique: (bool, ) = sqlx::query_as("select COUNT(*) = 0 from users where username = $1 limit 1")
        .bind(username)
        .fetch_one(db).await?;

    Ok(unique.0)
}

pub async fn email_unique(db: &PgPool, email: &str) -> Result<bool> {
    let unique: (bool, ) = sqlx::query_as("select COUNT(*) = 0 from users where email = $1 limit 1")
        .bind(email)
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
    sqlx::query("INSERT INTO users (username, display_name, email, hash, reg_tkn_id) VALUES ($1, $2, $3, $4, NULL)")
        .bind(username)
        .bind(displayname)
        .bind(email)
        .bind(hash)
        .execute(db)
        .await?;
    Ok(())
}

pub async fn new_user_w_reg_tkn(
    db: &mut Transaction<'_, Postgres>,
    username: &str,
    displayname: &str,
    email: &str,
    hash: &str,
    reg_tkn_id: Id
) -> Result<()> {
    sqlx::query("INSERT INTO users (username, display_name, email, hash, reg_tkn_id) VALUES ($1, $2, $3, $4, $5)")
        .bind(username)
        .bind(displayname)
        .bind(email)
        .bind(hash)
        .bind(reg_tkn_id)
        .execute(&mut **db)
        .await?;
    Ok(())
}

pub async fn user_id_from_email(
    db: &PgPool,
    email: &str
) -> Result<Option<Id>> {
    if let Some(uid) = sqlx::query_as::<_, (Id,)>("select id from users where email = $1 limit 1")
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
    uid: Id,
    email_type: &EmailTknType,
    max: i64,
    interval: i64,
) -> Result<bool> {
    let query = r#"
        select COUNT(*) >= $1 from email_tkn_log
        where
        user_id = $2
        and reason = $3
        and sent_at > now() - interval '1 seconds' * $4
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
    uid: Id,
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
    uid: Id,
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
    uid: Id,
    email_type: EmailTknType,
    valid_time: i64
) -> Result<Option<String>> {
    let query = r#"
        select hash from email_tkn_log
        where
        user_id = $1
        and reason = $2
        and sent_at > now() - interval '1 seconds' * $3
        and used = FALSE
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
    uid: Id
) -> Result<bool> {
    let is_verified: (bool,) = sqlx::query_as("select verified from users where id = $1 limit 1")
        .bind(uid)
        .fetch_one(db).await?;
    Ok(is_verified.0)
}

pub async fn set_verified(db: &mut Transaction<'_, Postgres>, uid: Id) -> Result<()> {
    sqlx::query("update users set verified = TRUE where id = $1")
        .bind(uid)
        .execute(&mut **db).await?;
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

pub async fn set_user_hash(db: &mut Transaction<'_, Postgres>, uid: Id, hash: &str) -> Result<()> {
    sqlx::query("update users set hash = $1 where id = $2")
        .bind(hash)
        .bind(uid)
        .execute(&mut **db)
        .await?;
    Ok(())
}

pub async fn get_user_hash_unsafe(db: &PgPool, uid: Id) -> Result<String> {
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
    uid: Id
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
        .execute(db)
        .await?;
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

pub async fn session_exists(
    db: &PgPool,
    hwid_hash: &str,
    uid: Id
) -> Result<bool> {
    let allowed: (bool,) = sqlx::query_as(
        "select count(*) = 1 from session where hash = $1 and user_id = $2 limit 1"
    )
        .bind(hwid_hash)
        .bind(uid)
        .fetch_one(db)
        .await?;
    Ok(allowed.0)
}

pub async fn exists_session_with_hwid(
    db: &PgPool,
    hwid_hash: &str,
    uid: Id
) -> Result<bool> {
    let exists: (bool, ) = sqlx::query_as(
        "select count(*) > 0 from session where hash = $1 and user_id = $2 limit 1"
    )
        .bind(hwid_hash)
        .bind(uid)
        .fetch_one(db)
        .await?;
    Ok(exists.0)
}

pub async fn get_users(db: &PgPool) -> Result<Vec<User>> {
    let users = sqlx::query_as::<_, User>(
        "select id, username, display_name, avatar, verified from users"
    )
        .fetch_all(db)
        .await?;
    Ok(users)
}

pub async fn get_user(db: &PgPool, uid: Id) -> Result<User> {
    let user = sqlx::query_as::<_, User>(
        "select id, username, display_name, avatar, verified from users where id = $1 limit 1"
    )
        .bind(uid)
        .fetch_one(db)
        .await?;
    Ok(user)
}

pub async fn update_session_last_access_time_now(
    db: &PgPool,
    uid: Id,
    hwid_hash: &str
) -> Result<()> {
    sqlx::query(
        "update session set last_access_at = now() where user_id = $1 and hash = $2"
    )
        .bind(uid)
        .bind(hwid_hash)
        .execute(db)
        .await?;
    Ok(())
}

pub async fn get_active_user_session(
    db: &PgPool,
    uid: Id,
    hwid_hash: &str
) -> Result<UserSession> {
    let query = r#"
     select id, os, device_name, last_access_at from session
     where user_id = $1 and hash = $2 limit 1
    "#;
    let session = sqlx::query_as::<_, UserSession>(query)
        .bind(uid)
        .bind(hwid_hash)
        .fetch_one(db)
        .await?;
    Ok(session)
}

pub async fn get_inactive_user_sessions(
    db: &PgPool,
    uid: Id,
    hwid_hash: &str
) -> Result<Vec<UserSession>> {
    let query = r#"
     select id, os, device_name, last_access_at from session
     where user_id = $1 and hash <> $2
    "#;
    let sessions = sqlx::query_as::<_, UserSession>(query)
        .bind(uid)
        .bind(hwid_hash)
        .fetch_all(db)
        .await?;
    Ok(sessions)
}

pub async fn is_session_of_user(db: &PgPool, session_id: Id, uid: Id) -> Result<bool> {
    let query = r#"
    select count(*) = 1 from session
    where id = $1 and user_id = $2
    "#;
    let is_user_session: (bool,) = sqlx::query_as(query)
        .bind(session_id)
        .bind(uid)
        .fetch_one(db)
        .await?;
    Ok(is_user_session.0)
}

pub async fn delete_user_session(db: &PgPool, id: Id) -> Result<()> {
    sqlx::query("delete from session where id = $1")
        .bind(id)
        .execute(db)
        .await?;
    Ok(())
}

pub async fn delete_user_session_by_hwid_uid(
    db: &PgPool,
    hwid: &str,
    uid: Id
) -> Result<()> {
    sqlx::query("delete from session where hash = $1 and user_id = $2")
        .bind(hwid)
        .bind(uid)
        .execute(db)
        .await?;
    Ok(())
}

pub async fn get_username_by_uid(db: &PgPool, uid: Id) -> Result<String> {
    let username: (String,) = sqlx::query_as("select username from users where id = $1 limit 1")
        .bind(uid)
        .fetch_one(db)
        .await?;
    Ok(username.0)
}

pub async fn get_displayname_by_uid(db: &PgPool, uid: Id) -> Result<String> {
    let displayname: (String,) = sqlx::query_as("select display_name from users where id = $1 limit 1")
        .bind(uid)
        .fetch_one(db)
        .await?;
    Ok(displayname.0)
}

pub async fn get_email_by_uid(db: &PgPool, uid: Id) -> Result<String> {
    let email: (String,) = sqlx::query_as("select email from users where id = $1 limit 1")
        .bind(uid)
        .fetch_one(db)
        .await?;
    Ok(email.0)
}

pub async fn update_displayname_by_uid(db: &PgPool, uid: Id, displayname: &str) -> Result<()> {
    sqlx::query("update users set display_name = $1 where id = $2")
        .bind(displayname)
        .bind(uid)
        .execute(db)
        .await?;
    Ok(())
}

pub async fn new_change_email(
    db: &PgPool,
    hash_from: &str,
    hash_to: &str,
    uid: Id,
) -> Result<()> {
    let query = r#"
        insert into change_email_log (hash_from, hash_to, user_id)
        values ($1, $2, $3)
    "#;
    sqlx::query(query)
        .bind(hash_from)
        .bind(hash_to)
        .bind(uid)
        .execute(db)
        .await?;
    Ok(())
}

pub async fn out_of_change_email_quota(
    db: &PgPool,
    uid: Id,
    max: i64,
    per: i64
) -> Result<bool> {
    let query = r#"
        select COUNT(*) >= $1 from change_email_log
        where
        user_id = $2
        and sent_at > now() - interval '1 seconds' * $3
        limit 1
    "#;
    let out_of_quota: (bool,) = sqlx::query_as(query)
        .bind(max)
        .bind(uid)
        .bind(per)
        .fetch_one(db)
        .await?;
    Ok(out_of_quota.0)
}

pub async fn waited_before_last_change_email(
    db: &PgPool,
    uid: Id,
    wait_before_resend: i64
) -> Result<bool> {
    let query = r#"
        select count(*) = 0 from change_email_log
        where
        user_id = $1
        and sent_at >= now() - interval '1 seconds' * $2
        limit 1
    "#;
    let waited: (bool, ) = sqlx::query_as(query)
        .bind(uid)
        .bind(wait_before_resend)
        .fetch_one(db)
        .await?;
    Ok(waited.0)
}

pub async fn get_valid_hashed_email_from_tkn(
    db: &PgPool,
    uid: Id,
    valid_time: i64
) -> Result<Option<String>> {
    let query = r#"
        select hash_from from change_email_log
        where
        user_id = $1
        and sent_at > now() - interval '1 seconds' * $2
        and used = FALSE
        order by sent_at desc
        limit 1
    "#;
    if let Some(hash) = sqlx::query_as::<_, (String,)>(query)
        .bind(uid)
        .bind(valid_time)
        .fetch_optional(db).await? {
        Ok(Some(hash.0))
    }
    else {
        Ok(None)
    }
}

pub async fn get_valid_hashed_email_to_tkn(
    db: &PgPool,
    uid: Id,
    valid_time: i64
) -> Result<Option<String>> {
    let query = r#"
        select hash_to from change_email_log
        where
        user_id = $1
        and sent_at > now() - interval '1 seconds' * $2
        and used = FALSE
        order by sent_at desc
        limit 1
    "#;
    if let Some(hash) = sqlx::query_as::<_, (String,)>(query)
        .bind(uid)
        .bind(valid_time)
        .fetch_optional(db).await? {
        Ok(Some(hash.0))
    }
    else {
        Ok(None)
    }
}

pub async fn update_email_by_uid(db: &mut Transaction<'_, Postgres>, uid: Id, email: &str) -> Result<()> {
    sqlx::query("update users set email = $1 where id = $2")
        .bind(email)
        .bind(uid)
        .execute(&mut **db)
        .await?;
    Ok(())
}

pub async fn invalidate_last_email_change_tkn(
    db: &mut Transaction<'_, Postgres>,
    uid: Id,
    valid_time: i64
) -> Result<()> {
    let query = r#"
        update change_email_log
        set used = TRUE
        where id = (
            select id from change_email_log
            where
                user_id = $1
                and sent_at > now() - interval '1 seconds' * $2
            order by sent_at desc
            limit 1
        )
    "#;
    sqlx::query(query)
        .bind(uid)
        .bind(valid_time)
        .execute(&mut **db)
        .await?;
    Ok(())
}

pub async fn invalidate_email_tkn(
    db: &mut Transaction<'_, Postgres>,
    uid: Id,
    email_type: EmailTknType,
    valid_time: i64
) -> Result<()> {
    let query = r#"
        update email_tkn_log
        set used = TRUE
        where id = (
	        select id from email_tkn_log
	        where
		        user_id = $1
                and reason = $2
                and sent_at > now() - interval '1 seconds' * $3
            order by sent_at desc
            limit 1
        )
    "#;
    sqlx::query(query)
        .bind(uid)
        .bind(email_type)
        .bind(valid_time)
        .execute(&mut **db)
        .await?;
    Ok(())
}

pub async fn update_avatar_by_uid(db: &PgPool, uid: Id, avatar: &[u8]) -> Result<()> {
    sqlx::query("update users set avatar = $1 where id = $2")
        .bind(avatar)
        .bind(uid)
        .execute(db)
        .await?;
    Ok(())
}

pub async fn update_password_by_uid(db: &PgPool, uid: Id, password_hash: &str) -> Result<()> {
    sqlx::query("update users set hash = $1 where id = $2")
        .bind(password_hash)
        .bind(uid)
        .execute(db)
        .await?;
    Ok(())
}

pub async fn delete_user_by_uid(db: &PgPool, uid: Id) -> Result<()> {
    sqlx::query("delete from users where id = $1")
        .bind(uid)
        .execute(db)
        .await?;
    Ok(())
}

pub async fn reg_tkn_name_unique(db: &PgPool, name: &str) -> Result<bool> {
    let unique: (bool, ) = sqlx::query_as("select COUNT(*) = 0 from reg_tkn where name = $1 limit 1")
        .bind(name)
        .fetch_one(db).await?;
    Ok(unique.0)
}

pub async fn new_reg_tkn(
    db: &PgPool,
    name: &str,
    key: &str,
    max_reg: Option<i32>
) -> Result<Id> {
    let query = r#"
    insert into reg_tkn (name, key, max_reg)
    values ($1, $2, $3) returning id
    "#;
    let id: (Id, ) = sqlx::query_as(query)
        .bind(name)
        .bind(key)
        .bind(max_reg)
        .fetch_one(db)
        .await?;
    Ok(id.0)
}

pub async fn get_active_reg_tkns(db: &PgPool) -> Result<Vec<RegTkn>> {
    let query = r#"
        select id, name, key, max_reg, used from reg_tkn
        where used < max_reg
    "#;
    let reg_tkns = sqlx::query_as::<_, RegTkn>(query)
        .fetch_all(db)
        .await?;
    Ok(reg_tkns)
}

pub async fn get_inactive_reg_tkns(db: &PgPool) -> Result<Vec<RegTkn>> {
    let query = r#"
        select id, name, key, max_reg, used from reg_tkn
        where max_reg <= used
    "#;
    let reg_tkns = sqlx::query_as::<_, RegTkn>(query)
        .fetch_all(db)
        .await?;
    Ok(reg_tkns)
}

pub async fn delete_reg_tkn(db: &PgPool, id: Id) -> Result<()> {
    sqlx::query("delete from reg_tkn where id = $1")
        .bind(id)
        .execute(db)
        .await?;
    Ok(())
}

pub async fn get_reg_tkn_info(db: &PgPool, reg_tkn_id: Id) -> Result<Vec<RegDetail>> {
    let query = r#"
        select users.id, users.reg_at, users.verified from reg_tkn
        join users on users.reg_tkn_id = reg_tkn.id
        where reg_tkn.id = $1
    "#;
    let reg_details = sqlx::query_as::<_, RegDetail>(query)
        .bind(reg_tkn_id)
        .fetch_all(db)
        .await?;
    Ok(reg_details)
}

pub async fn reg_tkn_exists(
    db: &PgPool,
    reg_tkn: &str
) -> Result<bool> {
    let exists: (bool,) = sqlx::query_as(
        "select count(*) = 1 from reg_tkn where key = $1 limit 1"
    )
        .bind(reg_tkn)
        .fetch_one(db)
        .await?;
    Ok(exists.0)
}

pub async fn get_reg_tkn_by_key(
    db: &PgPool,
    key: &str,
) -> Result<RegTkn> {
    let reg_tkn: RegTkn = sqlx::query_as::<_, RegTkn>(
        "select id, name, key, max_reg, used from reg_tkn where key = $1 limit 1"
    )
        .bind(key)
        .fetch_one(db)
        .await?;
    Ok(reg_tkn)
}

pub async fn get_reg_tkn_by_key_for_update(db: &mut Transaction<'_, Postgres>, key: &str) -> Result<Option<RegTkn>> {
    if let Some(reg_tkn) = sqlx::query_as::<_, RegTkn>("select id, name, key, max_reg, used from reg_tkn where key = $1 for update limit 1")
        .bind(key)
        .fetch_optional(&mut **db).await? {
        Ok(Some(reg_tkn))
    }
    else {
        Ok(None)
    }
}

pub async fn reg_tkn_increment_used_by_id(db: &mut Transaction<'_, Postgres>, id: Id) -> Result<()> {
    sqlx::query("update reg_tkn set used = used + 1 where id = $1")
        .bind(id)
        .execute(&mut **db)
        .await?;
    Ok(())
}

pub async fn get_default_playback_speed(
    db: &PgPool,
) -> Result<Decimal> {
    let default_speed: (Decimal,) = sqlx::query_as("select playback_speed from settings limit 1")
        .fetch_one(db)
        .await?;
    Ok(default_speed.0)
}

pub async fn set_default_playback_speed(
    db: &PgPool,
    playback_speed: &Decimal
) -> Result<()> {
    sqlx::query("update settings set playback_speed = $1")
        .bind(playback_speed)
        .execute(db)
        .await?;
    Ok(())
}

pub async fn get_default_desync_tolerance(
    db: &PgPool,
) -> Result<Decimal> {
    let default_desync_tolerance: (Decimal,) = sqlx::query_as("select desync_tolerance from settings limit 1")
        .fetch_one(db)
        .await?;
    Ok(default_desync_tolerance.0)
}

pub async fn set_default_desync_tolerance(
    db: &PgPool,
    desync_tolerance: &Decimal
) -> Result<()> {
    sqlx::query("update settings set desync_tolerance = $1")
        .bind(desync_tolerance)
        .execute(db)
        .await?;
    Ok(())
}

pub async fn get_default_major_desync_min(
    db: &PgPool,
) -> Result<Decimal> {
    let default_major_desync_min: (Decimal,) = sqlx::query_as("select major_desync_min from settings limit 1")
        .fetch_one(db)
        .await?;
    Ok(default_major_desync_min.0)
}

pub async fn set_default_major_desync_min(
    db: &PgPool,
    major_desync_min: &Decimal
) -> Result<()> {
    sqlx::query("update settings set major_desync_min = $1")
        .bind(major_desync_min)
        .execute(db)
        .await?;
    Ok(())
}

pub async fn get_default_minor_desync_playback_slow(
    db: &PgPool,
) -> Result<Decimal> {

    let default_major_desync_min: (Decimal,) = sqlx::query_as("select minor_desync_playback_slow from settings limit 1")
        .fetch_one(db)
        .await?;
    Ok(default_major_desync_min.0)
}

pub async fn set_default_minor_desync_playback_slow(
    db: &PgPool,
    minor_desync_playback_change: &Decimal
) -> Result<()> {
    sqlx::query("update settings set minor_desync_playback_slow = $1")
        .bind(minor_desync_playback_change)
        .execute(db)
        .await?;
    Ok(())
}

pub async fn room_name_unique(db: &PgPool, name: &str) -> Result<bool> {
    let unique: (bool, ) = sqlx::query_as("select COUNT(*) = 0 from room where name = $1 limit 1")
        .bind(name)
        .fetch_one(db)
        .await?;
    Ok(unique.0)
}

pub async fn get_default_room_settings(db: &PgPool) -> Result<RoomSettings> {
    let query = r#"
        select
            playback_speed, desync_tolerance,
            minor_desync_playback_slow, major_desync_min
        from settings
    "#;
    let room_settings: RoomSettings = sqlx::query_as::<_, RoomSettings>(query)
        .fetch_one(db)
        .await?;
    Ok(room_settings)
}

pub async fn new_room(
    db: &PgPool,
    name: &str,
    playback_speed: &Decimal,
    desync_tolerance: &Decimal,
    minor_desync_playback_slow: &Decimal,
    major_desync_min: &Decimal
) -> Result<Id> {
    let query = r#"
    INSERT INTO room
    (name, playback_speed, desync_tolerance, minor_desync_playback_slow, major_desync_min)
    VALUES ($1, $2, $3, $4, $5)
    returning id
    "#;
    let id: (Id, ) = sqlx::query_as(query)
        .bind(name)
        .bind(playback_speed)
        .bind(desync_tolerance)
        .bind(minor_desync_playback_slow)
        .bind(major_desync_min)
        .fetch_one(db)
        .await?;
    Ok(id.0)
}

pub async fn get_rooms(db: &PgPool) -> Result<Vec<Room>> {
    let query = r#"
           select
                id,
                name,
                playback_speed,
                desync_tolerance,
                minor_desync_playback_slow,
                major_desync_min
           from room
    "#;
    let rooms: Vec<Room> = sqlx::query_as::<_, Room>(query)
        .fetch_all(db)
        .await?;
    Ok(rooms)
}