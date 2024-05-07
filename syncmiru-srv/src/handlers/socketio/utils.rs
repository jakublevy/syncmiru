use crate::models::query::{Id};
use crate::query;
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