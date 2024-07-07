import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/504625/mpv-android
// License: Apache License

export default function MpvThumbnail({className}: Props): ReactElement {
    return (
        <svg
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 666.7 666.7"
            xmlSpace="preserve"
            className={className || ''}
        >
            <style>
                {
                    ".st0,.st1{fill:none;stroke:currentColor;stroke-width:50;stroke-miterlimit:41.6667}.st1{stroke-width:25}"
                }
            </style>
            <circle className="st0" cx={333.3} cy={333.3} r={308.3} />
            <path
                className="st0"
                d="M403.3 325.4L289.6 260c-5.8-3.8-14.2.8-14.2 7.9v131.2c0 6.7 7.9 11.7 14.2 7.9l113.3-65.4c6.3-4.1 6.3-12.8.4-16.2z"
            />
            <circle className="st1" cx={333.3} cy={333.3} r={162.5} />
            <circle className="st1" cx={341.7} cy={318.3} r={218.7} />
        </svg>
    )
}

interface Props {
    className?: string
}