import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/379887/collapse-right
// License: CC Attribution License

export default function CollapseRight({className}: Props): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 533.3 566.7"
            xmlSpace="preserve"
            className={className || ''}
            fill="currentColor"
        >
            <path d="M500 16.7C500 7.5 507.5 0 516.7 0s16.7 7.5 16.7 16.7V550c0 9.2-7.5 16.7-16.7 16.7S500 559.2 500 550V16.7zM376.8 266.7L271.9 161.8c-6.5-6.5-6.5-17.1 0-23.6s17.1-6.5 23.6 0l133.3 133.3c6.5 6.5 6.5 17.1 0 23.6L295.5 428.5c-6.5 6.5-17.1 6.5-23.6 0s-6.5-17.1 0-23.6L376.8 300H17C7.8 300 .3 292.5.3 283.3s7.5-16.7 16.7-16.7h359.8z" />
            <path d="M500.3 50.1c0-9.2 7.5-16.7 16.7-16.7s16.7 7.5 16.7 16.7v466.7c0 9.2-7.5 16.7-16.7 16.7s-16.7-7.5-16.7-16.7V50.1z" />
        </svg>
    )

}

interface Props {
    className?: string
}