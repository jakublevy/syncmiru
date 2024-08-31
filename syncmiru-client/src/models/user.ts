import {UserReadyState} from "@components/widgets/ReadyState.tsx";

export interface UserClient extends UserValueClient {
    id: number
}

export interface UserSrv extends UserValueSrv {
    id: number
}

export type UserId = number

interface UserValueCommon {
    username: string,
    displayname: string,
    verified: boolean,
}
export interface UserValueClient extends UserValueCommon{
    avatar: string
}

export type UserMap = Map<UserId, UserValueClient>

export interface UserValueSrv extends UserValueCommon{
    avatar: number[]
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

export interface UserReadyStateChangeClient {
    uid: UserId,
    ready_state: UserReadyState
}

export interface EmailChangeTkn {
    tkn: string
    tkn_type: EmailChangeTknType
}

export enum EmailChangeTknType {
    From = 0,
    To = 1
}
