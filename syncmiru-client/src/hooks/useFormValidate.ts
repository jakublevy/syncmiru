import {validateEmail, validatePassword} from "multiform-validator";

const emailValidate = (email: string): boolean => {
    const {isValid} = validateEmail(email, null, null, null, false)
    return isValid
}

const passwordValidate = (password: string): boolean => {
    const {isValid} = validatePassword(password, 8, null, {
        requireNumber: true,
        requireString: true,
        requireUppercase: true,
        requireSpecialChar: true,
    })
    return isValid
}

const usernameValidate = (username: string): boolean => {
    return /^[a-z]{4,16}$/.test(username)
}

const displaynameValidate = (displayname: string): boolean => {
    return displayname.length > 4 && displayname.length <= 24
}

export default function useFormValidate() {
    return {
        emailValidate: emailValidate,
        passwordValidate: passwordValidate,
        usernameValidate: usernameValidate,
        displaynameValidate: displaynameValidate,
    }
}