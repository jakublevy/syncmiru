import Welcome from "./Welcome.tsx";
// @ts-ignore
import React, {ReactElement, ReactNode, Suspense, use, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import Loading from "./Loading.tsx";
import DepsMissingNoWindows from "./DepsMissingNoWindows.tsx";
import {firstRunSeenPromise} from "../hooks/useFirstRunSeen.ts";
import {Route, Routes, useNavigate} from "react-router-dom";
import Main from "./Main.tsx";
import Deps from "./Deps.tsx";
import {PacmanLoader} from "react-spinners";
import {Language} from "../models/config.tsx";
import {languagePromise} from "../hooks/useLanguage.ts";
import i18n from "../i18n.ts";

function App(): ReactElement {
    const firstRunSeen: boolean = use(firstRunSeenPromise())
    const navigate = useNavigate()

    useEffect(() => {
        if(firstRunSeen)
            navigate("/deps", {state: {firstRunSeen: true}})
        else
            navigate("/welcome")
    }, [firstRunSeen]);

    return (
        <Routes>
            <Route path="/welcome" element={<Welcome/>}/>
            <Route path="/main" element={<Main/>}/>
            <Route path="/deps" element={<Deps />} />
        </Routes>
    )
        // <>
        //     {firstRunSeen ? <Main/> : <Welcome/>}
        // </>
        // <ErrorBoundary fallback={<div>Error</div>}>
        //     <Suspense fallback={<Loading/>}>
        //         <Welcome/>
        //     </Suspense>
        // </ErrorBoundary>

}

export default App;
