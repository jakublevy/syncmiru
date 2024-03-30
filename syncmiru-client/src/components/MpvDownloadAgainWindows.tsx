import React, {Suspense} from "react";
import Loading from "./Loading.tsx";
import MpvDownloadWindows from "./MpvDownloadWindows.tsx";

export default function MpvDownloadAgainWindows() {
    return (
        <Suspense fallback={<Loading/>}>
            <MpvDownloadWindows/>
        </Suspense>
    )
}