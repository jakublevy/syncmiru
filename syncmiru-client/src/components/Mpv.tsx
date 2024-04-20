import {ReactElement} from "react";

export default function Mpv({height}: Props): ReactElement {
    return (
        <div className="border" style={{height: height}}>this is place for mpv</div>
    )
}

interface Props {
    height: number | string
}