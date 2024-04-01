import Welcome from "@components/Welcome.tsx";
import React, {ReactElement, useEffect} from "react";
import {useFirstRunSeen} from "@hooks/useFirstRunSeen.ts";
import {Route, useLocation, Router, Switch} from "wouter";
import LoginDispatch from "@components/login/LoginDispatch.tsx";
import Deps from "@components/deps/Deps.tsx";
import MpvDownloading from "@components/deps/windows/MpvDownloading.tsx";
import YtDlpDownloading from "@components/deps/windows/YtDlpDownloading.tsx";
import {ErrorBoundary} from "react-error-boundary";
import MpvDownloadFailed from "@components/deps/windows/MpvDownloadFailed.tsx";
import YtDlpDownloadFailed from "@components/deps/YtDlpDownloadFailed.tsx";
import Trampoline from "@components/Trampoline.tsx";
import LoginAuto from "@components/login/LoginAuto.tsx";
import HomeServer from "@components/login/HomeServer.tsx";
import LoginFormMain from "@components/login/LoginFormMain.tsx";
import LoginForm from "@components/login/LoginForm.tsx";


function App(): ReactElement {
    const firstRunSeen: boolean = useFirstRunSeen()
    const [_, navigate] = useLocation()

    useEffect(() => {
        if (firstRunSeen)
            navigate('/deps', {state: {firstRunSeen: true}})
        else
            navigate('/welcome')
    }, [firstRunSeen]);

    return (
        <Router>
            <Route path="/reload" component={Trampoline}/>
            <Route path="/welcome" component={Welcome}/>

            {/*<Route path="/deps" nest>*/}
            {/*    <Route path="/" component={Deps}/>*/}
            {/*    <Route path="/mpv-download">*/}
            {/*        <ErrorBoundary fallback={<MpvDownloadFailed/>}>*/}
            {/*            <MpvDownloading/>*/}
            {/*        </ErrorBoundary>*/}
            {/*    </Route>*/}
            {/*    <Route path="/yt-dlp-download">*/}
            {/*        <ErrorBoundary fallback={<YtDlpDownloadFailed/>}>*/}
            {/*            <YtDlpDownloading/>*/}
            {/*        </ErrorBoundary>*/}
            {/*    </Route>*/}
            {/*</Route>*/}

            <Route path="/deps" component={Deps}/>
            <Route path="/mpv-download">
                <ErrorBoundary fallback={<MpvDownloadFailed/>}>
                    <MpvDownloading/>
                </ErrorBoundary>
            </Route>

            <Route path="/yt-dlp-download">
                <ErrorBoundary fallback={<YtDlpDownloadFailed/>}>
                    <YtDlpDownloading/>
                </ErrorBoundary>
            </Route>

            {/*<Route path="/login" nest>*/}
            {/*    <Route path="/" component={LoginDispatch}/>*/}
            {/*    <Route path="/auto" component={LoginAuto}/>*/}
            {/*    <Route path="/form" nest>*/}
            {/*        <Route path="/" component={LoginFormMain}/>*/}
            {/*        <Route path="/home"*/}
            {/*    </Route>*/}
            {/*    */}
            {/*</Route>*/}

            <Route path="/login-dispatch" component={LoginDispatch}/>
            <Route path="/login-auto" component={LoginAuto}/>

            <Switch>
                <Route path="/login-form/*" component={LoginForm}/>
            </Switch>
        </Router>
        // <Routes>
        //     <Route path="/reload" element={<Trampoline/>}/>
        //     <Route path="/welcome" element={<Welcome/>}/>
        //     <Route path="/deps" element={<Deps/>}/>
        //
        //     <Route path="/mpv-download" element={
        //         <ErrorBoundary fallback={<MpvDownloadFailed/>}>
        //             <MpvDownloading/>
        //         </ErrorBoundary>
        //     }/>
        //
        //     <Route path="/yt-dlp-download" element={
        //         <ErrorBoundary fallback={<YtDlpDownloadFailed/>}>
        //             <YtDlpDownloading/>
        //         </ErrorBoundary>
        //     }/>
        //
        //     <Route path="/login-dispatch" element={<LoginDispatch/>}/>
        //     <Route path="/login-auto" element={<LoginAuto/>}/>
        //     <Route path="/login-form" element={<LoginFormMain/>}>
        //         <Route path="home-server" element={<HomeServer/>}/>
        //     </Route>
        // </Routes>
    )
}

export default App;
