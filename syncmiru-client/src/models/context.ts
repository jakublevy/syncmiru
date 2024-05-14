import {Socket} from "socket.io-client";
import {UserId, UserValueClient} from "src/models/user.ts";

export interface MainContextModel {
    uid: number
    socket: Socket | undefined,
    users: Map<UserId, UserValueClient>
}