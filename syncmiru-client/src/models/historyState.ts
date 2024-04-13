export interface LoginFormHistoryState {
    email?: string,
    fieldsError?: boolean,
    homeSrvError?: boolean
}

export interface TrampolineHistoryState {
    to: string
    [key: string]: any
}

export interface DepsHistoryState {
    firstRunSeen: boolean
}

export interface VerifyEmailHistoryState {
    email: string
}

export interface ForgottenPasswordHistoryState {
    email: string
}