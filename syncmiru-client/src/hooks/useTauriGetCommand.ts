// import {invoke} from "@tauri-apps/api/core";
// import {usePromise} from "@mittwald/react-use-promise";
//
// // @ts-ignore
// import {UsePromiseOptions} from "@mittwald/react-use-promise/dist/types/use-promise/types";
// // @ts-ignore
// import {UseWatchResourceResult} from "@mittwald/react-use-promise/dist/types/resource/types";
//
// export const useTauriGetCommand = <TVal, TOpts extends UsePromiseOptions>(command: string, options?: UsePromiseOptions): UseWatchResourceResult<TVal, TOpts> => {
//     const promise = (): Promise<TVal> => {
//         return invoke(command, {})
//     }
//
//     return usePromise(promise, [], options)
// }
//
// export const buildTauriGetCommandHook = <TVal, TOpts extends UsePromiseOptions>(command: string, options?: UsePromiseOptions) => {
//     return (): UseWatchResourceResult<TVal, TOpts> => { return useTauriGetCommand(command, options) }
// }






// export const useTauriGetCommand = <TVal, TOpts extends UsePromiseOptions>(command: string, args?: InvokeArgs, options?: UsePromiseOptions): UseWatchResourceResult<TVal, TOpts> => {
//     const promise = (a?: InvokeArgs): Promise<TVal> => {
//         return invoke(command, a)
//     }
//
//     return usePromise(promise, [args], options)
// }
//
// export const buildTauriGetCommandHook = <TVal, TOpts extends UsePromiseOptions>(command: string, args?: InvokeArgs, options?: UsePromiseOptions) => {
//     return (): UseWatchResourceResult<TVal, TOpts> => { return useTauriGetCommand(command, args, options) }
// }