import {invoke} from "@tauri-apps/api/core";
import useSWRImmutable from "swr/immutable";

export const useReqForgottenPasswordEmail = (email: string) =>
    useSWRImmutable('req_forgotten_password_email', cmd => invoke<void>(cmd, {email: email}), {
        suspense: false,
        shouldRetryOnError: false,
    })


// export const useReqForgottenPasswordEmail = (email: string) => {
//         const [error, setError] = useState<string | undefined>(undefined);
//         const [isLoading, setIsLoading] = useState<boolean>(true);
//
//         invoke<void>("req_forgotten_password_email", {email: email})
//             .then(() => setIsLoading(false))
//             .catch((e: string) => { setError(e); setIsLoading(false) });
//
//         return { isLoading: isLoading, error: error }
// }
