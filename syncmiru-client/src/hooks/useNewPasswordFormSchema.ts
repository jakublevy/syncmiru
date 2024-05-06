import Joi from "joi";
import {TFunction} from "i18next";
import {useCPasswordSchema, usePasswordSchema} from "@hooks/fieldSchema.ts";

export function useNewPasswordSchema(t: TFunction<"translation", undefined>) {
    return Joi.object({
        password: usePasswordSchema(t),
        cpassword: useCPasswordSchema(t)
})}

export type NewPasswordFields = {
    password: string
    cpassword: string
}
