import React, {ReactElement, ReactNode} from "react";
import Previous from "@components/svg/Previous.tsx";

export function Btn({className, children, onClick, formNoValidate}: BtnProps): ReactElement {
    return <button
        className={className}
        onClick={onClick}
        formNoValidate={formNoValidate}>
        {children}
    </button>
}

export function BtnPrimary({className, children, onClick, formNoValidate}: BtnProps): ReactElement {
    return <Btn
        className={`bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 border border-indigo-700 rounded ${className} `}
        onClick={onClick}
        formNoValidate={formNoValidate}>
        {children}
    </Btn>
}

export function BtnSecondary({className, children, onClick, formNoValidate}: BtnProps): ReactElement {
    return <Btn
        className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded ${className}`}
        onClick={onClick}
        formNoValidate={formNoValidate}>
        {children}
    </Btn>
}

export function BtnDanger({className, children, onClick, formNoValidate}: BtnProps): ReactElement {
    return <Btn
        className={`bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 border border-red-700 rounded ${className}`}
        onClick={onClick}
        formNoValidate={formNoValidate}>
        {children}
    </Btn>
}

export function BtnTextPrimary({className, children, onClick, formNoValidate}: BtnProps): ReactElement {
    return <Btn
        className={`text-indigo-500 hover:text-indigo-900 font-semibold ${className}`}
        onClick={onClick}
        formNoValidate={formNoValidate}>
        {children}
    </Btn>
}

interface BtnProps {
    className?: string
    children?: ReactNode,
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void,
    formNoValidate?: boolean
}

export function BackButton({onClick, className}: BackButtonProps): ReactElement {
    return (
        <button className={`rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 ${className}`} onClick={onClick}>
            <Previous className="h-12" />
        </button>
    )
}

interface BackButtonProps {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void,
    className: string
}