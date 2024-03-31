import {ReactElement} from "react";

// https://www.svgrepo.com/svg/522086/cross

export default function Cross({width, height, fill}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 800 800"
            xmlSpace="preserve"
            width={width}
            height={height}
        >
            <path
                d="M1051.2 1441l182.2-182.2c47.5-47.5 47.5-126.7 0-182.2-47.5-47.5-126.7-47.5-182.2 0L869 1258.8l-182.2-182.2c-47.5-47.5-126.7-47.5-182.2 0-47.5 47.5-47.5 126.7 0 182.2L686.8 1441l-182.2 182.2c-47.5 47.5-47.5 126.7 0 182.2 47.5 47.5 126.7 47.5 182.2 0L869 1623.2l182.2 182.2c47.5 47.5 126.7 47.5 182.2 0 47.5-47.5 47.5-126.7 0-182.2L1051.2 1441"
                fillRule="evenodd"
                clipRule="evenodd"
                fill={fill}
                transform="translate(-469 -1041)"
            />
        </svg>
    )
}

interface Props {
    width?: string,
    height?: string,
    fill?: string
}