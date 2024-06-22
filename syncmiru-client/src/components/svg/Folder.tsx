import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/511832/directory-image-1627
// License: Public Domain

export default function Folder({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 32.64 32.64"
            xmlSpace="preserve"
            className={className || ''}
            fill="currentColor"
        >
            <path
                d="M29.38 9.79H15.3l-3.2-6.53H3.26v26.11h26.11V9.79zm3.26-3.26v26.11H0V0h13.77l3.26 6.53h15.61z"
                fillRule="evenodd"
                clipRule="evenodd"
            />
        </svg>
    )
}

interface Props {
    className?: string
}