import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/525949/hourglass
// License: CC Attribution License

export default function HourGlass({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 466.7 666.7"
            xmlSpace="preserve"
            className={`fill-orange-500 ${className || ''}`}
        >
            <path
                d="M6.6 43.3C26.7 0 95.6 0 233.3 0 371.1 0 440 0 460.1 43.3c1.7 3.7 3.2 7.6 4.4 11.6 13.6 46.2-35.1 99.8-132.5 207l-65.3 71.4 65.3 71.4C429.3 512 478 565.6 464.4 611.8c-1.2 4-2.6 7.8-4.4 11.6-20.1 43.3-89 43.3-226.7 43.3-137.8 0-206.7 0-226.7-43.3-1.7-3.7-3.2-7.6-4.4-11.6-13.6-46.2 35.1-99.8 132.5-207l65.3-71.4-65.3-71.4C37.3 154.7-11.4 101.1 2.3 54.9c1.1-4 2.6-7.9 4.3-11.6z"
            />
        </svg>
    )
}

interface Props {
    className?: string
}