import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/501352/settings
// License: MIT

export default function Settings({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 785 800"
            xmlSpace="preserve"
            className={className || ''}
            fill="currentColor"
        >
            <path
                d="M702.3 400c0-17.4-1.6-35.2-4.8-53l87.6-75.9-83.1-142-110.5 36.8c-27.9-23.2-59.7-41.4-93.3-53.5L475.4 0H309.6l-22.8 112.4c-33.9 12.1-65.2 30.1-93.3 53.5L83.1 129.1 0 271.1 87.6 347c-3.2 17.8-4.8 35.6-4.8 53s1.6 35.2 4.8 53L0 528.9l83.1 142 110.5-36.8c27.9 23.2 59.7 41.4 93.3 53.5L309.6 800h165.7l22.8-112.4c33.9-12.1 65.2-30.1 93.3-53.5L701.9 671 785 529l-87.5-76c3.2-17.8 4.8-35.6 4.8-53M392.5 564.7c-90.8 0-164.7-73.9-164.7-164.7s73.9-164.7 164.7-164.7c90.8 0 164.7 73.9 164.7 164.7s-73.9 164.7-164.7 164.7"
                fillRule="evenodd"
                clipRule="evenodd"
            />
        </svg>
    )
}

interface Props {
    className?: string
}