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
            ...passParams
        } = p

        const [value, setValue] = useState<string>('')

        const {data: isValid} = conf.swr(value, conf.validate)

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
}

interface withSrvValidateProps {
    swr: (value: string, validate: (v: string) => boolean) => SWRResponse<boolean, any, any>
    validate: (v: string) => boolean
}
