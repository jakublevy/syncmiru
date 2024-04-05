import {validateEmail} from "multiform-validator";

export default function useEmailValidate() {
    return (email: string): boolean => {
        const {isValid} = validateEmail(email, null, null, null, false)
        return isValid
    }
}