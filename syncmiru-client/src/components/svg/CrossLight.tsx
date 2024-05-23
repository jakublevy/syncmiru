import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/520676/cross
// License: CC Attribution License

export default function CrossLight({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 368 368"
            xmlSpace="preserve"
            className={className || ''}
            fill="currentColor"
        >
            <path d="M7 327c-9.4 9.4-9.4 24.6 0 33.9 9.4 9.4 24.6 9.4 33.9 0L7 327zm194-126c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L201 201zm-34-34c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0L167 167zM361 41c9.4-9.4 9.4-24.6 0-33.9-9.4-9.4-24.6-9.4-33.9 0L361 41zM201 167c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9L201 167zm126 194c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L327 361zM167 201c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L167 201zM41 7C31.6-2.3 16.4-2.3 7 7c-9.3 9.4-9.3 24.6 0 34L41 7zm0 354l160-160-34-34L7 327l34 34zm160-160L361 41 327 7 167 167l34 34zm-34 0l160 160 34-34-160-160-34 34zm34-34L41 7 7 41l160 160 34-34z" />
        </svg>
    )
}

interface Props {
    className?: string
}