use std::time::Duration;
use rand::Rng;
use crate::error::SyncmiruError;
use crate::models::query::{EmailTknType, Id};
use crate::{query};
use crate::config::{Rate};
use crate::srvstate::SrvState;
use crate::result::Result;

pub(super) async fn check_email_tkn_out_of_quota(
    state: &SrvState,
    uid: Id,
    email_type: EmailTknType,
) -> Result<()> {
    let mut out_of_quota = false;
    if state.config.email.rates.is_some() {
        let email_rates = state.config.email.rates.unwrap();
        let rates_opt: Option<Rate> = match email_type {
            EmailTknType::ForgottenPassword => email_rates.forgotten_password,
            EmailTknType::Verify => email_rates.verification
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
            return Err(SyncmiruError::UnprocessableEntity("too many requests".to_string()));
        }

        let waited = query::waited_before_last_email_tkn(
            &state.db,
            uid,
            &email_type,
            state.config.email.wait_before_resend,
        ).await?;

        if !waited {
            return Err(SyncmiruError::UnprocessableEntity("did not wait the minimum time before resending".to_string()));
        }
        Ok(())
    }
    else {
        Ok(())
    }
}

pub(super) async fn random_sleep(from_millis: u64, to_millis: u64) {
    let sleep_duration = rand::thread_rng().gen_range(
        Duration::from_millis(from_millis)..=Duration::from_millis(to_millis)
    );
    tokio::time::sleep(sleep_duration).await;
}
