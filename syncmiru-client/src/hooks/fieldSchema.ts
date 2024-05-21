import {TFunction} from "i18next";
import Joi from "joi";
import {passwordValidate, regTknNameValidate} from "src/form/validators.ts";

export const usePasswordSchema = (t: TFunction<"translation", undefined>) =>
    Joi
        .string()
        .required()
        .messages({"string.empty": t('required-field-error')})
        .custom((v: string, h) => {
            if(!passwordValidate(v))
                return h.message({custom: t('password-invalid-format')})
            return v
        })

export const useCPasswordSchema = (t: TFunction<"translation", undefined>) =>
    Joi
        .string()
        .valid(Joi.ref('password'))
        .required()
        .empty('')
        .messages({"any.only": t('password-not-match'), "any.required": t('required-field-error')})

export const useRegTknNameSchema = (t: TFunction<"translation", undefined>) =>
    Joi
        .string()
        .required()
        .messages({"string.empty": t('required-field-error')})
        .custom((v: string, h) => {
            if(!regTknNameValidate(v))
                return h.message({custom: t('title-invalid-format')})
            return v
        })