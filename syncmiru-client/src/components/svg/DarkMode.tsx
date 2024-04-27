import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/381213/dark-mode-night-moon
// License: CC Attribution License

export default function DarkMode({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 787.6 785.3"
            xmlSpace="preserve"
            className={className || ''}
            fill="currentColor"
        >
            <path d="M415.5 785.3c-22.5 0-45-1.8-67.2-5.5C122.1 742.7-31.4 529.3 5.5 303c20-125.3 96.6-234.5 207.7-296 18.9-10.6 42.2-9.1 59.7 3.7 17.9 12.2 26.8 33.8 22.9 55.1L266 63.5l28.1 5c-32.8 173.9 66.4 345.6 233.4 404.1 62.2 21.6 129.2 25.8 193.6 12.1 30.2-5.9 59.5 13.8 65.5 44 2.3 12 .7 24.4-4.7 35.3-71.8 135.9-212.7 221-366.4 221.3zM237.9 58.7C65.8 156.3 5.4 374.8 103 546.9c6.3 11.1 13.2 21.9 20.6 32.2C238.6 739.9 462.2 777 623 662c44.2-31.6 80.7-73 106.6-120.8C656.1 556 580 550.9 509 526.6 315.6 458.8 200.6 260.2 237.9 58.7z" />
            <path d="M264.8 56.1H293.7V69.1H264.8z" />
            <path
                transform="rotate(12 289.136 65.59)"
                d="M283.6 62.8H294.6V68.39999999999999H283.6z"
            />
            <path
                transform="rotate(9.508 298.621 64.384)"
                d="M294.9 53.7H302.09999999999997V75H294.9z"
            />
        </svg>
    )
}

interface Props {
    className?: string
}