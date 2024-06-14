import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/513604/server
// License: CC Attribution License

export default function Server({className}: Props): ReactElement {
    return (
        <svg
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            className={className || ''}
            fill="currentColor"
        >
            <path
                d="M0 0h16v16H0V0zm2 2v2h12V2H2zm0 4v2h12V6H2zm0 4v4h12v-4H2zm1 2c0-.552.444-1 1-1 .552 0 1 .444 1 1 0 .552-.444 1-1 1-.552 0-1-.444-1-1z"
                fillRule="evenodd"
            />
        </svg>
    )
}

interface Props {
    className?: string
}