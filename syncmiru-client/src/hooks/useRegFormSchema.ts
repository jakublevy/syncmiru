import Joi from "joi";
import useFormValidate from "@hooks/useFormValidate.ts";

const {passwordValidate, usernameValidate, displaynameValidate, emailValidate}
    = useFormValidate()

export function useRegFormSchema(regPubAllowed: boolean): Joi.ObjectSchema<RegFormFields> {
    if(regPubAllowed) {
        const captchaSchema: Joi.ObjectSchema<RegFormFields> = Joi.object({
            captcha: Joi
                .string()
                .required()
                .messages({"string.empty": 'Captcha musí být vyplněna'})
        })
        return commonSchema.concat(captchaSchema)
    }
    else {
        const regTknSchema: Joi.ObjectSchema<RegFormFields> = Joi.object({
            regTkn: Joi
                .string()
                .required()
                .messages({"string.empty": 'Toto pole musí být vyplněno'})
        })
        return commonSchema.concat(regTknSchema)
    }
}

const commonSchema: Joi.ObjectSchema<RegFormFields> = Joi.object({
    email: Joi
        .string()
        .required()
        .messages({"string.empty": 'Toto pole musí být vyplněno'})
        .custom((v: string, h) => {
            if(!emailValidate(v))
                return h.message({custom: "Toto není platný email"})
            return v
        }),
    password: Joi
        .string()
        .required()
        .messages({"string.empty": 'Toto pole musí být vyplněno'})
        .custom((v: string, h) => {
            if(!passwordValidate(v))
                return h.message({custom: "Toto není dostatečně silné heslo"})
            return v
        }),
    username: Joi
        .string()
        .required()
        .messages({"string.empty": 'Toto pole musí být vyplněno'})
        .custom((v: string, h) => {
            if (!usernameValidate(v))
                return h.message({custom: "Toto není platné uživatelské jméno"})
            return v
        }),
    displayname: Joi
        .string()
        .required()
        .messages({"string.empty": 'Toto pole musí být vyplněno'})
        .custom((v: string, h) => {
            if (!displaynameValidate(v))
                return h.message({custom: "Toto není platné zobrazené jméno"})
            return v
        }),
    cpassword: Joi
        .string()
        .valid(Joi.ref('password'))
        .required()
        .empty('')
        .messages({"any.only": "Hesla nejsou stejná", "any.required": "Toto pole musí být vyplněno"}),

    cemail: Joi
        .string()
        .valid(Joi.ref("email"))
        .required()
        .empty('')
        .messages({"any.only": "Emaily nejsou stejné", "any.required": "Toto pole musí být vyplněno"})
})

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
