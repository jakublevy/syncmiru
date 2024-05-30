import {ReactElement} from "react";
import Help from "@components/widgets/Help.tsx";
import {EditBtn} from "@components/widgets/Button.tsx";
import {useTranslation} from "react-i18next";
import {useMainContext} from "@hooks/useMainContext.ts";

export default function MinorDesyncAction(p: Props): ReactElement {
    const {t} = useTranslation()
    const {socket} = useMainContext()

    function editClicked() {

    }

    return (
        <>
            <div className="flex items-center">
                <div className="w-64 flex items-center gap-x-1">
                    <p>{t('default-room-minor-desync-action-title')}</p>
                    <Help className="w-4" tooltipId="minor-desync-action-help"
                          content={t('default-room-minor-desync-action-help')}/>
                </div>
                <p className="font-bold">TODO</p>
                <div className="flex-1"></div>
                <EditBtn className="w-10" onClick={editClicked}/>
            </div>
        </>
    )
}

interface Props {
    setLoading: (b: boolean) => void
}