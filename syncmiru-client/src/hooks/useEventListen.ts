import {EventCallback, listen, UnlistenFn} from '@tauri-apps/api/event'
import {usePromise} from "@mittwald/react-use-promise";
import {invoke} from "@tauri-apps/api/core";
import {useEffect} from "react";

// export const useEventListen = <T>(event_name: string, handle: EventCallback<T>): UnlistenFn => {
//     return usePromise(listen<T>, [event_name, handle], {tags: ['useEventListen']})
// }

export const useEventListen = <T>(event_name: string, handle: EventCallback<T>) => {
    useEffect(() => {
        listen<T>(event_name, handle)
    }, []);
}