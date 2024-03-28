import Welcome from "./Welcome.tsx";
import React, {ReactElement, useEffect} from "react";
import {useFirstRunSeen} from "../hooks/useFirstRunSeen.ts";
import {Route, Routes, useNavigate} from "react-router-dom";
import Main from "./Main.tsx";
import Deps from "./Deps.tsx";
import DepsAgain from "./DepsAgain.tsx";

function App(): ReactElement {
    const firstRunSeen: boolean = useFirstRunSeen()
    const navigate = useNavigate()

    useEffect(() => {
        if (firstRunSeen)
            navigate("/deps", {state: {firstRunSeen: true}})
        else
            navigate("/welcome")
    }, [firstRunSeen]);

    return (
        <Routes>
            <Route path="/welcome" element={<Welcome/>}/>
            <Route path="/main" element={<Main/>}/>
            <Route path="/deps" element={<Deps/>}/>
            <Route path="/deps-again" element={<DepsAgain/>}/>
        </Routes>
    )
}

export default App;
