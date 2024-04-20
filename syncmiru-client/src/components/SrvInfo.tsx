import {ReactElement} from "react";
import VSelect from "@components/svg/VSelect.tsx";
import {Btn} from "@components/widgets/Button.tsx";

export default function SrvInfo(): ReactElement {
    return (
        <Btn className="hover:bg-gray-100 dark:hover:bg-gray-700 border h-12">
            <div className="flex items-center justify-between h-12 break-words">
                <p className="text-sm max-w-[13.2rem] p-1">https://syncmiru.levylevylevylevclevylevylevylevylevylevylecxy.cx</p>
                <VSelect className="w-4 mr-2"/>
            </div>
        </Btn>
    )
}