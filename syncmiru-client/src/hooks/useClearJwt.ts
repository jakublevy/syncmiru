import {invoke} from "@tauri-apps/api/core";

export default function useClearJwt(): () => Promise<void> {
    return (): Promise<void> => {
        return invoke('clear_jwt', {})
    }
}
