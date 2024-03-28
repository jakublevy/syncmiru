// interface AppData {
//     firstRunSeen: boolean,
//     homeSrv: string | undefined,
//     language: Language,
//     autoReady: boolean,
//     targetFamily: string
//
// }
//

import React from "react";
import ReactCountryFlag from "react-country-flag";

export interface DepsState {
    mpv: boolean,
    yt_dlp: boolean
}

export enum Language {
    Czech = "cs",
    English = "en"
}

export interface LanguageSelectModel {
    flag: JSX.Element,
    id: Language,
    pretty: string
}

export const LanguagesSelect: LanguageSelectModel[] = [
    {
        id: Language.Czech,
        pretty: "Čeština",
        flag: <ReactCountryFlag svg countryCode="cz"></ReactCountryFlag>,

    },
    {
        id: Language.English,
        pretty: "English",
        flag: <ReactCountryFlag svg countryCode="us"></ReactCountryFlag>,
    },
]