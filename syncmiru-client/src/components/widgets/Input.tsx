import {ChangeEvent, forwardRef, KeyboardEvent, FocusEvent, useState, useEffect, useRef} from "react";
import useSWR from "swr";
import {invoke} from "@tauri-apps/api/core";
import useFormValidate from "@hooks/useFormValidate.ts";

export const Input
    = forwardRef<HTMLInputElement, Props>((p, ref) => {
    return <input {...p}
                  ref={ref}
                  className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                    focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700
                    dark:border-gray-600 dark:placeholder-gray-400 dark:text-darkread ${p.className}`}
    />
})

export const UsernameInput
    = forwardRef<HTMLInputElement, UsernameProps>((p, ref) => {
    const reportedUnique = useRef<boolean>(true)
    const {onUniqueChanged, onChange, onInput, ...passParams} = p
    const {usernameValidate} = useFormValidate()

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
        if (isUnique !== undefined && isUnique !== reportedUnique.current) {
            reportedUnique.current = isUnique
            onUniqueChanged(isUnique)
        }
    }, [isUnique]);


    function usernameOnInput(e: ChangeEvent<HTMLInputElement>) {
        e.target.value = e.target.value.toLowerCase()
        e.target.value = e.target.value.replace(/[^a-z]/g, '')

        if(onInput !== undefined)
            onInput(e)
    }

    function usernameOnChange(e: ChangeEvent<HTMLInputElement>) {
        const username = e.target.value
        if(usernameValidate(username))
            setUsername(e.target.value)
        else if(!reportedUnique.current) {
            reportedUnique.current = true
            onUniqueChanged(true)
        }

        if(onChange !== undefined)
            onChange(e)
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

type UsernamePropsOmitted = Omit<Props, "type" | "maxLength" | "pattern">
interface UsernameProps extends UsernamePropsOmitted {
    onUniqueChanged: (b: boolean) => void
}

export const DisplaynameInput
    = forwardRef<HTMLInputElement, DisplaynamePropsOmitted>((p, ref) => {
    return <Input
        {...p}
        ref={ref}
        type="text"
        maxLength={24}
        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 
                    dark:border-gray-600 dark:placeholder-gray-400 dark:text-darkread ${p.className}`}
    />
})
type DisplaynamePropsOmitted = Omit<Props, "type" | "maxLength">


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

type EmailProps = Omit<Props, "type" | "maxLength">

interface Props {
    type?: InputType,
    className?: string,
    required?: boolean,
    disabled?: boolean,
    readOnly?: boolean,
    id?: string,
    name?: string,
    value?: string,
    pattern?: string,
    maxLength?: number,
    tabIndex?: number,
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void,
    onInput?: (e: ChangeEvent<HTMLInputElement>) => void,
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void,
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void

}

type InputType
    = "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file"
    | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset"
    | "search" | "submit" | "tel" | "text" | "time" | "url" | "week";