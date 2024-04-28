import {invoke} from "@tauri-apps/api/core";
import useSWRImmutable from "swr/immutable";

export const useReqForgottenPasswordEmail = (email: string) =>
    useSWRImmutable('req_forgotten_password_email', cmd => invoke<void>(cmd, {email: email}), {
        suspense: false,
        shouldRetryOnError: false,
    })

export function useReqForgottenPasswordEmailAgain(): (email: string) => Promise<void> {
    return (email: string): Promise<void> => {
        return invoke('req_forgotten_password_email', {email: email})
    }
}
