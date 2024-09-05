import {TFunction} from "i18next";

function localeCompare(
    t: TFunction<"translation", undefined>,
    a: string,
    b: string
): number {
    return a.localeCompare(b, t('lang-code'), {numeric: true})
}

export function createLocaleComparator(t: TFunction<"translation", undefined>) {
    return (a: string, b: string) => localeCompare(t, a, b)
}