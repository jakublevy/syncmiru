import {MouseEvent, ReactElement, useEffect, useRef, useState} from "react";
import {Btn, BtnProps} from "@components/widgets/Button.tsx";

export default function BtnTimeout(p: BtnTimeoutProps): ReactElement {
    const wasCalled = useRef(false);
    const {text, onClick, timeout, ...restProps} = p
    const [wait, setWait] = useState<number>(Math.round(timeout))
    const isReady = wait <= 0
    const [clickExecuting, setClickExecuting] = useState<boolean>(false)

    const classNameEnabled = "text-indigo-500 hover:text-indigo-900 dark:hover:text-indigo-700 font-semibold"
    const classNameDisabled = "text-indigo-500 font-semibold"

    function clicked(e: MouseEvent<HTMLButtonElement>) {
        setClickExecuting(true)
        if(onClick !== undefined && isReady)
            onClick(e)
        setClickExecuting(false)
    }

    function disabled() {
        if(clickExecuting)
            return true
        return !isReady
    }

    useEffect(() => {
        if(wasCalled.current)
            return;
        wasCalled.current = true;
        const timer = setInterval(() => {
            setWait((p) => {
                const next = p - 1
                if(next <= 0)
                    clearInterval(timer)
                return next
            })
        }, 1000)
    }, []);

    return <Btn
        disabled={disabled()}
        className={isReady ? classNameEnabled : classNameDisabled}
        onClick={clicked}
        {...restProps}>
        {!isReady
            ? <> {`${text} (${wait})`} </>
            : <> {`${text}`} </>
        }
    </Btn>
}

interface BtnTimeoutProps extends Omit<BtnProps, "children" | "disabled" | "className"> {
    text: string
    timeout: number
}