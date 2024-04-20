import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/404945/check-mark
// License: MIT

export default function Check({className, fill}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 800 800"
            xmlSpace="preserve"
            className={className || ''}
        >
            <path
                d="M769.3 10.9C738-9.4 696.2-.5 675.9 30.6L297.7 613.8 113.2 443.3c-27.4-25.3-70-23.7-95.3 3.7-25.3 27.4-23.7 70 3.7 95.3l242.1 224s6.8 6.1 10.3 8.2c31.3 20.3 73.2 11.3 93.4-19.7l421.9-650.1c20-31.7 11.1-73.6-20-93.8z"
                fill={fill}
            />
        </svg>
    )
}

interface Props {
    className?: string
    fill?: string
}

Check.defaultProps = {
    fill: "#1c7f21"
}