import {ReactElement, ReactNode} from "react";

export default function Label({className, htmlFor, children}: Props): ReactElement {
    return <label
        htmlFor={htmlFor}
        className={`block mb-1 text-sm font-medium text-gray-900 dark:text-darkread ${className}`}
    >{children}</label>
}

interface Props {
    className?: string,
    htmlFor?: string,
    children?: ReactNode,
}
