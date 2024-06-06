import {ReactElement} from "react";

// Source: https://www.onlinewebfonts.com/icon/141671
// License: CC BY 4.0

export default function Eject({className}: Props): ReactElement {
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
            <path d="M229.8 136.7c-3.4 0-6.2 2.8-6.2 6.2v31c0 6.9-5.6 12.4-12.4 12.4H24.8c-6.8 0-12.4-5.6-12.4-12.4v-149c0-6.9 5.6-12.5 12.4-12.5h68.3c3.4 0 6.2-2.8 6.2-6.2S96.5 0 93.1 0H24.8C11.1.1 0 11.2 0 24.9V174c0 13.7 11.1 24.9 24.8 24.9h186.3c13.7 0 24.8-11.2 24.8-24.9v-31.1c.1-3.4-2.7-6.2-6.1-6.2zm4.7-134.5l-.9-.9c-.9-.7-2.1-1.2-3.3-1.3h-87.4c-3.4 0-6.2 2.8-6.2 6.2s2.8 6.2 6.2 6.2h72l-126 126c-2.4 2.4-2.4 6.4 0 8.8 1.2 1.2 2.8 1.8 4.4 1.8s3.2-.6 4.4-1.8l126-126v72c0 3.4 2.8 6.2 6.2 6.2s6.2-2.8 6.2-6.2V6.3c-.1-1.6-.7-3-1.6-4.1z" />
        </svg>
    )
}

interface Props {
    className?: string
}