import {invoke} from "@tauri-apps/api/core";
import useSWRImmutable from "swr/immutable";

export const useReqVerificationEmail = (email: string) =>
    useSWRImmutable('req_verification_email', cmd => invoke<void>(cmd, {email: email}), {
        suspense: true,
    })
