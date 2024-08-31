import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/446804/reload
// License: MIT

export default function Reload({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 20 20.1"
            xmlSpace="preserve"
            className={className || ''}
        >
            <path
                d="M19 0l-2.5 2.5C14.7 1 12.5.1 10 .1 4.5.1 0 4.6 0 10.1s4.5 10 10 10 10-4.5 10-10h-2c0 4.5-3.5 8-8 8s-8-3.5-8-8 3.5-8 8-8c1.9 0 3.7.7 5.1 1.8l-2.2 2.2H19V0z"/>
            <path fill="none" d="M-2 -1.9H22V22.1H-2z"/>
        </svg>
    )
}

interface Props {
    className?: string
}