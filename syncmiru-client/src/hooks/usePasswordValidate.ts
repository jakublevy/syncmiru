import { validatePassword } from 'multiform-validator';

export default function usePasswordValidate() {
    return (password: string): boolean => {
        const {isValid} = validatePassword(password, 8, null, {
            requireNumber: true,
            requireString: true,
            requireUppercase: true,
            requireSpecialChar: true,
        })
        return isValid
    }
}