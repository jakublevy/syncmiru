// Source: https://www.svgrepo.com/svg/391673/resize-vertical
// License: MIT

export default function ResizableIndicator({className}: Props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 405.5 800"
            xmlSpace="preserve"
            className={className || ''}
        >
            <path d="M405.5 202.7L202.7 0 0 202.7h135.7v394.6H0L202.7 800l202.7-202.7H269.8V202.7h135.7z" />
        </svg>
    )
}
interface Props {
    className?: string
}