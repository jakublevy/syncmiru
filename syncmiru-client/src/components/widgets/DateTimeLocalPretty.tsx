import {ReactNode} from "react";
import {useLanguage} from "@hooks/useLanguage.ts";
import {Language} from "@models/config.tsx";

export default function DateTimeLocalPretty({datetime}: Props): ReactNode {
    const l = useLanguage()
    if(l === Language.Czech)
        return <>{datetime.toLocaleString("cs-CZ")}</>
    else if(l === Language.English)
        return <>{datetime.toLocaleString("en-US")}</>

    return <>Implementation missing</>
}

interface Props {
    datetime: Date
}