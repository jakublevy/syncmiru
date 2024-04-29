import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/511788/delete-1487
// License: Public Domain

export default function Delete({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 800 761.9"
            xmlSpace="preserve"
            className={className || ''}
            fill="currentColor"
        >
            <path
                d="M403 809.5h80V504.8h-80v304.7zm160 0h80V504.8h-80v304.7zm-240 76.2h400V428.6H323v457.1zm80-533.3h240v-76.2H403v76.2zm320 0V200H323v152.4H123v76.2h120v533.3h560V428.6h120v-76.2H723z"
                fillRule="evenodd"
                clipRule="evenodd"
                transform="translate(-179 -360) translate(56 160)"
            />
        </svg>
    )
}

interface Props {
    className?: string
}