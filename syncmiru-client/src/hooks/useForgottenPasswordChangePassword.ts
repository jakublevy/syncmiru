import {invoke} from "@tauri-apps/api/core";
import {ForgottenPasswordChangeData} from "@models/login.ts";

export function useForgottenPasswordChangePassword(): (data: ForgottenPasswordChangeData) => Promise<void> {
    return (data: ForgottenPasswordChangeData): Promise<void> => {
        return invoke('forgotten_password_change_password', {data: JSON.stringify(data)})
    }
}
