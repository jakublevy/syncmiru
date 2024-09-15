import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/469166/left-right-arrow-2
// License: Public Domain

export default function LeftRightArrow({className}: Props): ReactElement {
    return (
        <svg
            id="left-right-arrow-2"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 666.7 266.7"
            xmlSpace="preserve"
            className={className || ''}
            stroke="currentColor"
        >
            <style>
                {
                    ".st0{fill:none;stroke-width:66.6667;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:133.3333}"
                }
            </style>
            <path id="primary" className="st0" d="M33.3 133.3L633.3 133.3" />
            <path
                id="primary-2"
                className="st0"
                d="M533.3 33.3L633.3 133.3 533.3 233.3"
            />
            <path
                id="primary-3"
                className="st0"
                d="M133.3 233.3L33.3 133.3 133.3 33.3"
            />
        </svg>
    )
}

interface Props {
    className?: string
}