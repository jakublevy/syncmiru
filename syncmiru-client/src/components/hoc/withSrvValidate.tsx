import {
    ChangeEvent,
    forwardRef,
    ForwardRefExoticComponent,
    RefAttributes,
    useEffect,
    useState
} from "react";
import {InputProps} from "@components/widgets/Input.tsx";
import {SWRResponse} from "swr";

export const withSrvValidate = (
    InputComponent: ForwardRefExoticComponent<InputProps & RefAttributes<HTMLInputElement>>,
    conf: withSrvValidateProps) => {
    const InputComponentWithSrvValidate
        = forwardRef<HTMLInputElement, InputProps & UniqueProps>((p, ref) => {
        const {
            onSrvValidationChanged,
            onChange,
            className,
            validationArgs,
            onSrvValidationError,
            ...passParams
        } = p

        const [value, setValue] = useState<string>('')

        const {data, error} = conf.swr(value, conf.validate, validationArgs)
        const [isValid, setIsValid] = useState<boolean>()

        useEffect(() => {
            if(error !== undefined) {
                setIsValid(false)
                if (onSrvValidationError !== undefined)
                    onSrvValidationError(error)
            }
        }, [error]);

        useEffect(() => {
            if(error !== undefined) {
                setIsValid(false)
            }
            else {
                setIsValid(data)
            }
        }, [data]);

        useEffect(() => {
            if (isValid !== undefined)
                onSrvValidationChanged(isValid)
        }, [isValid]);

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
    return InputComponentWithSrvValidate
}

interface UniqueProps {
    onSrvValidationChanged: (b: boolean) => void,
    onSrvValidationError?: (error: any) => void
    validationArgs?: Record<string, unknown>
}

interface withSrvValidateProps {
    swr: (value: string, validate: (v: string) => boolean, opts: Record<string, unknown> | undefined) => SWRResponse<boolean, any, any>
    validate: (v: string) => boolean
}
