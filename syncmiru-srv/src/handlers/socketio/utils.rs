use crate::models::query::{Id};
use crate::models::socketio::{EmailChangeTkn, EmailChangeTknType};
use crate::{crypto, query};
use crate::srvstate::SrvState;
use crate::result::Result;

pub(super) async fn is_email_out_of_quota(
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