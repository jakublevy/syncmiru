import {useTranslation} from "react-i18next";
import {Language} from '../models/config.tsx'
import useFirstRunSeen from "../hooks/useFirstRunSeen.ts";
import useLanguage from "../hooks/useLanguage.ts";
import Welcome from './Welcome.tsx'

function App() {
    const { t } = useTranslation()
    const [firstRunSeen, setFirstRunSeen] = useFirstRunSeen()
    const [lang, setLang] = useLanguage()

    async function btnClick() {
        await setFirstRunSeen()
    }

    return (
        <Welcome />
        // <div className="container">
        //     <button onClick={btnClick} className="text-3xl font-bold dark:underline text-red-600">Ahoj</button>
        //     <h1>Welcome to Tauri! {t('send')}</h1>
        //     <h2>FirstRunSeen: {String(firstRunSeen)}</h2>
        //     <h2>Language: {lang == Language.English ? "ENG" : "OTHER"}</h2>
        // </div>
    );
}

export default App;
