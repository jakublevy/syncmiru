import {ReactElement, useEffect, useState} from "react";
import {BtnPrimary, BtnSecondary, EditBtn} from "@components/widgets/Button.tsx";
import {useTranslation} from "react-i18next";
import {ModalWHeader} from "@components/widgets/Modal.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import Label from "@components/widgets/Label.tsx";
import Help from "@components/widgets/Help.tsx";
import {DisplaynameInput} from "@components/widgets/Input.tsx";
import Joi from "joi";
import {useForm} from "react-hook-form";
import {joiResolver} from "@hookform/resolvers/joi";
import {useDisplaynameSchema} from "@hooks/fieldSchema.ts";
import {SOCKETIO_ACK_TIMEOUT_MS} from "src/utils/constants.ts";
import {showPersistentErrorAlert} from "../../utils/alert.ts";

export default function DisplaynameSettings(p: Props): ReactElement {
    const {t} = useTranslation()
    const [open, setOpen] = useState<boolean>(false)
    const {socket} = useMainContext()
    const [displayname, setDisplayname] = useState<string>("")

    const formSchema = Joi.object({displayname: useDisplaynameSchema(t)})

    const {
        register,
        handleSubmit,
        reset,
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
        p.onDisplaynameLoading()
        setOpen(false)
        socket!
            .emitWithAck("set_my_displayname", data)
                .then(() => {
                    setDisplayname(data.displayname)
                })
                .catch(() => {
                    showPersistentErrorAlert(t('displayname-change-error'))
                })
                .finally(() => p.onDisplaynameLoaded())
    }

    function editClicked() {
        reset({displayname: displayname})
        setOpen(true)
    }

    return (
        <>
            <div className="flex items-center">
                <p className="w-56">{t('user-settings-account-displayname-label')}</p>
                <p className="font-bold">{displayname}</p>
                <div className="flex-1"></div>
                <EditBtn className="w-10" onClick={editClicked}/>
            </div>
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
                            {...register('displayname')}
                        />
                        {errors.displayname
                            ? <p className="text-danger font-semibold">{errors.displayname.message}</p>
                            : <p className="text-danger invisible font-semibold">L</p>}
                        <hr className="-ml-6 -mr-6 mt-4 mb-4"/>
                        <div className="flex gap-3">
                            <BtnPrimary type="submit">{t('modal-change-action-btn')}</BtnPrimary>
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
    onDisplaynameLoading: () => void
}

interface FormFields {
    displayname: string
}