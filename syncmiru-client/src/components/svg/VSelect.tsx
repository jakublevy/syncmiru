import Check from "@components/svg/Check.tsx";

export default function VSelect({className}: Props) {
    return (
        <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24.71 16.02"
            className={className || ''}
        >
            <path
                fill="none"
                fillRule="evenodd"
                stroke="currentColor"
                strokeMiterlimit={10}
                strokeWidth="2px"
                d="M0.76 1L12.21 14.47 23.95 0.65"
            />
        </svg>
    )
}

interface Props {
    className?: string
}