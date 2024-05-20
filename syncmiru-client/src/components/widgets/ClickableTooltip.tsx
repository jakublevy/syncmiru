import {ChildrenType, PlacesType, Tooltip} from "react-tooltip";
import {ReactElement, useEffect, useState} from "react";
import useCSSTheme, {CSSTheme} from "@hooks/useCSSTheme.ts";
import {listen} from "@tauri-apps/api/event";

export default function ClickableTooltip(p: Props): ReactElement {
    let shownTheme = useCSSTheme()
    const [theme, setTheme] = useState<CSSTheme>(CSSTheme.Light)

    useEffect(() => {
        setTheme(shownTheme)
    }, [shownTheme]);

    listen<string>('tauri://theme-changed', (e) => {
        if(e.payload === CSSTheme.Light)
            setTheme(CSSTheme.Light)
        else
            setTheme(CSSTheme.Dark)
    })

    return (
        <Tooltip
            {...p}
            closeEvents={{mouseleave: false}}
            openEvents={{click: true}}
            //variant={theme === CSSTheme.Light ? 'light' : 'dark'}
             style={theme === CSSTheme.Light
                 ? {color: "#000", backgroundColor: "rgb(209 213 219)"}
                 : {color: "#eeeeee", backgroundColor: "#000"}
             }
        />
    )
}

interface Props {
    id: string,
    place: PlacesType
    render?: (render: { content: string | null; activeAnchor: HTMLElement | null }) => ChildrenType
}