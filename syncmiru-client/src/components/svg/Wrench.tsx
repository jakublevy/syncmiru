import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/522317/tools
// License: CC Attribution License

export default function Wrench({className}: Props): ReactElement {
    return (
        <svg
            width="800px"
            height="800px"
            viewBox="0 0 30 30"
            xmlns="http://www.w3.org/2000/svg"
            className={className || ''}
            fill="currentColor"
        >
            <path
                d="M600.159 315.37c-.506.568-1.346 1.291-2.55 2.392-1.275 1.272-3.08 1.272-4.355 0-1.276-1.274-1.276-3.074 0-4.347 1.175-1.173 2.438-2.562 2.418-2.568-3.415-1.573-7.59-.965-10.404 1.843-2.565 2.559-3.296 6.245-2.217 9.456l-10.851 10.83a4.09 4.09 0 000 5.795 4.114 4.114 0 005.808 0l10.85-10.829c3.22 1.079 6.913.347 9.478-2.212 2.81-2.805 3.394-6.955 1.823-10.36"
                transform="translate(-571 -310)"
                stroke="none"
                strokeWidth={1}
                fillRule="evenodd"
            />
        </svg>
    )
}

interface Props {
    className?: string
}