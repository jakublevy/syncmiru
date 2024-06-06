import {ReactElement} from "react";

export default function ExpandLeft({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 533.3 566.7"
            xmlSpace="preserve"
            className={className || ''}
            fill="currentColor"
        >
            <path d="M56.9 300l104.9 104.9c6.5 6.5 6.5 17.1 0 23.6s-17.1 6.5-23.6 0L4.9 295.1c-6.5-6.5-6.5-17.1 0-23.6l133.3-133.3c6.5-6.5 17.1-6.5 23.6 0s6.5 17.1 0 23.6L56.9 266.7h359.8c9.2 0 16.7 7.5 16.7 16.7s-7.5 16.7-16.7 16.7H56.9zM500 16.7C500 7.5 507.5 0 516.7 0s16.7 7.5 16.7 16.7V550c0 9.2-7.5 16.7-16.7 16.7S500 559.2 500 550V16.7z" />
        </svg>
    )
}

interface Props {
    className?: string
}