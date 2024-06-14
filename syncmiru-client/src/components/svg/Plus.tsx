import * as React from "react"
import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/522231/plus-circle
// License: CC Attribution License

export default function Plus({className}: Props): ReactElement {
    return (
        <svg
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            className={className || ''}
            fill="currentColor"
        >
            <path
                d="M488 1106h-5v5a1.001 1.001 0 01-2 0v-5h-5a1.001 1.001 0 010-2h5v-5a1.001 1.001 0 012 0v5h5a1.001 1.001 0 010 2zm-6-17c-8.837 0-16 7.16-16 16s7.163 16 16 16 16-7.16 16-16-7.163-16-16-16z"
                transform="translate(-466 -1089)"
                stroke="none"
                strokeWidth={1}
                fillRule="evenodd"
            />
        </svg>
    )
}

interface Props {
    className?: string,
    fill?: string
}