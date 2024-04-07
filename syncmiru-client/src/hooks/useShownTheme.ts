export default function useShownTheme(): ShownTheme {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
        return ShownTheme.Dark
    return ShownTheme.Light
}

export enum ShownTheme {
    Light = "light",
    Dark = "dark",
}