import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/506777/view-eye
// License: Public Domain

export default function View({className}: Props): ReactElement {
    return (
        <svg
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 666.7 466.7"
            xmlSpace="preserve"
            className={className || ''}
            fill="currentColor"
        >
            <style>{".st0{fill-rule:evenodd;clip-rule:evenodd}"}</style>
            <path
                className="st0"
                d="M333.3 133.3c-55.2 0-100 44.8-100 100s44.8 100 100 100 100-44.8 100-100-44.7-100-100-100zm-33.3 100c0-18.4 14.9-33.3 33.3-33.3s33.3 14.9 33.3 33.3-14.9 33.3-33.3 33.3-33.3-14.9-33.3-33.3z"
            />
            <path
                className="st0"
                d="M661 209.4C584.7 71.7 460.4 0 333.3 0 206.3 0 81.9 71.7 5.7 209.4c-7.5 13.5-7.5 30-.3 43.6 75.1 140.5 200.1 213.7 328 213.7s252.9-73.3 328-213.7c7.1-13.6 7.1-30.2-.4-43.6zM333.3 400c-98 0-198.6-54.3-263.6-168.4 65.9-111.8 166-165 263.6-165 97.6 0 197.7 53.2 263.6 165C532 345.7 431.3 400 333.3 400z"
            />
        </svg>
    )
}

interface Props {
    className?: string;
}