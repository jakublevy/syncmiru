import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/342945/zoom-reset
// License: PD License

export default function ZoomReset({className}: Props): ReactElement {
    return (
        <svg
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 571.4 647.6"
            xmlSpace="preserve"
            className={className || ''}
            fill="currentColor"
        >
            <style>
                {
                    ".st0{fill:none;stroke:#000;stroke-width:38.0952;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:152.381}"
                }
            </style>
            <path
                className="st0"
                d="M16 284.7c0 105.2 85.3 190.5 190.5 190.5S397 389.9 397 284.7 311.7 94.2 206.5 94.2c-61 0-115.4 28.7-150.2 73.4"
                transform="translate(3 1)"
            />
            <path
                className="st0"
                d="M54.1 18v152.4h152.4M549.4 627.6L344.5 422.7"
                transform="translate(3 1)"
            />
        </svg>
    )
}

interface Props {
    className?: string
}