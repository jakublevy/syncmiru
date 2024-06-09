import React, {ReactElement} from "react";
import Avatar from "@components/widgets/Avatar.tsx";
import 'src/rc-tooltip.css'
import Tooltip from "rc-tooltip";
import {UserValueClient} from "@models/user.ts";

export default function UserInfoTooltip(p: Props): ReactElement {
    function onVisibleChanged(visible: boolean) {
        if (p.tooltipOnlineVisibilityChanged != null)
            p.tooltipOnlineVisibilityChanged(visible, p.id)
    }

    return (
        <Tooltip onVisibleChange={onVisibleChanged}
                 placement="bottom"
                 trigger={['click']}
                 visible={p.visible}
                 overlay={
                     <div className="flex items-center w-[12.3rem]">
                         <Avatar className="min-w-20 w-20 mr-3" picBase64={p.user.avatar}/>
                         <div className="flex flex-col items-start justify-center">
                             <p className="break-words max-w-[7.1rem] text-xl">{p.user.displayname}</p>
                             <p className="text-sm -mt-1">{p.user.username}</p>
                         </div>
                     </div>
                 }>
            {p.content}
        </Tooltip>
    )
}

interface Props {
    id: number
    content: ReactElement,
    user: UserValueClient
    tooltipOnlineVisibilityChanged?: (e: boolean, id: number) => void,
    visible?: boolean
}