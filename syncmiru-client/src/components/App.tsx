import Welcome from "./Welcome.tsx";
// @ts-ignore
import {ReactElement, Suspense} from "react";
import {useTranslation} from "react-i18next";
import Loading from "./Loading.tsx";

function App(): ReactElement {
    const {i18n} = useTranslation()

    return (
        <Suspense fallback={<Loading />}>
           <Welcome />
        </Suspense>
    );
}

export default App;
