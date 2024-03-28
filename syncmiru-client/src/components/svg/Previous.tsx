// https://www.svgrepo.com/svg/459465/left-circle-2

import {ReactElement} from "react";

export default function Previous({width, height, stroke}: {width?: string, height?: string, stroke?: string}): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 650 650"
            xmlSpace="preserve"
            width={width}
            height={height}
        >
            <path
                d="M325 25c165.69 0 300 134.31 300 300S490.69 625 325 625 25 490.69 25 325 159.31 25 325 25zm133.33 300H191.67M275 408.33L191.67 325 275 241.67"
                fill="none"
                stroke={stroke}
                strokeWidth={50}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit={133.3333}
            />
        </svg>
    )
}
