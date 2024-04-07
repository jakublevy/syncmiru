import React, {ReactElement, ReactNode} from "react";
import Previous from "@components/svg/Previous.tsx";

export function Btn(p: BtnProps): ReactElement {
    return <button
        className={p.className}
        onClick={p.onClick}
        formNoValidate={p.formNoValidate}>
        {p.children}
    </button>
}

export function BtnPrimary(p: BtnProps): ReactElement {
    return <Btn
        className={`bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 border border-indigo-700 rounded ${p.className} `}
        onClick={p.onClick}
        formNoValidate={p.formNoValidate}
        type={p.type}>
        {p.children}
    </Btn>
}

export function BtnSecondary(p: BtnProps): ReactElement {
    return <Btn
        className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded ${p.className}`}
        onClick={p.onClick}
        formNoValidate={p.formNoValidate}
        type={p.type}>
        {p.children}
    </Btn>
}

export function BtnDanger(p: BtnProps): ReactElement {
    return <Btn
        className={`bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 border border-red-700 rounded ${p.className}`}
        onClick={p.onClick}
        formNoValidate={p.formNoValidate}
        type={p.type}>
        {p.children}
    </Btn>
}

export function BtnTextPrimary(p: BtnProps): ReactElement {
    return <Btn
        className={`text-indigo-500 hover:text-indigo-900 font-semibold ${p.className}`}
        onClick={p.onClick}
        formNoValidate={p.formNoValidate}
        type={p.type}>
        {p.children}
    </Btn>
}

interface BtnProps {
    className?: string
    children?: ReactNode,
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void,
    formNoValidate?: boolean
    type?: "button" | "submit" | "reset"
}

export function BackButton(p: BackButtonProps): ReactElement {
    return (
        <button className={`rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 ${p.className}`} onClick={p.onClick}>
            <Previous className="h-12" />
        </button>
    )
}

interface BackButtonProps {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void,
    className: string
}