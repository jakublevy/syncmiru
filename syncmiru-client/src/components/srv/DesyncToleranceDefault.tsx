import {ReactElement} from "react";
import {EditBtn} from "@components/widgets/Button.tsx";
import {useTranslation} from "react-i18next";
import Help from "@components/widgets/Help.tsx";

export default function DesyncToleranceDefault(p: Props): ReactElement {
    const {t} = useTranslation()

    function editClicked() {

    }

    return (
        <>
            <div className="flex items-center">
                <div className="w-64 flex items-center gap-x-1">
                    <p>{t('default-room-desync-tolerance-title')}</p>
                    <Help className="w-4" tooltipId="desync-tolerance-help" content={t('default-room-desync-tolerance-help')}/>
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