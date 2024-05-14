import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/423717/synchronize
// License: CC Attribution License

export default function Sync({className}: Props): ReactElement {
    return (
        <svg
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 666.7 666.7"
            xmlSpace="preserve"
            className={className || ''}
            stroke="currentColor"
        >
            <style>
                {
                    ".st0{fill:none;stroke:#000;stroke-width:66.6667;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:133.3333}"
                }
            </style>
            <path
                className="st0"
                d="M33.3 333.3c0-165.7 134.3-300 300-300 94.2 0 178.3 43.5 233.3 111.4"
            />
            <path
                className="st0"
                d="M583.3 33.3v133.3H450M633.3 333.3c0 165.7-134.3 300-300 300-94.2 0-178.3-43.5-233.3-111.4"
            />
            <path className="st0" d="M83.3 633.3V500h133.3" />
        </svg>
    )
}

interface Props {
    className?: string
}