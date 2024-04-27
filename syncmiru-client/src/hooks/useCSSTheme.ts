export default function useCSSTheme(): CSSTheme {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
        return CSSTheme.Dark
    return CSSTheme.Light
}

export enum CSSTheme {
    Light = "light",
    Dark = "dark",
}