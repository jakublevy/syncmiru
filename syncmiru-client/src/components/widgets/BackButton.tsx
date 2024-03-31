import Previous from "@components/svg/Previous.tsx";
import React, {ReactElement} from "react";

export default function BackButton({onClick, className}: Props): ReactElement {
    return (
        <button className={`rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 ${className}`} onClick={onClick}>
            <Previous height="3rem"/>
        </button>
    )
}

interface Props {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void,
    className: string
}