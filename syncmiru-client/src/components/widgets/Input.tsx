import React, {
    ChangeEvent,
    forwardRef,
    KeyboardEvent,
    FocusEvent,
} from "react";
import useFormValidate from "@hooks/useFormValidate.ts";
import useSWR from "swr";
import {invoke} from "@tauri-apps/api/core";
import {withSrvValidate} from "@components/hoc/withSrvValidate.tsx";

export const Input
    = forwardRef<HTMLInputElement, InputProps>((p, ref) => {
    return <input {...p}
                  ref={ref}
                  className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                    focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700
                    dark:border-gray-600 dark:placeholder-gray-400 dark:text-darkread ${p.className}`}
    />
})

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

type EmailProps = Omit<InputProps, "type" | "maxLength">

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
type DisplaynamePropsOmitted = Omit<InputProps, "type" | "maxLength">

export const UsernameInput
    = forwardRef<HTMLInputElement, UsernameProps>((p, ref) => {
    const {onInput, ...passParams} = p

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
        maxLength={16}
        pattern="[a-z]{4,16}"
        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 
                    dark:border-gray-600 dark:placeholder-gray-400 dark:text-darkread ${p.className}`}
    />
})

type UsernameProps = Omit<InputProps, "type" | "maxLength" | "pattern">

export const EmailInputSrvValidate = withSrvValidate(EmailInput,
    {
        validate: useFormValidate().emailValidate,
        swr:
            (value: string, validate: (v: string) => boolean) => {
                return useSWR(["get_email_unique", value], ([cmd, value]) => {
                    const send = {email: value}
                    if (validate(value))
                        return invoke<boolean>(cmd, send)
                    return true
                }, {
                    revalidateOnFocus: false,
                    revalidateOnMount: false,
                    revalidateOnReconnect: true,
                    refreshWhenOffline: false,
                    refreshWhenHidden: false,
                })
            }
    }
)

export const UsernameInputSrvValidate = withSrvValidate(UsernameInput,
    {
        validate: useFormValidate().usernameValidate,
        swr:
            (value: string, validate: (v: string) => boolean) => {
                return useSWR(["get_username_unique", value], ([cmd, value]) => {
                    const send = {username: value}
                    if (validate(value))
                        return invoke<boolean>(cmd, send)
                    return true
                }, {
                    revalidateOnFocus: false,
                    revalidateOnMount: false,
                    revalidateOnReconnect: true,
                    refreshWhenOffline: false,
                    refreshWhenHidden: false,
                })
            }
    }
)

export const ForgottenPasswordTknSrvValidate = withSrvValidate(Input,
    {
        validate: useFormValidate().tknValidate,
        swr: (value: string, validate: (v: string) => boolean) => {
            return useSWR(["get_forgotten_password_tkn_valid", value], ([cmd, value]) => {
                const send = {tkn: value,}
                if (validate(value))
                    return invoke<boolean>(cmd, send)
                return false
            }, {
                revalidateOnFocus: false,
                revalidateOnMount: false,
                revalidateOnReconnect: true,
                refreshWhenOffline: false,
                refreshWhenHidden: false,
            })
        }
    })

export interface InputProps {
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
    autoComplete?: AutocompleteType,
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void,
    onInput?: (e: ChangeEvent<HTMLInputElement>) => void,
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void,
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void

}

type InputType
    = "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file"
    | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset"
    | "search" | "submit" | "tel" | "text" | "time" | "url" | "week";

type AutocompleteType =
    | "on"
    | "off"
    | "name"
    | "honorific-prefix"
    | "given-name"
    | "additional-name"
    | "family-name"
    | "honorific-suffix"
    | "nickname"
    | "organization-title"
    | "organization"
    | "country"
    | "street-address"
    | "address-line1"
    | "address-line2"
    | "address-line3"
    | "locality"
    | "region"
    | "postal-code"
    | "email"
    | "tel"
    | "username"
    | "current-password"
    | "new-password"
    | "credit-card-name"
    | "credit-card-number"
    | "credit-card-expiry"
    | "credit-card-cvv";