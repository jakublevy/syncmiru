import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/510302/upload
// License: MIT License

export default function UploadCloud({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 700 533.3"
            xmlSpace="preserve"
            className={className || ''}
            fill="currentColor"
        >
            <path
                d="M216.7 200c0-73.6 59.7-133.3 133.3-133.3 73.6 0 133.3 59.7 133.3 133.3v33.3h33.3c64.4 0 116.7 52.2 116.7 116.7s-52.2 116.7-116.7 116.7h-33.3c-18.4 0-33.3 14.9-33.3 33.3s14.9 33.3 33.3 33.3h33.3c101.3 0 183.4-82 183.4-183.3 0-90.7-65.9-166-152.3-180.7C532.9 73.4 450 0 350 0 250 0 167.1 73.4 152.3 169.3 65.9 184 0 259.3 0 350c0 101.3 82.1 183.3 183.3 183.3h33.3c18.4 0 33.3-14.9 33.3-33.3s-14.9-33.3-33.3-33.3h-33.3c-64.4 0-116.7-52.2-116.7-116.7s52.2-116.7 116.7-116.7h33.3V200zm256.9 109.8l-100-100c-13-13-34.1-13-47.1 0l-100 100c-13 13-13 34.1 0 47.1s34.1 13 47.1 0l43.1-43.1V500c0 18.4 14.9 33.3 33.3 33.3s33.3-14.9 33.3-33.3V313.8l43.1 43.1c13 13 34.1 13 47.1 0 13.1-13 13.1-34.1.1-47.1z"
                fillRule="evenodd"
                clipRule="evenodd"
            />
        </svg>
    )
}

interface Props {
    className?: string
}