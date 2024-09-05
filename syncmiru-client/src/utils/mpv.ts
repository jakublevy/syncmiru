import {UserId, UserValueClient} from "@models/user.ts";
import {UserReadyState} from "@components/widgets/ReadyState.tsx";
import {invoke} from "@tauri-apps/api/core";
import {showPersistentErrorAlert} from "./alert.ts";

export function showMpvReadyMessages(
    uid2ready: Map<UserId, UserReadyState>,
    users: Map<UserId, UserValueClient>
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

    loading.sort()
    notReady.sort()

    invoke('mpv_show_ready_messages', {loading: loading, notReady: notReady})
        .catch(() => {
            showPersistentErrorAlert('todo')
        })
}