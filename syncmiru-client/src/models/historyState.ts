export interface LoginFormHistoryState {
    email?: string,
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

export interface MpvDownloadHistoryState {
    yt_dlp: boolean
}