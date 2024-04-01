import {ChangeEvent, ReactElement} from "react";

export default function Input({type, className, required, disabled, readonly, id, name, value, onChange}: Props): ReactElement {
    return <input
        type={type}
        required={required}
        disabled={disabled}
        readOnly={readonly}
        onChange={onChange}
        id={id}
        name={name}
        value={value}
        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 
                    dark:border-gray-600 dark:placeholder-gray-400 dark:text-darkread ${className}`}
    />
}

interface Props {
    type: InputType
    className?: string,
    required?: boolean,
    disabled?: boolean,
    readonly?: boolean,
    id?: string,
    name?: string,
    value?: string,
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void

}

type InputType
    = "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file"
    | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset"
    | "search" | "submit" | "tel" | "text" | "time" | "url" | "week";