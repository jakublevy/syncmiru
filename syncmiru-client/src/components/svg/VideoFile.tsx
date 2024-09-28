import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/256839/video-file
// License: Public Domain

export default function VideoFile({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 600 800"
            xmlSpace="preserve"
            className={className || ''}
            fill="currentColor"
        >
            <path d="M598.67 210.33c-.83-2-2-3.83-3.67-5.33L395 5c-3-3.17-7.33-5-11.67-5H16.67C7.5 0 0 7.5 0 16.67v766.67C0 792.5 7.5 800 16.67 800h566.67c9.17 0 16.67-7.5 16.67-16.67V216.67c-.01-2.17-.51-4.34-1.34-6.34zM400 56.83L543.17 200H400V56.83zm166.67 709.84H33.33V33.33h333.33v183.33c0 9.17 7.5 16.67 16.67 16.67h183.33l.01 533.34z" />
            <path d="M174.17 269.67c-4.83 3.17-7.5 8.5-7.5 14V616c0 6.17 3.17 12 8.5 15 5.5 3 12 2.67 16.83-.5l266.33-166.33c7.83-4.83 10.17-15.17 5.33-22.83a15.374 15.374 0 00-5.33-5.5L192.5 269.67c-5.67-3.5-12.83-3.67-18.33 0zM200 313.33L418.5 450 200 586.67V313.33z" />
        </svg>
    )

}

interface Props {
    className?: string
}