import {ChangeEvent, MouseEvent, ReactElement} from "react";
import {Input} from "@components/widgets/Input.tsx";
import Label from "@components/widgets/Label.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import {useTranslation} from "react-i18next";

export default function ReadyBtn(): ReactElement {
    const {t} = useTranslation()
    const {ready, setReady} = useMainContext()
    const roomJoined = true

    function containerClicked(e: MouseEvent<HTMLDivElement>) {
        if((e.target as HTMLElement).tagName !== "DIV")
            return
        if(!roomJoined)
            return

        setReady((p) => !p)
    }

    function readyChanged(e: ChangeEvent<HTMLInputElement>) {
        setReady(e.target.checked)
    }

    return (
        <div
            className={`flex items-center gap-x-1.5 border py-1 px-4 ${roomJoined ? 'hover:cursor-pointer' : ''}`}
            onClick={containerClicked}
        >
            <div>
                <Input
                    id="ready"
                    type="checkbox"
                    className={`${roomJoined ? 'hover:cursor-pointer' : ''}`}
                    checked={ready}
                    onChange={readyChanged}
                    disabled={!roomJoined}
                />
            </div>
            <Label
                className={`mt-1 select-none ${roomJoined ? 'hover:cursor-pointer' : 'opacity-30'}`}
                htmlFor="ready">{t('ready-btn')}</Label>
        </div>
    )
}