import {ReactElement} from "react";
import DoorOut from "@components/svg/DoorOut.tsx";
import {Clickable} from "@components/widgets/Button.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";

export default function JoinedRoom(): ReactElement {
    const {rooms, currentRid, roomConnecting} = useMainContext()

    if(currentRid == null)
        return <></>

    const room = rooms.get(currentRid)
    const connectionMsg = roomConnecting
        ? 'Probíhá připojování'
        : 'Připojen(a)'

    if(room == null)
        return <></>

    return (
        <div className="flex justify-between items-center border-l border-t p-2">
            <div className="flex flex-col">
                <p className="text-xs">{connectionMsg}</p>
                <p>{room.name}</p>
            </div>
            <Clickable onClick={() => {}} className="p-2">
                <DoorOut className="w-7"/>
            </Clickable>
        </div>
    )
}