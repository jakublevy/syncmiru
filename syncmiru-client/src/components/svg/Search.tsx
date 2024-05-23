import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/532555/search
// License: CC Attribution License

export default function Search({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 666.7 666.7"
            xmlSpace="preserve"
            className={className || ''}
            stroke="currentColor"
        >
            <path
                d="M459.8 460.4l173.5 173m-100-350.1c0 138.1-111.9 250-250 250s-250-111.9-250-250 111.9-250 250-250 250 112 250 250z"
                fill="none"
                strokeWidth={66.6667}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit={133.3333}
            />
        </svg>
    )
}

interface Props {
    className?: string
}