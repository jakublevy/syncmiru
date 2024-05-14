import {createContext, useContext} from "react";
import {UserContext as UserContextModel}  from "@models/context.ts";
import {UserId, UserValueClient} from "@models/user.ts";

export const UserContext = createContext<UserContextModel>(
    {
        users: new Map<UserId, UserValueClient>()
    })

export const useUserContext = () => useContext(UserContext)