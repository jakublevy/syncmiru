#[derive(sqlx::Type)]
#[sqlx(type_name = "email_reason", rename_all = "snake_case")]
pub enum TokenEmailType {
    ForgottenPassword,
    Verify,
}