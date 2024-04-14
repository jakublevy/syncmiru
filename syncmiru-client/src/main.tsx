import React, {Suspense} from "react";
import ReactDOM from "react-dom/client";
import App from "@components/App.tsx";
import "src/styles.css";
import 'react-status-alert/dist/status-alert.css'
import i18n from "./i18n.ts";
import {I18nextProvider} from "react-i18next";
import Loading from "@components/Loading.tsx";
import {ErrorBoundary} from "react-error-boundary";
import StatusAlert from "react-status-alert";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <I18nextProvider i18n={i18n}>
            <ErrorBoundary fallback={<div>Unrecoverable error</div>}>
                <Suspense fallback={<Loading/>}>
                    <StatusAlert/>
                    <App/>
                </Suspense>
            </ErrorBoundary>
        </I18nextProvider>
    </React.StrictMode>
);
