import {invoke} from "@tauri-apps/api/core";
import {usePromise} from "@mittwald/react-use-promise";

export const useTestCommand = (): void => {
    return usePromise(testCommandPromise, [], {tags: ["useTestCommand"]})
}

const testCommandPromise = (): Promise<void> => {
    return invoke('test_command', {})
}
