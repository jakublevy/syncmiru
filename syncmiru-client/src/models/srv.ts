import {UserId} from "@models/user.ts";

export type RegTknId = number
export interface RegTknValue {
    name: string,
    key: string
    max_reg?: number
}

export interface RegTkn extends RegTknValue {
    id: RegTknId
}

export enum RegTknType {
    Active,
    Inactive
}

export interface RegDetail {
    uid: UserId,
    reg_at: Date
}