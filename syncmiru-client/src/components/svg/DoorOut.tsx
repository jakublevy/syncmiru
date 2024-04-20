// Source: https://www.svgrepo.com/svg/304503/session-leave
// License: Public Domain

import {ReactElement} from "react";

export default function DoorOut({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 207.2 207.2"
            xmlSpace="preserve"
            className={className || ''}
        >
            <path fill="none" d="M399.5 395.5H683.6V679.6H399.5z" />
            <path
                d="M34.9 207.2C16.3 207.8.7 193.3 0 174.6v-142C.7 13.9 16.3-.6 34.9 0h104.2c4.9 0 8.9 4 8.9 8.9s-4 8.9-8.9 8.9H34.9c-8.8-.6-16.5 6-17.2 14.8v142.1c.7 8.8 8.4 15.4 17.2 14.8h104.2c4.9 0 8.9 4 8.9 8.9s-4 8.9-8.9 8.9H34.9zm109.7-50c-3.5-3.5-3.5-9.1 0-12.6l32.2-32.2H68.1c-4.9 0-8.9-4-8.9-8.9s4-8.9 8.9-8.9h108.8l-32.2-32.2c-3.5-3.4-3.6-9-.2-12.6 3.4-3.5 9-3.6 12.6-.2l.2.2 47.4 47.4c3.5 3.5 3.5 9.1 0 12.5l-47.4 47.4c-3.6 3.6-9.2 3.6-12.7.1z"
                fill="currentColor"
            />
        </svg>
    )
}

interface Props {
    className?: string
}