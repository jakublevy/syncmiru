export enum SocketIoAckType {
    Ok,
    Err,
}

export interface SocketIoAck {
    resp: SocketIoAckType
}