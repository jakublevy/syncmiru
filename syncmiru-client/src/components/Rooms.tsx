import {ReactElement} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import Loading from "@components/Loading.tsx";

export default function Rooms(): ReactElement {
    const {rooms, roomsLoading} = useMainContext()

    if (roomsLoading)
        return (
            <div className="border flex-1 overflow-auto">
                <div className="flex justify-center align-middle h-full">
                    <Loading/>
                </div>
            </div>
        )

    return (
        <div className="border flex-1 overflow-auto">
            <ul>
                {[...rooms].map((item) => {
                    return <>{item[1].name}</>
                })}
            </ul>
        </div>
    )
}