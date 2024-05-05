import {ReactElement, useEffect, useState} from "react";
import {BtnPrimary, BtnSecondary, EditBtn} from "@components/widgets/Button.tsx";
import {useTranslation} from "react-i18next";
import {ModalWHeader} from "@components/widgets/Modal.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import Label from "@components/widgets/Label.tsx";
import Help from "@components/widgets/Help.tsx";
import {DisplaynameInput} from "@components/widgets/Input.tsx";
import Joi from "joi";
import useFormValidate from "@hooks/useFormValidate.ts";
import {useForm} from "react-hook-form";
import {joiResolver} from "@hookform/resolvers/joi";

export default function DisplaynameSettingsTableRow(p: Props): ReactElement {
    const {t} = useTranslation()
    const [open, setOpen] = useState<boolean>(false)
    const {socket} = useMainContext()
    const {displaynameValidate} = useFormValidate()
    const [displayname, setDisplayname] = useState<string>("")

    const formSchema = Joi.object({
        displayname: Joi
            .string()
            .required()
            .messages({"string.empty": t('required-field-error')})
            .custom((v: string, h) => {
                if (!displaynameValidate(v))
                    return h.message({custom: t('displayname-invalid-format')})
                return v
            }),
    })

    const {
        register,
        handleSubmit,
        formState: {errors}
    } = useForm<FormFields>({resolver: joiResolver(formSchema)});

    useEffect(() => {
        if (socket !== undefined) {
            socket.on('my_displayname', onMyDisplayname)
            socket.emit("req_my_displayname")
        }
    }, [socket]);

    function onMyDisplayname(displayname: string) {
        setDisplayname(displayname)
        p.onDisplaynameLoaded()
    }

    function changeDisplayname(data: FormFields) {
        console.log(JSON.stringify(data))
    }

    return (
        <>
            <tr>
                <td>{t('user-settings-account-displayname-label')}</td>
                <td className="font-bold">{displayname}</td>
                <td className="text-right">
                    <EditBtn className="w-10" onClick={() => setOpen(true)}/>
                </td>
            </tr>
            <ModalWHeader
                title={t('modal-change-displayname-title')}
                open={open}
                setOpen={setOpen}
                content={
                    <form onSubmit={handleSubmit(changeDisplayname)} noValidate>
                        <div className="flex justify-between">
                            <Label htmlFor="displayname">{t('displayname-label')}</Label>
                            <Help
                                tooltipId="displayname-help"
                                className="w-4"
                                content={t('modal-change-displayname-help')}
                            />
                        </div>
                        <DisplaynameInput
                            id="displayname"
                            className="mb-4"
                            {...register('displayname')}
                        />
                        <hr className="-ml-6 -mr-6 mt-6 mb-4"/>
                        <div className="flex gap-3">
                            <BtnPrimary type="submit" onClick={() => setOpen(false)}>{t('modal-change-action-btn')}</BtnPrimary>
                            <BtnSecondary onClick={() => setOpen(false)}>{t('modal-no-action-btn')}</BtnSecondary>
                        </div>
                    </form>
                }
            />
        </>
    )
}

interface Props {
    onDisplaynameLoaded: () => void
}

interface FormFields {
    displayname: string
}