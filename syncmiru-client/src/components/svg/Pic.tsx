import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/488322/picture
// License: MIT

export default function Pic({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 666.7 666.7"
            xmlSpace="preserve"
            className={className || ''}
            fill="currentColor"
        >
            <path d="M633.3 0h-600C14.9 0 0 14.9 0 33.3v600c0 18.4 14.9 33.3 33.3 33.3h600c18.4 0 33.3-14.9 33.3-33.3v-600C666.7 14.9 651.7 0 633.3 0zM600 400L500 300 333.3 466.7 266.7 400l-200 200V66.7H600V400zM133.3 216.7c0-46 37.3-83.3 83.3-83.3s83.3 37.3 83.3 83.3-37.2 83.3-83.2 83.3-83.4-37.3-83.4-83.3z" />
        </svg>
    )
}

interface Props {
    className?: string
}