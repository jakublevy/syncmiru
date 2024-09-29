import {RegTkn} from "@models/regTkn.ts";
import {showTemporalSuccessAlertForModal} from "src/utils/alert.ts";
import {TFunction} from "i18next";

export async function copyRegTkn(regTkn: RegTkn, t: TFunction<"translation", undefined>) {
    await navigator.clipboard.writeText(regTkn.key);
    showTemporalSuccessAlertForModal(`${t('reg-tkns-copy-1')} "${regTkn.name}" ${t('reg-tkns-copy-2')}`)
}