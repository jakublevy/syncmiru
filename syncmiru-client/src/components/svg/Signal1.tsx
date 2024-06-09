import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/487791/signal
// License: CC Attribution License

export default function Signal1({className, tabIndex, tooltipId}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 379 519"
            xmlSpace="preserve"
            className={`fill-danger ${className || ''}`}
            data-tooltip-id={tooltipId}
            tabIndex={tabIndex}
        >
            <path d="M33.3 519C14.9 519 0 511.2 0 501.4V360.5c0-9.7 14.9-17.6 33.3-17.6s33.3 7.9 33.3 17.6v140.9c.1 9.8-14.9 17.6-33.3 17.6z" />
        </svg>
    )
}

interface Props {
    className?: string,
    tooltipId?: string,
    tabIndex?: number
}