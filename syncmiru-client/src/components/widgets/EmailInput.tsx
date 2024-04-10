import React, {ChangeEvent, forwardRef, useEffect, useState} from "react";
import useSWR from "swr";
import {invoke} from "@tauri-apps/api/core";
import {Input, InputProps} from "@components/widgets/Input.tsx";
import useFormValidate from "@hooks/useFormValidate.ts";

export const EmailInput
    = forwardRef<HTMLInputElement, EmailProps>((p, ref) => {
    return <Input
        {...p}
        ref={ref}
        type="email"
        maxLength={320}
        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 
                    dark:border-gray-600 dark:placeholder-gray-400 dark:text-darkread ${p.className}`}
    />
})

export const EmailInputUnique
    = forwardRef<HTMLInputElement, EmailPropsUnique>((p, ref) => {

    const {
        onUniqueChanged,
        onChange,
        onInput,
        className,
        ...passParams} = p

    const [email, setEmail] = useState<string>('')
    const {emailValidate} = useFormValidate()

    const {data: isUnique}
        = useSWR(["get_email_unique", email], ([cmd, email]) => {
            if(emailValidate(email))
                return invoke<boolean>(cmd, {email: email})
            return true
    }, {
        revalidateOnFocus: false,
        revalidateOnMount: false,
        revalidateOnReconnect: true,
        refreshWhenOffline: false,
        refreshWhenHidden: false,
    })

    useEffect(() => {
        if (isUnique !== undefined)
            onUniqueChanged(isUnique)
    }, [isUnique]);

    function emailOnChange(e: ChangeEvent<HTMLInputElement>) {
        setEmail(e.target.value)
        if (onChange !== undefined)
            onChange(e)
    }

    return <EmailInput
        {...passParams}
        ref={ref}
        onChange={emailOnChange}
        className={className}
    />
})

type EmailProps = Omit<InputProps, "type" | "maxLength">

interface EmailPropsUnique extends EmailProps {
    onUniqueChanged: (b: boolean) => void
}