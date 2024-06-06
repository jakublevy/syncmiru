import {ReactElement} from "react";

// Source: https://www.svgrepo.com/svg/341256/user-avatar-filled
// License: Apache License

export default function DefaultAvatar({className}: Props): ReactElement {
    return (
        <svg
            id="icon"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 699.5 700"
            xmlSpace="preserve"
            className={className || ''}
            fill="currentColor"
        >
            <style>{".st0{fill:none}"}</style>
            <path
                id="_inner-path_"
                className="st0"
                d="M150.2 573.3C151.1 504.9 206.7 450 275 450h150c68.3 0 123.9 54.9 124.8 123.2-113.5 102.4-286.1 102.4-399.6.1zm312.3-310.8c0 62.1-50.4 112.5-112.5 112.5s-112.5-50.4-112.5-112.5S287.9 150 350 150s112.5 50.4 112.5 112.5z"
            />
            <path d="M618.7 573.3c123.4-148.6 103.1-369.1-45.5-492.5s-369-103.1-492.5 45.4C28.5 189.1-.1 268.3 0 350c0 81.7 28.8 160.7 81.3 223.2l-.5.4c1.8 2.1 3.8 3.9 5.6 6 2.3 2.6 4.7 5 7 7.5 7 7.6 14.2 14.9 21.8 21.8 2.3 2.1 4.7 4 7 6 8 6.9 16.2 13.4 24.8 19.5 1.1.8 2.1 1.7 3.2 2.5v-.3c120 84.4 280 84.4 400 0v.3c1.1-.8 2.1-1.7 3.2-2.5 8.5-6.1 16.8-12.6 24.8-19.5 2.3-2 4.7-4 7-6 7.6-6.9 14.8-14.2 21.8-21.8 2.3-2.5 4.7-4.9 7-7.5 1.8-2.1 3.8-3.9 5.6-6l-.9-.3zM350 150c62.1 0 112.5 50.4 112.5 112.5S412.1 375 350 375s-112.5-50.4-112.5-112.5S287.9 150 350 150zM150.2 573.3C151.1 504.9 206.7 450 275 450h150c68.3 0 123.9 54.9 124.8 123.2-113.5 102.4-286.1 102.4-399.6.1z" />
            <path
                id="_Transparent_Rectangle_"
                className="st0"
                d="M-50 -50H750V750H-50z"
            />
        </svg>
    )
}

interface Props {
    className?: string
}