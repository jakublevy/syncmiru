import {ReactElement} from "react";
import DefaultAvatar from "@components/svg/DefaultAvatar.tsx";
import {SvgBtn} from "@components/widgets/Button.tsx";
import Settings from "@components/svg/Settings.tsx";

export default function CurrentUser(): ReactElement {
    return (
        <div className="flex justify-between items-center p-2">
            <div className="flex">
                <DefaultAvatar className="w-12 rounded-full mr-3"/>
                <div className="flex flex-col items-start justify-center">
                    <p>Ardor</p>
                    <p className="text-xs -mt-1">Otoson</p>
                </div>
            </div>
            <SvgBtn className="p-3" onClick={() => {}}>
                <Settings className="h-6"/>
            </SvgBtn>
        </div>
    )
}

