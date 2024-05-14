import {createContext, useContext} from "react";
import {MainContextModel} from "@models/context.ts";
import {UserId, UserValueClient} from "src/models/user.ts";

export const MainContext = createContext<MainContextModel>(
    {
        socket: undefined,
        users: new Map<UserId, UserValueClient>(),
        setUsers: _ => {}
    })

export const useMainContext = () => useContext(MainContext)