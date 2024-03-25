import {useTranslation} from "react-i18next";

function App() {
    const { t } = useTranslation()
    return (
        <div className="container">
            <button className="text-3xl font-bold underline text-red-600">Ahoj</button>
            <h1>Welcome to Tauri! {t('send')}</h1>
        </div>
    );
}

export default App;
