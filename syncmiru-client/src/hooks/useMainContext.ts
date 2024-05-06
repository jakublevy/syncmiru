import {createContext, useContext} from "react";
import {MainContextModel} from "@models/context.ts";
import {UserId, UserValue} from "src/models/user.ts";

export const MainContext = createContext<MainContextModel>(
    {
        socket: undefined,
        users: new Map<UserId, UserValue>(),
        setUsers: _ => {}
    })

export const useMainContext = () => useContext(MainContext)