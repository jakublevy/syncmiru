import {UserId, UserValueClient} from "@models/user.ts";
import {UserReadyState} from "@components/widgets/ReadyState.tsx";
import {invoke} from "@tauri-apps/api/core";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import {createLocaleComparator} from "src/utils/sort.ts";
import {TFunction} from "i18next";

export function showMpvReadyMessages(
    uid2ready: Map<UserId, UserReadyState>,
    users: Map<UserId, UserValueClient>,
    t: TFunction<"translation", undefined>,
) {
    let loading: string[] = []
    let notReady: string[] = []

    for(const [uid, state] of uid2ready) {
        const userValue = users.get(uid)
        if(userValue == null)
            continue

        if(state === UserReadyState.Loading)
            loading.push(userValue.displayname)
        else if([UserReadyState.NotReady, UserReadyState.Error].includes(state))
            notReady.push(userValue.displayname)
    }

    const localeComparator = createLocaleComparator(t)

    loading.sort(localeComparator)
    notReady.sort(localeComparator)

    invoke('mpv_show_ready_messages', {loading: loading, notReady: notReady})
        .catch(() => {
            showPersistentErrorAlert(t('mpv-msg-show-failed'))
        })
}

export function hideMpvReadyMessages(t: TFunction<"translation", undefined>) {
    invoke('mpv_hide_ready_messages', {})
        .catch(() => {
            showPersistentErrorAlert(t('mpv-msg-show-failed'))
        })
}

export function timestampPretty(timestamp: number) {
    const minutes = Math.floor(timestamp / 60)
    const seconds = Math.round(timestamp % 60)
    if(minutes < 60) {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    else {
        const hours = Math.floor(minutes / 60)
        return `${hours.toString().padStart(2, '00')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

}

export enum MpvMsgMood {
    Neutral = 0,
    Bad = 1,
    Good = 2,
    Warning = 3
}