import {invoke} from "@tauri-apps/api/core";

export function useReqVerificationEmail(): (email: string) => Promise<void> {
    return (email: string): Promise<void> => {
        return invoke('req_verification_email', {email: email})
    }
}
