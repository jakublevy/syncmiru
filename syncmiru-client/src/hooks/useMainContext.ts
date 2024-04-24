import {createContext, useContext} from "react";
import {MainContextModel} from "@models/context.ts";

export const MainContext = createContext<MainContextModel>({socket: undefined, users: new Map<UserId, UserValue>()})

export const useMainContext = () => useContext(MainContext)