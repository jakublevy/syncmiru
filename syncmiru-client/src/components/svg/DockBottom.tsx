import {ReactElement} from "react";



export default function DockBottom({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 20 16"
            xmlSpace="preserve"
            className={className || ''}
            fill='currentColor'
        >
            <path
                d="M0 16V0h20v16H0zM2 2h16v8H2V2z"
                fillRule="evenodd"
                clipRule="evenodd"
            />
        </svg>
    )
}

interface Props {
    className?: string
}