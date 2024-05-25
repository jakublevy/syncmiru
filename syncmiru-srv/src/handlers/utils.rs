use std::time::Duration;
use axum::Json;
use rand::Rng;
use crate::config::Rate;
use crate::models::query::{EmailTknType, Id};
use crate::models::socketio::{EmailChangeTkn, EmailChangeTknType};
use crate::{crypto, query};
use crate::models::http::BooleanResp;
use crate::models::Tkn;
use crate::srvstate::SrvState;
use crate::result::Result;

pub(super) async fn check_email_tkn_out_of_quota(
    state: &SrvState,
    uid: Id,
    email_type: EmailTknType,
) -> Result<bool> {
    let mut out_of_quota = false;
    if state.config.email.rates.is_some() {
        let email_rates = state.config.email.rates.unwrap();
        let rates_opt: Option<Rate> = match email_type {
            EmailTknType::ForgottenPassword => email_rates.forgotten_password,
            EmailTknType::Verify => email_rates.verification,
            EmailTknType::DeleteAccount => email_rates.delete_account
        };
        if rates_opt.is_some() {
            let rates = rates_opt.unwrap();
            out_of_quota = query::out_of_email_tkn_quota(
                &state.db,
                uid,
                &email_type,
                rates.max,
                rates.per,
            ).await?;
        }

        if out_of_quota {
            return Ok(false);
        }

        let waited = query::waited_before_last_email_tkn(
            &state.db,
            uid,
            &email_type,
            state.config.email.wait_before_resend,
        ).await?;

        if !waited {
            return Ok(false);
        }
        Ok(true)
    }
    else {
        Ok(true)
    }
}

pub(super) async fn random_sleep(from_millis: u64, to_millis: u64) {
    let sleep_duration = rand::thread_rng().gen_range(
        Duration::from_millis(from_millis)..=Duration::from_millis(to_millis)
    );
    tokio::time::sleep(sleep_duration).await;
}

pub(super) async fn is_change_email_out_of_quota(
    state: &SrvState,
    uid: Id,
) -> Result<bool> {
    let mut out_of_quota = false;
    if state.config.email.rates.is_some() {
        let rates = state.config.email.rates.unwrap();
        if rates.change_email.is_some() {
            let ce_rate = rates.change_email.unwrap();
            out_of_quota = query::out_of_change_email_quota(
                &state.db,
                uid,
                ce_rate.max,
                ce_rate.per
            ).await?;

            if out_of_quota {
                return Ok(out_of_quota)
            }

            let waited = query::waited_before_last_change_email(
                &state.db,
                uid,
                state.config.email.wait_before_resend
            ).await?;
            if !waited {
                return Ok(!waited)
            }
        }
    }
    Ok(out_of_quota)
}

pub(super) async fn check_email_change_tkn(
    state: &SrvState,
    payload: &EmailChangeTkn,
    uid: Id
) -> Result<bool> {

    let mut tkn_hash_opt: Option<String> = None;
    if payload.tkn_type == EmailChangeTknType::From {
        tkn_hash_opt = query::get_valid_hashed_email_from_tkn(
            &state.db,
            uid,
            state.config.email.token_valid_time
        )
            .await
            .expect("db error")
    }
    else {
        tkn_hash_opt = query::get_valid_hashed_email_to_tkn(
            &state.db,
            uid,
            state.config.email.token_valid_time
        )
            .await
            .expect("db error")
    }
    if tkn_hash_opt.is_none() {
        return Ok(false)
    }

    let tkn_hash_db = tkn_hash_opt.unwrap();
    if crypto::verify(payload.tkn.clone(), tkn_hash_db).await.expect("argon2 error") {
        Ok(true)
    }
    else {
        Ok(false)
    }
}