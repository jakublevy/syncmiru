import React, {ReactElement, ReactNode} from "react";
import Previous from "@components/svg/Previous.tsx";
import DoorOut from "@components/svg/DoorOut.tsx";

export function Btn(p: BtnProps): ReactElement {
    const {children, ...restParams} = p
    return <button {...restParams}>{children}</button>
}

export function BtnPrimary(p: BtnProps): ReactElement {
    const {className, children, ...restParams} = p
    return <Btn
        className={`bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 border border-indigo-700 rounded ${className != null ? className : ''}`}
        {...restParams}>
        {children}
    </Btn>
}

export function BtnSecondary(p: BtnProps): ReactElement {
    const {className, children, ...restParams} = p
    return <Btn
        className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded ${className != null ? className : ''}`}
        {...restParams}>
        {children}
    </Btn>
}

export function BtnDanger(p: BtnProps): ReactElement {
    const {className, children, ...restParams} = p
    return <Btn
        className={`bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 border border-red-700 rounded ${className != null ? className : ''}`}
        {...restParams}>
        {children}
    </Btn>
}

export function BtnTextPrimary(p: BtnProps): ReactElement {
    const {className, children, ...restParams} = p
    return <Btn
        className={`text-indigo-500 hover:text-indigo-900 dark:hover:text-indigo-700 font-semibold ${className != null ? className : ''}`}
        {...restParams}>
        {children}
    </Btn>
}

export interface BtnProps {
    className?: string
    children?: ReactNode,
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void,
    formNoValidate?: boolean
    type?: "button" | "submit" | "reset"
    disabled?: boolean
}

export function BackBtn(p: BackBtnProps): ReactElement {
    return (
        <button className={`rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 ${p.className}`} onClick={p.onClick}>
            <Previous className="h-12" />
        </button>
    )
}

export function SvgBtn(p: SvgButtonProps): ReactElement {
    return (
        <Btn className={`hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${p.className || ''}`}>
            {p.children}
        </Btn>
    )
}

interface SvgButtonProps extends BackBtnProps {
    children: ReactNode,
}

interface BackBtnProps {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void,
    className: string
}