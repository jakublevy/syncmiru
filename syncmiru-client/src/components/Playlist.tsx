import {ReactElement} from "react";

export default function Playlist({height}: Props): ReactElement {
    return (
        <div className="border overflow-auto" style={{height: height}}>
            <ul>
                <li>ahoj</li>
                <li>ahoj</li>
                <li>ahoj</li>
                <li>ahoj</li>
                <li>ahoj</li>
                <li>ahoj</li>
                <li>ahoj</li>
                <li>ahoj</li>
                <li>ahoj</li>
                <li>ahoj</li>
            </ul>
        </div>
    )
}

interface Props {
    height: number | string
}