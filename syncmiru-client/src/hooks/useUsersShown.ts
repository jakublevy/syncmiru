import {invoke} from "@tauri-apps/api/core";
import {usePromise} from "@mittwald/react-use-promise";

export const useUsersShown = (): boolean => {
    return usePromise(usersShown, [], {tags: ["useUsersShown"]})
}

const usersShown = (): Promise<boolean> => {
    return invoke('get_users_shown', {})
}

export function useChangeUsersShown(): (usersShown: boolean) => Promise<void> {
    return (usersShown: boolean): Promise<void> => {
        return invoke('set_users_shown', {usersShown: usersShown})
    }
}
