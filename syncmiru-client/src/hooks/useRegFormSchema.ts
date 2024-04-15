import Joi from "joi";
import useFormValidate from "@hooks/useFormValidate.ts";
import {TFunction} from "i18next";

const {passwordValidate, usernameValidate, displaynameValidate, emailValidate}
    = useFormValidate()

export function useRegFormSchema(regPubAllowed: boolean, t: TFunction<"translation", undefined>): Joi.ObjectSchema<RegFormFields> {
    if(regPubAllowed) {
        const captchaSchema: Joi.ObjectSchema<RegFormFields> = Joi.object({
            captcha: Joi
                .string()
                .required()
                .messages({"string.empty": t('captcha-not-filled-error')})
        })
        return commonSchema(t).concat(captchaSchema)
    }
    else {
        const regTknSchema: Joi.ObjectSchema<RegFormFields> = Joi.object({
            regTkn: Joi
                .string()
                .required()
                .messages({"string.empty": t('required-field-error')})
        })
        return commonSchema(t).concat(regTknSchema)
    }
}

function commonSchema(t: TFunction<"translation", undefined>) {
    return Joi.object({
        email: Joi
            .string()
            .required()
            .messages({"string.empty": t('required-field-error')})
            .custom((v: string, h) => {
                if(!emailValidate(v))
                    return h.message({custom: t('email-invalid-format')})
                return v
            }),
        password: Joi
            .string()
            .required()
            .messages({"string.empty": t('required-field-error')})
            .custom((v: string, h) => {
                if(!passwordValidate(v))
                    return h.message({custom: t('password-invalid-format')})
                return v
            }),
        username: Joi
            .string()
            .required()
            .messages({"string.empty": t('required-field-error')})
            .custom((v: string, h) => {
                if (!usernameValidate(v))
                    return h.message({custom: t('username-invalid-format')})
                return v
            }),
        displayname: Joi
            .string()
            .required()
            .messages({"string.empty": t('required-field-error')})
            .custom((v: string, h) => {
                if (!displaynameValidate(v))
                    return h.message({custom: t('displayname-invalid-format')})
                return v
            }),
        cpassword: Joi
            .string()
            .valid(Joi.ref('password'))
            .required()
            .empty('')
            .messages({"any.only": t('password-not-match'), "any.required": t('required-field-error')}),

        cemail: Joi
            .string()
            .valid(Joi.ref("email"))
            .required()
            .empty('')
            .messages({"any.only": t('email-not-match'), "any.required": t('required-field-error')})
    })
}

export type RegFormFields = {
    username: string
    displayname: string
    email: string
    cemail: string
    password: string
    cpassword: string
    captcha: string
    regTkn: string
}
