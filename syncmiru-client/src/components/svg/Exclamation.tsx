import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/403243/exclamation-mark
// License: MIT

export default function Exclamation({className, fill = "#ee1e40"}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 225 750"
            xmlSpace="preserve"
            className={className || ''}
            fill={fill}
        >
            <path d="M174.9 505.5H50.1L0 0h225l-50.1 505.5z"/>
            <ellipse cx={112.5} cy={654.4} rx={95.8} ry={95.6}/>
        </svg>
    )
}

interface Props {
    className?: string,
    fill?: string
}