import {ReactElement} from "react";
import VSelect from "@components/svg/VSelect.tsx";
import {Btn} from "@components/widgets/Button.tsx";

export default function SrvInfo(): ReactElement {
    return (
        <Btn className="hover:bg-gray-100 dark:hover:bg-gray-700">
            <div className="flex items-center justify-between border break-words min-h-10">
                <p className="text-sm max-w-60 p-1">https://syncmiru.levy.cx</p>
                <VSelect className="w-4 mr-2"/>
            </div>
        </Btn>
    )
}