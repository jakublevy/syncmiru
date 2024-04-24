import {Socket} from "socket.io-client";

export interface MainContextModel {
    socket: Socket | undefined,
    users: Map<UserId, UserValue>
}