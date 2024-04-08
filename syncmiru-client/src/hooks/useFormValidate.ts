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

export default function useFormValidate() {
    return {
        passwordValidate: passwordValidate,
        usernameValidate: usernameValidate,
        displaynameValidate: displaynameValidate,
    }
}