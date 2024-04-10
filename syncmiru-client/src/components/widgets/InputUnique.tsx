import {
    ChangeEvent,
    forwardRef,
    ForwardRefExoticComponent,
    RefAttributes,
    useEffect,
    useState
} from "react";
import {EmailInput, UsernameInput, InputProps} from "@components/widgets/Input.tsx";
import useSWR from "swr";
import {invoke} from "@tauri-apps/api/core";
import useFormValidate from "@hooks/useFormValidate.ts";

const withOnChangeUnique = (
    InputComponent:  ForwardRefExoticComponent<InputProps & RefAttributes<HTMLInputElement>>,
    conf: UniqueConf) => {
        const cmd = `get_${conf.type}_unique`

        const InputComponentWithUnique
            = forwardRef<HTMLInputElement, InputProps & UniqueProps>((p, ref) => {
            const {
                onUniqueChanged,
                onChange,
                className,
                ...passParams} = p

            const [value, setValue] = useState<string>('')

            const {data: isUnique}
                = useSWR([cmd, value], ([cmd, value]) => {
                    let send: any = {}
                    send[conf.type] = value
                if(conf.validator(value))
                    return invoke<boolean>(cmd, send)
                return true
            }, {
                revalidateOnFocus: false,
                revalidateOnMount: false,
                revalidateOnReconnect: true,
                refreshWhenOffline: false,
                refreshWhenHidden: false,
            })

            useEffect(() => {
                if(isUnique !== undefined)
                    onUniqueChanged(isUnique)
            }, [isUnique]);

            function inputOnChange(e: ChangeEvent<HTMLInputElement>) {
                setValue(e.target.value)

                if (onChange !== undefined)
                    onChange(e)
            }

            return <InputComponent
                {...passParams}
                ref={ref}
                onChange={inputOnChange}
                className={className}
            />
        })
    return InputComponentWithUnique
}

interface UniqueConf {
    validator: (s: string) => boolean,
    type: "email" | "username"

}

interface UniqueProps {
    onUniqueChanged: (b: boolean) => void,
}


export const EmailInputUnique
    = withOnChangeUnique(EmailInput, {validator: useFormValidate().emailValidate, type: "email"})

export const UsernameInputUnique
    = withOnChangeUnique(UsernameInput, {validator: useFormValidate().usernameValidate, type: "username"})