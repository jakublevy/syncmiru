import {ReactElement, ReactNode} from "react";

export default function Card({className, children}: Props): ReactElement {
    return (
        <div className={`bg-white border border-gray-200 rounded-lg shadow dark:bg-darkbg dark:border-gray-700 ${className != null ? className : ''}`}>
            {children}
        </div>
    )
}

interface Props {
    className?: string,
    children?: ReactNode
}