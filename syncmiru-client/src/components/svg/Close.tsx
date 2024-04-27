import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/423627/close-circle
// License: CC Attribution License

export default function Close({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 716.7 716.7"
            xmlSpace="preserve"
            className={className || ''}
            fill="currentColor"
        >
            <path
                d="M358.3 716.7C160.7 716.7 0 556 0 358.3S160.7 0 358.3 0s358.3 160.7 358.3 358.3S556 716.7 358.3 716.7zm0-666.7C188.3 50 50 188.3 50 358.3s138.3 308.3 308.3 308.3 308.3-138.3 308.3-308.3S528.3 50 358.3 50z"/>
            <path
                d="M264 477.7c-6.3 0-12.7-2.3-17.7-7.3-9.7-9.7-9.7-25.7 0-35.3L435 246.3c9.7-9.7 25.7-9.7 35.3 0 9.7 9.7 9.7 25.7 0 35.3L281.7 470.3c-4.7 5-11.4 7.4-17.7 7.4z"/>
            <path
                d="M452.7 477.7c-6.3 0-12.7-2.3-17.7-7.3L246.3 281.7c-9.7-9.7-9.7-25.7 0-35.3 9.7-9.7 25.7-9.7 35.3 0L470.3 435c9.7 9.7 9.7 25.7 0 35.3-5 5-11.3 7.4-17.6 7.4z"/>
        </svg>
    )
}

interface Props {
    className?: string
}