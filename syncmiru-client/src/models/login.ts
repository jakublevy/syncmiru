import {Language} from "@models/config.tsx";

export interface LoginForm {
    email: string,
    password: string
}

export interface ForgottenPasswordChangeData {
    email: string,
    password: string,
    tkn: string
    lang: Language
}

export interface RegData {
    username: string,
    displayname: string,
    email: string,
    password: string,
    captcha: string,
    reg_tkn: string
}