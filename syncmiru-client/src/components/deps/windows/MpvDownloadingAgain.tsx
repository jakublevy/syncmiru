import React, {Suspense} from "react";
import Loading from "@components/Loading.tsx";
import MpvDownloading from "@components/deps/windows/MpvDownloading.tsx";

export default function MpvDownloadingAgain() {
    return (
        <Suspense fallback={<Loading/>}>
            <MpvDownloading/>
        </Suspense>
    )
}