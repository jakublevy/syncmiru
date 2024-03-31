import React, {ReactElement, Suspense} from "react";
import Loading from "@components/Loading.tsx";
import YtDlpDownloading from "@components/deps/windows/YtDlpDownloading.tsx";

export default function YtDlpDownloadAgain(): ReactElement {
    return (
        <Suspense fallback={<Loading/>}>
            <YtDlpDownloading/>
        </Suspense>
    )
}