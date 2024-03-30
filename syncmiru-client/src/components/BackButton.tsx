import Previous from "./svg/Previous.tsx";
import React, {ReactElement} from "react";

export default function BackButton({onClick, className}: {onClick: (event: React.MouseEvent<HTMLButtonElement>) => void, className: string}): ReactElement {
    return (
        <button className={`rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 ${className}`} onClick={onClick}>
            <Previous height="3rem"/>
        </button>
    )
}