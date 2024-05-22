import {ReactElement, useEffect, useState} from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import useCSSTheme, {CSSTheme} from "@hooks/useCSSTheme.ts";
import {listen} from "@tauri-apps/api/event";

export default function HCaptchaThemeAware(p: HCaptchaProps): ReactElement {
    const shownTheme: CSSTheme = useCSSTheme()
    const [theme, setTheme] = useState<CSSTheme>(CSSTheme.Light)

    useEffect(() => {
        setTheme(shownTheme)
    }, [shownTheme]);

    useEffect(() => {
        listen<string>('tauri://theme-changed', (e) => {
            if(p.onExpire !== undefined)
                p.onExpire()

            if(e.payload === CSSTheme.Light)
                setTheme(CSSTheme.Light)
            else
                setTheme(CSSTheme.Dark)
        })
    }, []);

    return (
        <HCaptcha
            {...p}
            theme={theme}
        />
    )
}

interface HCaptchaProps {
    onExpire?: () => any;
    onOpen?: () => any;
    onClose?: () => any;
    onChalExpired?: () => any;
    onError?: (event: string) => any;
    onVerify?: (token: string, ekey: string) => any;
    onLoad?: () => any;
    languageOverride?: string;
    sitekey: string;
    size?: "normal" | "compact" | "invisible";
    tabIndex?: number;
    id?: string;
    reCaptchaCompat?: boolean;
    loadAsync?: boolean;
    scriptLocation?: HTMLElement | null;
    sentry?: boolean;
    cleanup?: boolean;
    custom?: boolean;
    secureApi?: boolean;
    scriptSource?: string;
}