export type RegTknId = number
export interface RegTknValue {
    name: string,
    key: string
    max_reg?: number
}

export interface RegTkn extends RegTknValue {
    id: RegTknId
}