import React, {ReactElement, Suspense} from "react";
import Loading from "./Loading.tsx";
import YtDlpDownloadWindows from "./YtDlpDownloadWindows.tsx";

export default function YtDlpDownloadAgainWindows(): ReactElement {
    return (
        <Suspense fallback={<Loading/>}>
            <YtDlpDownloadWindows/>
        </Suspense>
    )
}