import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/512415/link-round-1110
// License: Public Domain

export default function Link({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 932.1 481.1"
            xmlSpace="preserve"
            className={className || ''}
            fill="currentColor"
        >
            <path
                d="M1256.1 3359.6c0-132.8-107.7-240.5-240.5-240.5H870.3v80.2h145.3c88.6 0 160.3 71.7 160.4 160.4 0 88.4-72 160.3-160.4 160.4H870.3v80.2h145.3c132.8-.2 240.5-107.9 240.5-240.7zm-691.5 160.3c-42.8 0-83.1-16.7-113.4-46.9-30.3-30.3-47-70.6-46.9-113.4 0-88.4 71.9-160.4 160.3-160.3h145.3V3119H564.6c-132.8 0-240.5 107.7-240.6 240.6 0 66.4 26.9 126.5 70.5 170.1 43.5 43.5 103.7 70.4 170.1 70.5h145.3V3520H564.6zm393.6-200.4v80.2H621.1v-80.2h337.1z"
                fillRule="evenodd"
                clipRule="evenodd"
                transform="translate(-380 -3279) translate(56 160)"
            />
        </svg>
    )
}

interface Props {
    className?: string
}