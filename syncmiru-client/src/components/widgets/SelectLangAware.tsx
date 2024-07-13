import {ReactElement} from "react";
import {Props} from "react-select";
import Select from 'react-select'
import {useTranslation} from "react-i18next";

export default function SelectLangAware<OptionT>(p: SelectLangAwareProps<OptionT>): ReactElement {
    const {t} = useTranslation()

    const styles = {
        control: (provided: any, state: any) => ({
            ...provided,
            opacity: state.isDisabled ? 0.3 : 1,
        }),
    };

    return (
        <Select
            placeholder={t('select-placeholder')}
            noOptionsMessage={() => <>{t('select-no-options-msg')}</>}
            styles={styles}
            {...p}
        />
    )
}

type SelectLangAwareProps<OptionT> = Omit<Props<OptionT>, "placeholder" | "noOptionsMessage">