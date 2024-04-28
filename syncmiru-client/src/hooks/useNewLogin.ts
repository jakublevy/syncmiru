import {LoginForm} from "@models/login.ts";
import {invoke} from "@tauri-apps/api/core";

export function useNewLogin(): (data: LoginForm) => Promise<void> {
    return (data: LoginForm): Promise<void> => {
        return invoke('new_login', {data: JSON.stringify(data)})
    }
}
