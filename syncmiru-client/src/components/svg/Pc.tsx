import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/478552/pc-display-2
// License: Public Domain

export default function Pc({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 800 677.5"
            xmlSpace="preserve"
            className={className || ''}
            fill="currentColor"
        >
            <path d="M746.9 0H53.1C23.8 0 0 23.8 0 53.2v443.7C0 526.2 23.8 550 53.1 550h290.6v11.8c0 29.3-23.8 53.1-53.1 53.1h-78.1v62.5h375.1V615h-78.1c-29.4 0-53.1-23.8-53.1-53.1V550H747c29.4 0 53.1-23.8 53.1-53.1V53.2C800 23.8 776.2 0 746.9 0zM725 432.3c0 9.8-7.9 17.7-17.7 17.7H92.7c-9.8 0-17.7-7.9-17.7-17.7V92.7C75 82.9 82.9 75 92.7 75h614.6c9.8 0 17.7 7.9 17.7 17.7v339.6z" />
        </svg>
    )
}

interface Props {
    className?: string
}