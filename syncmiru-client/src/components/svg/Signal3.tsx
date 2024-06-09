import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/487791/signal
// License: CC Attribution License

export default function Signal3({className, tooltipId, tabIndex}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 379 519"
            xmlSpace="preserve"
            className={`fill-success dark:fill-successdark ${className || ''}`}
            data-tooltip-id={tooltipId}
            tabIndex={tabIndex}
        >
            <path d="M33.3 519C14.9 519 0 511.2 0 501.4V360.5c0-9.7 14.9-17.6 33.3-17.6s33.3 7.9 33.3 17.6v140.9c.1 9.8-14.9 17.6-33.3 17.6zM222.8 494.7V202.3c0-13.5-14.9-24.3-33.3-24.3s-33.3 10.9-33.3 24.3v292.4c0 13.5 14.9 24.3 33.3 24.3s33.3-10.9 33.3-24.3zM379 490.2V28.8C379 12.9 364.1 0 345.7 0s-33.3 12.9-33.3 28.8v461.3c0 15.9 14.9 28.8 33.3 28.8 18.4.1 33.3-12.8 33.3-28.7z" />
        </svg>
    )
}

interface Props {
    className?: string,
    tooltipId?: string,
    tabIndex?: number
}