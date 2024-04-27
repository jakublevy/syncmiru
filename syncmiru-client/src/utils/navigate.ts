import {
    DepsHistoryState,
    ForgottenPasswordHistoryState,
    LoginFormHistoryState,
    VerifyEmailHistoryState
} from "@models/historyState.ts";
import {mutate} from "swr";
import {refresh} from "@mittwald/react-use-promise";

type NavigateFunc<T> = (to: string | URL, options?: { replace?: boolean, state?: T }) => void

export function navigateToEmailVerify(
    navigate: NavigateFunc<VerifyEmailHistoryState>,
    verifyEmailHistoryState: VerifyEmailHistoryState
) {
    mutate('req_verification_email', undefined).then(() =>
        mutate('get_email_verified', undefined).then(() => {
            navigate('/email-verify', {state: verifyEmailHistoryState})
        }))
}

export function navigateToMain(navigate: NavigateFunc<void>) {
    refresh({tag: "useJwt"})
    navigate('/main/index')
}

export function navigateToDeps(
    navigate: NavigateFunc<DepsHistoryState>,
    depsHistoryState: DepsHistoryState
) {
    refresh({tag: "useDepsState"})
    navigate("/deps", {state: depsHistoryState})
}

export function navigateToDepsUpdate(navigate: NavigateFunc<void>) {
    mutate('get_deps_versions_fetch', undefined).then(() =>
        navigate("/deps-update")
    )
}

export function navigateToWelcome(navigate: NavigateFunc<void>) {
    refresh({tag: "useLanguage"})
    navigate("/welcome")
}

export function navigateToLoginFormMain(
    navigate: NavigateFunc<LoginFormHistoryState>,
    loginFormHistoryState?: LoginFormHistoryState
) {
    mutate('get_service_status', undefined).then(() => {
        refresh({tag: "useHomeServer"})

        if(loginFormHistoryState !== undefined)
            navigate("/login-form/main", {state: loginFormHistoryState})

        else
            navigate("/login-form/main")
    })
}

export function navigateToRegister(navigate: NavigateFunc<void>) {
    mutate('get_service_status', undefined).then(() =>
        navigate('/register')
    )
}

export function navigateToForgottenPassword(
    navigate: NavigateFunc<ForgottenPasswordHistoryState>,
    forgottenPasswordHistoryState: ForgottenPasswordHistoryState
) {
    mutate('get_service_status', undefined).then(() => {
        mutate('req_forgotten_password_email', undefined).then(() => {
            navigate('/forgotten-password', {state: forgottenPasswordHistoryState})
        })
    })
}

export function navigateToUserSettingsAppearence(navigate: NavigateFunc<void>) {
    refresh({tag: "useTheme"})
    navigate("/main/user-settings/appearence")
}