
import {invoke} from "@tauri-apps/api/core";
import {useEffect, useState} from "react";

export default function useFirstRunSeen(): [boolean | undefined, () => Promise<void>] {
    const [firstRunSeen, setFirstRunSeen] = useState<boolean>()
    const fetchFirstRunSeen = async (): Promise<boolean> => {
        return await invoke('get_first_run_seen', {})
    }
    const invokeSetFirstRunSeen = async (): Promise<void> => {
        return invoke('set_first_run_seen', {}).then(() => setFirstRunSeen(true))
    }

    useEffect(() => {
        fetchFirstRunSeen().then(b => setFirstRunSeen(b))
    }, []);

    return [firstRunSeen, invokeSetFirstRunSeen]
}
