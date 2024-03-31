import React, {Suspense} from "react";
import ReactDOM from "react-dom/client";
import App from "@components/App.tsx";
import "./styles.css";
import i18n from "./i18n.ts";
import {I18nextProvider} from "react-i18next";
import {MemoryRouter} from "react-router-dom";
import Loading from "@components/Loading.tsx";
import {ErrorBoundary} from "react-error-boundary";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <I18nextProvider i18n={i18n}>
            <MemoryRouter>
                <ErrorBoundary fallback={<div>Unrecoverable error</div>}>
                    <Suspense fallback={<Loading/>}>
                        <App/>
                    </Suspense>
                </ErrorBoundary>
            </MemoryRouter>
        </I18nextProvider>
    </React.StrictMode>
);
