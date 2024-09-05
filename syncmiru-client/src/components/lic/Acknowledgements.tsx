import {ReactElement} from "react";
import {useTranslation} from "react-i18next";
import {createLocaleComparator} from "src/utils/sort.ts";

export default function Acknowledgements(): ReactElement {
    const {t} = useTranslation()
    const localeComparator = createLocaleComparator(t)
    const deps: Array<Dep> = [
        {
            name: "tauri",
            url: "https://tauri.app/",
            copyright: "Copyright (c) 2017 - Present Tauri Apps Contributors",
            license: "MIT and Apache-2.0 dual license"
        },
        {
            name: "serde",
            url: "https://serde.rs/",
            copyright: "",
            license: "MIT and Apache-2.0 dual license"
        },
    ]

    return (
        <div className="flex flex-col">
            <div className="flex items-center m-8">
                <h1 className="text-2xl font-bold">{t('license-acknowledgements-title')}</h1>
            </div>
            <div className="flex flex-col ml-8 mr-8 mb-4 gap-y-6">
                <p>{t('license-acknowledgements-text')}</p>
                <pre className="border text-sm w-full h-[calc(100dvh-14.9rem)] overflow-y-auto p-1.5">
                    {deps.sort((d1, d2) => localeComparator(d1.name, d2.name)).map((d, i) => {
                        return (
                            <p key={i}>
                                {d.name} &lt;{d.url}&gt;&#10;{d.copyright}{d.copyright !== '' && <>&#10;</>}{d.license}
                                {i + 1 < deps.length && <>&#10;&#10;</>}
                            </p>
                        )
                    })}
                </pre>
            </div>
        </div>
    )
}

interface Dep {
    name: string,
    url: string,
    copyright: string,
    license: string
}