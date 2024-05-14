import {Socket} from "socket.io-client";
import {UserId, UserValueClient} from "src/models/user.ts";

export interface MainContext {
    uid: number
    socket: Socket | undefined
}


export interface UserContext {
    users: Map<UserId, UserValueClient>
}