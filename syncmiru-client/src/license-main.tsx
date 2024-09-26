import React, {Suspense} from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import 'react-status-alert/dist/status-alert.css'
import i18n from "./i18n.ts";
import {I18nextProvider} from "react-i18next";
import Loading from "@components/Loading.tsx";
import {ErrorBoundary} from "react-error-boundary";
import StatusAlert from "react-status-alert";
import LicenseMain from "@components/lic/LicenseMain.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <I18nextProvider i18n={i18n}>
            <ErrorBoundary fallback={<div>Unrecoverable error</div>}>
                <Suspense fallback={<Loading/>}>
                    <StatusAlert/>
                    <LicenseMain/>
                </Suspense>
            </ErrorBoundary>
        </I18nextProvider>
    </React.StrictMode>
);
