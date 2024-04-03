import {ReactElement} from "react";

// https://www.svgrepo.com/svg/500665/question-filled

export default function Question({width, height, tooltipId}: QuestionProps): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 700 700"
            xmlSpace="preserve"
            width={width}
            height={height}
            data-tooltip-id={tooltipId}
            fill="currentColor"
        >
            <path d="M350 0c193.3 0 350 156.7 350 350S543.3 700 350 700 0 543.3 0 350 156.7 0 350 0zm18.6 149.6c-40.7 0-72.6 11.6-96.2 34.6-24.2 23.1-35.8 55-35.8 95.7h62.7c0-23.1 4.4-41.2 13.8-53.9 10.4-15.4 27.5-22.6 51.7-22.6 18.7 0 33.6 4.9 44 15.4 9.9 10.4 15.4 24.7 15.4 42.9 0 13.8-5 26.9-14.9 39l-6.6 7.7c-35.8 31.9-57.2 55-64.3 69.9-7.7 14.9-11 33-11 53.9v7.7h63.2v-7.7c0-13.2 2.8-24.8 8.2-35.8 5-9.9 12.1-19.2 22-27.5 26.4-23.1 42.4-38 47.3-43.5 13.2-17.6 20.3-40.1 20.3-67.6 0-33.6-11-59.9-33-79.2-22-19.7-51.1-29-86.8-29zM358.7 467c-11.2-.3-22.1 3.8-30.2 11.5-8.1 7.7-12.6 18.5-12.1 29.7 0 12.1 3.9 22 12.1 29.7 8.1 7.9 19 12.2 30.2 12.1 12.1 0 22-3.8 30.2-11.5 8.3-7.8 12.9-18.8 12.7-30.3.2-11.1-4.2-21.9-12.1-29.7-8.4-7.7-19.5-11.9-30.8-11.5z" />
        </svg>
    )
}

export interface QuestionProps {
    width?: string,
    height?: string,
    tooltipId?: string
}