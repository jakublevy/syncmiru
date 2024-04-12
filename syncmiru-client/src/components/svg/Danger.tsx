import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/489221/warning
// License: Public Domain

export default function Danger({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 512 443.4"
            xmlSpace="preserve"
            className={className}
        >
            <path
                d="M256 0L0 443.4h512L256 0zm0 60l204 353.4H52L256 60z"
                fill="#dc2626"
            />
            <circle cx={256} cy={363.4} r={15} fill="currentcolor" />
            <path d="M241 158.4H271V318.4H241z" fill="currentcolor" />
        </svg>
    )
}

interface Props {
    className?: string
}