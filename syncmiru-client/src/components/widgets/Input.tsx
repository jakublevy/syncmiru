import {ChangeEvent, KeyboardEvent, ReactElement} from "react";

export function Input({
        type,
        className,
        required,
        disabled,
        readOnly,
        id,
        name,
        value,
        pattern,
        maxLength,
        onChange,
        tabIndex,
        onKeyDown,
        onInput
}: Props): ReactElement {
    return <input
        type={type === undefined ? "text": type}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onInput={onInput}
        maxLength={maxLength}
        tabIndex={tabIndex}
        id={id}
        name={name}
        value={value}
        pattern={pattern}
        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 
                    dark:border-gray-600 dark:placeholder-gray-400 dark:text-darkread ${className}`}
    />
}

export function UsernameInput({
                                  className,
                                  required,
                                  disabled,
                                  readOnly,
                                  id,
                                  name,
                                  value,
                                  tabIndex,
                                  onChange,
                                  onKeyDown,
                              }: Props): ReactElement {

    function usernameOnInput(e: ChangeEvent<HTMLInputElement>) {
        e.target.value = e.target.value.toLowerCase()
        e.target.value = e.target.value.replace(/[^a-z]/g, '')
    }

    return <Input
        type="text"
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onInput={usernameOnInput}
        tabIndex={tabIndex}
        id={id}
        name={name}
        value={value}
        maxLength={16}
        pattern="[a-z]{4,16}"
        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 
                    dark:border-gray-600 dark:placeholder-gray-400 dark:text-darkread ${className}`}
    />
}

export function EmailInput({
                          className,
                          required,
                          disabled,
                          readOnly,
                          id,
                          name,
                          value,
                          tabIndex,
                          pattern,
                          onChange,
                          onKeyDown,
                          onInput
                      }: Props): ReactElement {
    return <Input
        type="email"
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onInput={onInput}
        maxLength={320}
        tabIndex={tabIndex}
        id={id}
        name={name}
        value={value}
        pattern={pattern}
        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 
                    dark:border-gray-600 dark:placeholder-gray-400 dark:text-darkread ${className}`}
    />
}

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