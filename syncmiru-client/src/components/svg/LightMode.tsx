import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/432507/light-mode
// License: MIT

export default function LightMode({className}: Props): ReactElement {
    return (
        <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={className || ''}
            fill="currentColor"
        >
            <g clipPath="url(#a)">
                <path d="M12 0a1 1 0 011 1v4a1 1 0 11-2 0V1a1 1 0 011-1zM4.929 3.515a1 1 0 00-1.414 1.414l2.828 2.828a1 1 0 001.414-1.414L4.93 3.515zM1 11a1 1 0 100 2h4a1 1 0 100-2H1zm17 1a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1zm-.343 4.243a1 1 0 00-1.414 1.414l2.828 2.828a1 1 0 101.414-1.414l-2.828-2.828zm-9.9 1.414a1 1 0 10-1.414-1.414L3.515 19.07a1 1 0 101.414 1.414l2.828-2.828zM20.485 4.929a1 1 0 00-1.414-1.414l-2.828 2.828a1 1 0 101.414 1.414l2.828-2.828zM13 19a1 1 0 10-2 0v4a1 1 0 102 0v-4zM12 7a5 5 0 100 10 5 5 0 000-10z" />
            </g>
            <defs>
                <clipPath id="a">
                    <path fill="#fff" d="M0 0h24v24H0z" />
                </clipPath>
            </defs>
        </svg>
    )
}

interface Props {
    className?: string
}