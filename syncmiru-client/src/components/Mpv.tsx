import {ReactElement} from "react";

export default function Mpv(): ReactElement {
    return (
        <Resizable className="border"
                   enable={{top: true}}
                   defaultSize={{height: "35vh", width: "auto"}}
                   minHeight="15vh"
                   maxHeight="70vh"
        >
            Sample with default size
        </Resizable>
    )
}