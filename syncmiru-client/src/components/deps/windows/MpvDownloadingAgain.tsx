import React, {Suspense} from "react";
import Loading from "../../Loading.tsx";
import MpvDownloading from "./MpvDownloading.tsx";

export default function MpvDownloadingAgain() {
    return (
        <Suspense fallback={<Loading/>}>
            <MpvDownloading/>
        </Suspense>
    )
}