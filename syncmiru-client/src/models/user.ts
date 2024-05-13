export interface User extends UserValue {
    id: number
}

export type UserId = number
export interface UserValue {
    username: string,
    displayname: string,
    avatar: string
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

interface UserPropChange {
    uid: number
}

export interface DisplaynameChange extends UserPropChange{
    displayname: string
}

export interface AvatarChange extends UserPropChange {
    avatar: Array<number>
}

export interface EmailChangeTkn {
    tkn: string
    tkn_type: EmailChangeTknType
}

export enum EmailChangeTknType {
    From = 0,
    To = 1
}
