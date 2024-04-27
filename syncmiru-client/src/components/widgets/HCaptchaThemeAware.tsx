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

    listen<string>('tauri://theme-changed', (e) => {
        console.log('captcha expired')
        if(p.onExpire !== undefined)
            p.onExpire()

        if(e.payload === CSSTheme.Light)
            setTheme(CSSTheme.Light)
        else
            setTheme(CSSTheme.Dark)
    })

    return (
        <HCaptcha
            onExpire={p.onExpire}
            onOpen={p.onOpen}
            onClose={p.onClose}
            onChalExpired={p.onChalExpired}
            onError={p.onError}
            onVerify={p.onVerify}
            onLoad={p.onLoad}
            languageOverride={p.languageOverride}
            sitekey={p.sitekey}
            size={p.size}
            tabIndex={p.tabIndex}
            id={p.id}
            reCaptchaCompat={p.reCaptchaCompat}
            loadAsync={p.loadAsync}
            scriptLocation={p.scriptLocation}
            sentry={p.sentry}
            cleanup={p.cleanup}
            custom={p.custom}
            secureApi={p.secureApi}
            scriptSource={p.scriptSource}
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