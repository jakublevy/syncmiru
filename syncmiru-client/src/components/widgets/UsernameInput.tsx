import React, {ChangeEvent, forwardRef, useEffect, useState} from "react";
import useSWR from "swr";
import {invoke} from "@tauri-apps/api/core";
import {Input, InputProps} from "@components/widgets/Input.tsx";

export const UsernameInput
    = forwardRef<HTMLInputElement, UsernameProps>((p, ref) => {
    const {onReportUnique, onChange, onInput, ...passParams} = p
    const [username, setUsername] = useState<string>('')

    const {data: isUnique}
        = useSWR(["get_username_unique", username], ([cmd, username]) => {
        return invoke<boolean>(cmd, {username: username})
    }, {
        revalidateOnFocus: false,
        revalidateOnMount: false,
        revalidateOnReconnect: true,
        refreshWhenOffline: false,
        refreshWhenHidden: false,
    })

    useEffect(() => {
        if (isUnique !== undefined)
            onReportUnique(isUnique)
        else
            onReportUnique(true)
    }, [isUnique]);

    function usernameOnChange(e: ChangeEvent<HTMLInputElement>) {
        setUsername(e.target.value)
        if (onChange !== undefined)
            onChange(e)
    }

    function usernameOnInput(e: ChangeEvent<HTMLInputElement>) {
        e.target.value = e.target.value.toLowerCase()
        e.target.value = e.target.value.replace(/[^a-z]/g, '')

        if (onInput !== undefined)
            onInput(e)
    }

    return <Input
        {...passParams}
        ref={ref}
        type="text"
        onInput={usernameOnInput}
        onChange={usernameOnChange}
        maxLength={16}
        pattern="[a-z]{4,16}"
        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 
                    dark:border-gray-600 dark:placeholder-gray-400 dark:text-darkread ${p.className}`}
    />
})

type UsernamePropsOmitted = Omit<InputProps, "type" | "maxLength" | "pattern">

interface UsernameProps extends UsernamePropsOmitted {
    onReportUnique: (b: boolean) => void
}