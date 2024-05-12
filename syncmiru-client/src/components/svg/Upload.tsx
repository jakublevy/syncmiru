import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/522322/upload
// License: CC Attribution License

export default function Upload({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 800 693.4"
            xmlSpace="preserve"
            className={className || ''}
            fill="currentColor"
        >
            <path
                d="M855.2 879.4l87.1-105.6V1154c0 14.8 11.9 26.7 26.7 26.7s26.7-11.9 26.7-26.7V772.8l88 106.6c10.4 10.5 27.4 10.5 37.9 0 10.4-10.5 10.4-27.5 0-38L989.7 681.6c-5.6-5.6-13-8-20.3-7.6-7.3-.4-14.7 2-20.3 7.6L817.3 841.4c-10.5 10.5-10.5 27.5 0 38 10.5 10.6 27.5 10.6 37.9 0zm487.1 221.4c-14.7 0-26.7 11.9-26.7 26.7v186.7H622.3v-186.7c0-14.7-11.9-26.7-26.7-26.7s-26.7 11.9-26.7 26.7v213.3c0 14.7 11.9 26.7 26.7 26.7h746.7c14.7 0 26.7-11.9 26.7-26.7v-213.3c0-14.8-11.9-26.7-26.7-26.7z"
                fillRule="evenodd"
                clipRule="evenodd"
                transform="translate(-569 -674)"
            />
        </svg>
    )
}

interface Props {
    className?: string
}