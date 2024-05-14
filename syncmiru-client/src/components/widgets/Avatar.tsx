import {ReactElement} from "react";
import DefaultAvatar from "@components/svg/DefaultAvatar.tsx";

export default function Avatar(p: Props): ReactElement {
    const {picBase64, className, ...restProps} = p
    if(p.picBase64 == null || p.picBase64 === '')
        return <DefaultAvatar className={className || ''} {...restProps}/>

    return <img src={`data:image/png;base64, ${picBase64}`} alt="Avatar" className={`rounded-full ${className || ''}`} {...restProps} />
}

interface Props {
    className?: string,
    picBase64?: string
}