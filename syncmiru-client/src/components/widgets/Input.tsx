import React, {
    ChangeEvent,
    forwardRef,
    KeyboardEvent,
    FocusEvent, useRef, MouseEvent
} from "react";
import {emailValidate, usernameValidate, tknValidate} from "src/form/validators.ts";
import useSWR from "swr";
import {invoke} from "@tauri-apps/api/core";
import {withSrvValidate} from "@components/hoc/withSrvValidate.tsx";
import Search from "@components/svg/Search.tsx";
import {useTranslation} from "react-i18next";
import {Btn} from "@components/widgets/Button.tsx";
import Cross from "@components/svg/Cross.tsx";

export const Input
    = forwardRef<HTMLInputElement, InputProps>((p, ref) => {
    return <input {...p}
                  ref={ref}
                  className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                     block w-full p-2.5 dark:bg-gray-700
                    dark:border-gray-600 dark:placeholder-gray-400 dark:text-darkread ${p.className || ''}`}
    />
})

export const Checkbox
    = forwardRef<HTMLInputElement, CheckboxProps>((p, ref) => {
    return <input {...p}
                  ref={ref}
                  type="checkbox"
                  className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                     block p-2.5 dark:bg-gray-700 hover:cursor-pointer
                    dark:border-gray-600 dark:placeholder-gray-400 dark:text-darkread ${p.className || ''}`}
    />
})

type CheckboxProps = Omit<InputProps, "type">

export const EmailInput
    = forwardRef<HTMLInputElement, EmailProps>((p, ref) => {
    return <Input
        {...p}
        ref={ref}
        type="email"
        maxLength={320}
        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    block w-full p-2.5 dark:bg-gray-700 
                    dark:border-gray-600 dark:placeholder-gray-400 dark:text-darkread ${p.className || ''}`}
    />
})

type EmailProps = Omit<InputProps, "type" | "maxLength">

export const DisplaynameInput
    = forwardRef<HTMLInputElement, DisplaynamePropsOmitted>((p, ref) => {
    return <Input
        {...p}
        ref={ref}
        type="text"
        maxLength={16}
        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    block w-full p-2.5 dark:bg-gray-700 
                    dark:border-gray-600 dark:placeholder-gray-400 dark:text-darkread ${p.className || ''}`}
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
                    block w-full p-2.5 dark:bg-gray-700 
                    dark:border-gray-600 dark:placeholder-gray-400 dark:text-darkread ${p.className || ''}`}
    />
})

type UsernameProps = Omit<InputProps, "type" | "maxLength" | "pattern">

export const EmailInputSrvValidate = withSrvValidate(EmailInput,
    {
        validate: emailValidate,
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
        validate: usernameValidate,
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
        validate: tknValidate,
        swr: (value: string, validate: (v: string) => boolean, validationArgs: Record<string, unknown> | undefined) => {
            if (validationArgs !== undefined) {
                return useSWR(["get_forgotten_password_tkn_valid", value], ([cmd, value]) => {
                    const send = {tkn: value, email: validationArgs['email']}
                    if (validate(value))
                        return invoke<boolean>(cmd, {data: JSON.stringify(send)})

                    return false
                }, {
                    revalidateOnFocus: false,
                    revalidateOnMount: false,
                    revalidateOnReconnect: true,
                    refreshWhenOffline: false,
                    refreshWhenHidden: false,
                })
            }
            throw new Error("Missing opts['email']")
        }
    })

export const RegTknSrvValidate = withSrvValidate(Input,
    {
        validate: tknValidate,
        swr: (value: string, validate: (v: string) => boolean) => {
            return useSWR(["reg_tkn_valid", value], ([cmd, value]) => {
                const send = {tkn: value}
                if (validate(value))
                    return invoke<boolean>(cmd, {data: JSON.stringify(send)})

                return false
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

export const SearchInput
    = forwardRef<HTMLInputElement, SearchProps>((p, ref) => {

    const {onChange, value, setValue, ...passParams} = p
    const {t} = useTranslation()
    const divRef = useRef<HTMLDivElement>(null)

    function searchInputOnChange(e: ChangeEvent<HTMLInputElement>) {
        setValue(e.target.value)
        if (onChange !== undefined)
            onChange(e)
    }

    function clearBtnClicked() {
       setValue('')
    }

    function parentAreaClicked() {
        if(divRef !== null && divRef.current != null) {
            const input = divRef.current.children[0] as HTMLInputElement
            if(input != null && document.activeElement !== input)
                input.focus()

        }
    }

    function parentAreaMouseDown(e: MouseEvent<HTMLDivElement>) {
        const target = e.target as HTMLElement
        if(target.tagName !== 'INPUT')
            e.preventDefault()
    }

    return (
        <div
            className={`relative ${p.disabled ? '' : 'cursor-text'} ${p.className || ""}`}
            onClick={parentAreaClicked}
            onMouseDown={parentAreaMouseDown}
            ref={divRef}
            aria-disabled={p.disabled}
        >
            <Input
                {...passParams}
                ref={ref}
                onChange={searchInputOnChange}
                type="text"
                placeholder={t('search-placeholder')}
                className={`pr-10 ${p.disabled ? 'opacity-30' : ''}`}
                value={value}
                disabled={p.disabled}
            />
            {value === '' ?
                <Search className="w-7 absolute top-2 right-1.5"/>
                : <Btn
                    className={`rounded p-1 w-7 absolute top-2 right-1.5 ${p.disabled ? 'opacity-30' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    disabled={p.disabled}
                    onClick={clearBtnClicked}
                >
                    <Cross fill="currentColor"/>
                </Btn>
            }
        </div>
    )
})

export interface SearchProps {
    value: string
    setValue: (s: string) => void,
    className?: string,
    tabIndex?: number,
    disabled?: boolean,
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void,
}

export interface InputProps {
    type?: InputType,
    className?: string,
    required?: boolean,
    disabled?: boolean,
    readOnly?: boolean,
    id?: string,
    min?: number | string,
    max?: number | string,
    name?: string,
    value?: string,
    pattern?: string,
    maxLength?: number,
    tabIndex?: number,
    checked?: boolean,
    placeholder?: string,
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