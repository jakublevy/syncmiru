import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/506777/view-eye
// License: Public Domain

export default function View({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 800 480"
            xmlSpace="preserve"
            className={className || ''}
        >
            <path
                d="M684 4643c0 45.9-35.8 83-80 83s-80-37.2-80-83 35.8-83 80-83 80 37.1 80 83m-80 157c-119.6 0-232.2-59.1-304-156.9 71.8-97.9 184.5-157 304-157s232.2 59.1 304 157c-71.8 97.8-184.4 156.9-304 156.9m0-397c-171 0-320 96.7-400 240 80 143.3 229 240 400 240s320-96.6 400-240c-80-143.3-229-240-400-240"
                fillRule="evenodd"
                clipRule="evenodd"
                transform="translate(-260 -4563) translate(56 160)"
            />
        </svg>
    )
}

interface Props {
    className?: string;
}