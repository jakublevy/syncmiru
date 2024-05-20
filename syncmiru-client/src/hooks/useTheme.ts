import {Theme} from "@models/config.tsx";
import {usePromise} from "@mittwald/react-use-promise";
import {invoke} from "@tauri-apps/api/core";

export const useTheme = (): Theme => {
    return usePromise(themePromise, [], {tags: ["useTheme"]})
}

const themePromise = (): Promise<Theme> => {
    return invoke('plugin:theme|get_theme', {})
}

export function useChangeTheme(): (t: Theme) => Promise<void> {
    return (t: Theme): Promise<void> => {
        return invoke('plugin:theme|set_theme', {theme: t})
    }
}
