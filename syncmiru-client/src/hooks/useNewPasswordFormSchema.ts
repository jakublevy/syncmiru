import Joi from "joi";
import useFormValidate from "@hooks/useFormValidate.ts";
import {useTranslation} from "react-i18next";
import {TFunction} from "i18next";

const {passwordValidate} = useFormValidate()

export function useNewPasswordSchema(t: TFunction<"translation", undefined>) {
    return Joi.object({
        password: Joi
            .string()
            .required()
            .messages({"string.empty": t('required-field-error')})
            .custom((v: string, h) => {
                if(!passwordValidate(v))
                    return h.message({custom: t('password-invalid-format')})
                return v
            }),
        cpassword: Joi
            .string()
            .valid(Joi.ref('password'))
            .required()
            .empty('')
            .messages({"any.only": t('password-not-match'), "any.required": t('required-field-error')}),
    })
}

export type NewPasswordFields = {
    password: string
    cpassword: string
}
