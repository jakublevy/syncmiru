import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/513824/edit
// License: CC Attribution License

export default function Edit({className}: Props): ReactElement {
    return (
        <svg
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 733.3 733.3"
            xmlSpace="preserve"
            stroke="#000"
            className={className || ''}
        >
            <style>
                {
                    ".st0{fill:none;stroke-width:66.6667;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:133.3333}"
                }
            </style>
            <g id="Complete">
                <g id="edit">
                    <path
                        className="st0"
                        d="M633.3 500v133.3c0 36.8-29.8 66.7-66.7 66.7H100c-36.8 0-66.7-29.8-66.7-66.7V166.7c0-36.8 29.8-66.7 66.7-66.7h133.3"
                    />
                    <path
                        className="st0"
                        d="M383.3 493.3L700 173.3 560 33.3 243.3 350 233.3 500z"
                    />
                </g>
            </g>
        </svg>
    )
}

interface Props {
    className?: string
}