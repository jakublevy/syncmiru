import Joi from "joi";

const emailValidate = (email: string): boolean => {
    const schema = Joi.string().email({tlds: false})
    return schema.validate(email).error === undefined
}

const passwordValidate = (password: string): boolean => {
    return password.length >= 8
}

const usernameValidate = (username: string): boolean => {
    return /^[a-z]{4,16}$/.test(username)
}

const displaynameValidate = (displayname: string): boolean => {
    return displayname.length >= 4
        && displayname.length <= 24
        && !/^\s$/.test(displayname[0])
        && !/^\s$/.test(displayname[displayname.length - 1])
}

const tknValidate = (tkn: string): boolean => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    for(let i = 0; i< tkn.length; ++i) {
        if(!alphabet.includes(tkn[i]))
            return false
    }
    return true
}

export default function useFormValidate() {
    return {
        emailValidate: emailValidate,
        passwordValidate: passwordValidate,
        usernameValidate: usernameValidate,
        displaynameValidate: displaynameValidate,
        tknValidate: tknValidate,
    }
}