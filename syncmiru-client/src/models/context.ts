import {Socket} from "socket.io-client";
import {UserId, UserValue} from "src/models/user.ts";

export interface MainContextModel {
    socket: Socket | undefined,
    users: Map<UserId, UserValue>
}