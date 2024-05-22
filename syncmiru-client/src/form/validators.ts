import Joi from "joi";

export const emailValidate = (email: string): boolean => {
    const schema = Joi.string().email({tlds: false})
    return schema.validate(email).error === undefined
}

export const passwordValidate = (password: string): boolean => {
    return password.length >= 8
}

export const usernameValidate = (username: string): boolean => {
    return /^[a-z]{4,16}$/.test(username)
}

export const displaynameValidate = (displayname: string): boolean => {
    return displayname.length >= 4
        && displayname.length <= 16
        && !/^\s$/.test(displayname[0])
        && !/^\s$/.test(displayname[displayname.length - 1])
}

export const regTknNameValidate = (regTknName: string): boolean => {
    return regTknName.length >= 1 && regTknName.length <= 16
}

export const maxRegsValidate = (maxRegs: string): boolean => {
    try {
        let n = parseFloat(maxRegs)
        return n >= 1 && n <= 2147483647 && Number.isInteger(n)
    }
    catch (e) {
        return false
    }
}

export const tknValidate = (tkn: string): boolean => {
    if(tkn.length !== 24)
        return false

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    let padding = false
    for (let i = 0; i < tkn.length; ++i) {
        if (!alphabet.includes(tkn[i])) {
            if (tkn[i] === '=')
                padding = true
            else if(padding)
                return false
        }
    }
    return true
}
