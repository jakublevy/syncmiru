export interface SocketIoAck<T> {
    status: SocketIoAckType,
    payload: T | null
}

export enum SocketIoAckType {
    Ok = 0,
    Err = 1
}