import React, {ReactElement, ReactNode} from "react";
import Previous from "@components/svg/Previous.tsx";
import Close from "@components/svg/Close.tsx";
import Delete from "@components/svg/Delete.tsx";
import Edit from "@components/svg/Edit.tsx";
import Danger from "@components/svg/Danger.tsx";
import ZoomReset from "@components/svg/ZoomReset.tsx";
import Copy from "@components/svg/Copy.tsx";
import View from "@components/svg/View.tsx";

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
        className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold border py-2 px-4 rounded ${className != null ? className : ''}`}
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
    id?: string,
    className?: string
    children?: ReactNode,
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void,
    formNoValidate?: boolean
    type?: "button" | "submit" | "reset"
    disabled?: boolean
}

export function BackBtn(p: SvgFixedBtn): ReactElement {
    return (
        <button className={`rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 ${p.className || ''}`} onClick={p.onClick}>
            <Previous className="h-12" />
        </button>
    )
}

export function CloseBtn(p: SvgFixedBtn): ReactElement {
    return (
        <button className={`rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 ${p.className || ''}`} onClick={p.onClick}>
            <Close className="h-12" />
        </button>
    )
}

export function Clickable(p: BtnProps): ReactElement {
    const {className, children, ...restParams} = p
    return (
        <Btn className={`rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${p.className || ''}`}
            {...restParams}>
            {p.children}
        </Btn>
    )
}

export function DeleteBtn(p: SvgBtn): ReactElement {
    return (
        <BtnDangerSvg {...p}>
            <Delete className="w-full"/>
        </BtnDangerSvg>
    )
}

export function EditBtn(p: SvgBtn): ReactElement {
    return (
        <BtnSecondarySvg {...p}>
            <Edit className="w-full"/>
        </BtnSecondarySvg>
    )
}

export function CopyBtn(p: SvgBtn): ReactElement {
    return (
        <BtnSecondarySvg {...p}>
            <Copy className="w-full"/>
        </BtnSecondarySvg>
    )
}

export function ViewBtn(p: SvgBtn): ReactElement {
    return (
        <BtnSecondarySvg {...p}>
            <View className="w-full"/>
        </BtnSecondarySvg>
    )
}

export function ZoomResetBtn(p: SvgBtn): ReactElement {
    return (
        <BtnSecondarySvg {...p}>
            <ZoomReset className="w-full"/>
        </BtnSecondarySvg>
    )
}

type SvgBtn = Omit<BtnProps, "children">

export function BtnSecondarySvg(p: BtnProps): ReactElement {
    const {className, children, ...restParams} = p
    return <Btn
        className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold border py-1.5 px-1.5 rounded ${className != null ? className : ''}`}
        {...restParams}>
        {children}
    </Btn>
}

export function BtnDangerSvg(p: BtnProps): ReactElement {
    const {className, children, ...restParams} = p
    return <Btn
        className={`bg-red-600 hover:bg-red-800 text-white font-bold py-1.5 px-1.5 border border-red-700 rounded ${className != null ? className : ''}`}
        {...restParams}>
        {children}
    </Btn>
}

export function NavLink(p: NavlinkProps): ReactElement {
    const {className, children, active, ...restParams} = p
    return (
        <Btn className={`rounded ${active ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} ${p.className || ''}`}
             {...restParams}>
            {p.children}
        </Btn>
    )
}

interface NavlinkProps extends BtnProps {
    active?: boolean
}

interface SvgFixedBtn {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void,
    className?: string
}