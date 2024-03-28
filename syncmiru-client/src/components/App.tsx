import Welcome from "./Welcome.tsx";
import React, {ReactElement, useEffect} from "react";
import {useFirstRunSeen} from "../hooks/useFirstRunSeen.ts";
import {Route, Routes, useNavigate} from "react-router-dom";
import Main from "./Main.tsx";
import Deps from "./Deps.tsx";
import DepsMissingWindows from "./DepsMissingWindows.tsx";
import {DepsState} from "../models/config.tsx";

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
          // <DepsMissingWindows firstRunSeen={false} depsState={{mpv: false, yt_dlp: false}}/>
         // <Welcome/>
        <Routes>
            <Route path="/welcome" element={<Welcome/>}/>
            <Route path="/main" element={<Main/>}/>
            <Route path="/deps" element={<Deps/>}/>
        </Routes>
    )
}

export default App;
