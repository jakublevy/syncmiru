import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/340341/folder-parent
// License: Apache License

export default function ParentFolder({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 700 600"
            xmlSpace="preserve"
            className={className || ''}
        >
            <path d="M650 100H350l-85.4-85.4C255.3 5.3 242.5 0 229.3 0H50C22.4 0 0 22.4 0 50v500c0 27.6 22.4 50 50 50h300c27.6 0 50-22.4 50-50V320.8l64.8 64.5L500 350 375 225 250 350l35.2 35.2 64.8-64.5V550H50V50h179.3l100 100H650v400H500v50h150c27.6 0 50-22.4 50-50V150c0-27.6-22.4-50-50-50z" />
            <path fill="none" d="M-50 -100H750V700H-50z" />
        </svg>
    )
}

interface Props {
    className?: string
}