import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/446039/subtitles
// License: MIT

export default function SubtitlesCrossed({className}: Props): ReactElement {
    return (
        <svg
            id="Layer_1"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 44.66 45.32"
            className={className || ''}
            fill="currentColor"
        >
            <g id="Layer_2" data-name="Layer 2">
                <g id="icons_Q2" data-name="icons Q2">
                    <path
                        d="M10.15 34.62h14.21c1.12 0 2.03-.91 2.03-2.03s-.91-2.03-2.03-2.03H10.15c-1.12 0-2.03.91-2.03 2.03s.91 2.03 2.03 2.03zM34.51 30.55h-4.06c-1.12 0-2.03.91-2.03 2.03s.91 2.03 2.03 2.03h4.06c1.12 0 2.03-.91 2.03-2.03s-.91-2.03-2.03-2.03zM20.3 28.52h14.21c1.12 0 2.03-.91 2.03-2.03s-.91-2.03-2.03-2.03H20.3c-1.12 0-2.03.91-2.03 2.03s.91 2.03 2.03 2.03zM10.15 28.52h4.06c1.12 0 2.03-.91 2.03-2.03s-.91-2.03-2.03-2.03h-4.06c-1.12 0-2.03.91-2.03 2.03s.91 2.03 2.03 2.03z"
                    />
                </g>
            </g>
            <path
                fill="none"
                d="M16 8.22L4.06 8.22 4.06 36.65 40.6 36.65 40.6 19.89 16 19.89 16 8.22z"
            />
            <path
                d="M44.66 6.17v13.72H40.6v16.76H4.06V8.22H16V4.16H2.03C.91 4.16 0 5.07 0 6.19v32.48c0 1.12.91 2.03 2.03 2.03h40.6c1.12 0 2.03-.91 2.03-2.03V6.19v-.02z"
            />
            <path
                fill="transparent"
                d="M17.24 1.05H41.93V25.740000000000002H17.24z"
            />
            <path
                d="M39.52 11.72c.03-.06.06-.13.07-.2l.77-4.12c.1-.57-.28-1.11-.84-1.21-.57-.1-1.11.28-1.21.84l-.38 2.06a9.481 9.481 0 00-12.88-3.76 9.467 9.467 0 00-4.18 4.63c-.21.53.04 1.12.57 1.34.53.22 1.13-.03 1.34-.56a7.275 7.275 0 016.87-4.54c2.65-.01 5.1 1.39 6.42 3.68l-1.7-.28c-.57-.09-1.1.3-1.19.86-.09.57.3 1.1.86 1.19l4.37.73h.16c.12 0 .24-.02.35-.06.04-.01.07-.04.1-.06.07-.03.14-.07.21-.11l.08-.1c.05-.05.1-.11.14-.16.03-.05.04-.11.05-.16zM37.69 15.53c-.53-.22-1.13.04-1.34.56v.01a7.284 7.284 0 01-6.83 4.5c-2.65.01-5.1-1.39-6.42-3.68l1.7.28h.16c.57.05 1.07-.38 1.11-.95.05-.57-.38-1.07-.95-1.11l-4.37-.71a.97.97 0 00-.34 0h-.08c-.12.03-.23.08-.33.14-.07.05-.13.12-.19.19l-.09.1c-.03.06-.06.13-.07.2-.04.05-.06.11-.07.17l-.77 4.12c-.13.55.21 1.11.76 1.24.02 0 .04 0 .06.01h.19c.5 0 .94-.35 1.03-.84l.38-2.06c2.51 4.6 8.28 6.29 12.88 3.77a9.467 9.467 0 004.18-4.63c.2-.53-.06-1.11-.59-1.32z"
            />
            <path
                fill="currentColor"
                stroke="currentColor"
                strokeMiterlimit={10}
                strokeWidth="3px"
                d="M40.53 0.97L3.53 44.34"
            />
        </svg>
    )
}

interface Props {
    className?: string
}
