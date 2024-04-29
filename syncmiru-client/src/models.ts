export interface User extends UserValue {
    id: number
}

export type UserId = number
export interface UserValue {
    username: string,
    displayname: string,
    avatar: Array<number> | undefined
}

export interface UserSessionStrTime {
    id: number,
    device_name: string
    os: string,
    last_access_at: string
}

export interface UserSession {
    id: number,
    device_name: string
    os: string,
    last_access_at: Date
}