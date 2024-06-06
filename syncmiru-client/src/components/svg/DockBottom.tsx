import {ReactElement} from "react";

// Source: https://www.onlinewebfonts.com/icon/141671
// License: CC BY 4.0

export default function DockBottom({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 236.1 198.9"
            xmlSpace="preserve"
            className={className || ''}
            fill="currentColor"
        >
            <path d="M6.3 62.2c3.4 0 6.2-2.8 6.2-6.2V25c0-6.9 5.6-12.4 12.4-12.4h186.4c6.8 0 12.4 5.6 12.4 12.4v149c0 6.9-5.6 12.5-12.4 12.5H143c-3.4 0-6.2 2.8-6.2 6.2 0 3.4 2.8 6.2 6.2 6.2h68.3c13.7-.1 24.8-11.2 24.8-24.9V24.9C236.1 11.2 225 0 211.3 0H25C11.3 0 .2 11.2.2 24.9V56c-.1 3.4 2.7 6.2 6.1 6.2zM1.6 196.7l.9.9c.9.7 2.1 1.2 3.3 1.3h87.4c3.4 0 6.2-2.8 6.2-6.2 0-3.4-2.8-6.2-6.2-6.2h-72l126-126c2.4-2.4 2.4-6.4 0-8.8-1.2-1.2-2.8-1.8-4.4-1.8-1.6 0-3.2.6-4.4 1.8l-126 126v-72c0-3.4-2.8-6.2-6.2-6.2S0 102.3 0 105.7v86.9c.1 1.6.7 3 1.6 4.1z" />
        </svg>
    )
}

interface Props {
    className?: string
}