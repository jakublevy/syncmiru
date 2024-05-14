import {createContext, useContext} from "react";
import {MainContext as MainContextModel}  from "@models/context.ts";

export const MainContext = createContext<MainContextModel>(
    {
        socket: undefined,
        uid: 0
    })

export const useMainContext = () => useContext(MainContext)