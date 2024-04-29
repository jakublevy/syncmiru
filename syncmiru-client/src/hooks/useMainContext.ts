import {createContext, useContext} from "react";
import {MainContextModel} from "@models/context.ts";
import {UserId, UserValue} from "src/models.ts";

export const MainContext = createContext<MainContextModel>({socket: undefined, users: new Map<UserId, UserValue>()})

export const useMainContext = () => useContext(MainContext)