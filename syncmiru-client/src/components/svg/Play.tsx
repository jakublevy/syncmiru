import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/522226/play
// License: CC Attribution License

export default function Play({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 628.6 800.8"
            xmlSpace="preserve"
            fill="currentColor"
            className={className || ''}
        >
            <path
                d="M1030.9 930.2L488.1 580.4c-32.2-17.3-69.1-15.5-69.1 46.7v688.8c0 56.9 39.6 65.9 69.1 46.7l542.8-349.8c22.3-22.8 22.3-59.7 0-82.6"
                fillRule="evenodd"
                clipRule="evenodd"
                transform="translate(-419 -571)"
            />
        </svg>
    )
}

interface Props {
    className?: string
}