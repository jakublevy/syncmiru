export interface SocketIoAck<T> {
    status: SocketIoAckType,
    payload: T | null
}

export enum SocketIoAckType {
    Ok = 0,
    Err = 1
}

export interface EmailChangeTkn {
    tkn: string
    tkn_type: EmailChangeTknType
}

export enum EmailChangeTknType {
    From = 0,
    To = 1
}