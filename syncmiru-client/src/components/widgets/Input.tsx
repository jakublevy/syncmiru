import {ChangeEvent, forwardRef, KeyboardEvent, ReactElement} from "react";

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
    = forwardRef<HTMLInputElement, Props>((p, ref) => {

    function usernameOnInput(e: ChangeEvent<HTMLInputElement>) {
        e.target.value = e.target.value.toLowerCase()
        e.target.value = e.target.value.replace(/[^a-z]/g, '')
    }

    return <Input
        {...p}
        ref={ref}
        type="text"
        onInput={usernameOnInput}
        maxLength={16}
        pattern="[a-z]{4,16}"
        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 
                    dark:border-gray-600 dark:placeholder-gray-400 dark:text-darkread ${p.className}`}
    />
})

export const DisplaynameInput =
    forwardRef<HTMLInputElement, Props>((p, ref) => {
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


export const EmailInput =
    forwardRef<HTMLInputElement, Props>((p, ref) => {
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
    onInput?: (e: ChangeEvent<HTMLInputElement>) => void,
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void,
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void

}

type InputType
    = "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file"
    | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset"
    | "search" | "submit" | "tel" | "text" | "time" | "url" | "week";