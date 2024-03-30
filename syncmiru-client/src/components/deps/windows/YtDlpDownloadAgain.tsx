import React, {ReactElement, Suspense} from "react";
import Loading from "../../Loading.tsx";
import YtDlpDownloading from "./YtDlpDownloading.tsx";

export default function YtDlpDownloadAgain(): ReactElement {
    return (
        <Suspense fallback={<Loading/>}>
            <YtDlpDownloading/>
        </Suspense>
    )
}