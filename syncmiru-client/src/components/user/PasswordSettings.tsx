import {BtnPrimary, BtnSecondary} from "@components/widgets/Button.tsx";
import {ReactElement, useState} from "react";
import {useTranslation} from "react-i18next";
import {ModalWHeader} from "@components/widgets/Modal.tsx";
import Joi from "joi";
import {useCPasswordSchema, usePasswordSchema} from "@hooks/fieldSchema.ts";
import {useForm} from "react-hook-form";
import {joiResolver} from "@hookform/resolvers/joi";
import Label from "@components/widgets/Label.tsx";
import Help from "@components/widgets/Help.tsx";
import {Input} from "@components/widgets/Input.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {showPersistentErrorAlert, showTemporalSuccessAlertForModal} from "src/utils/alert.ts";

export default function PasswordSettings(p: Props): ReactElement {
    const {t} = useTranslation()
    const {socket} = useMainContext()
    const [passwordChangeModalOpen, setPasswordChangeModalOpen] = useState(false);
    const formSchema = Joi.object({
        oldPassword: Joi
            .string()
            .required()
            .messages({"string.empty": t('required-field-error')})
            .external(async (v: string, h) => {
                let ack = await socket!.emitWithAck("check_password", {password: v})
                if(ack.status === SocketIoAckType.Err || (ack.status === SocketIoAckType.Ok && !ack.payload))
                    return h.message({external: t('modal-change-password-not-current-password-error')})
                return v
            }),
        password: usePasswordSchema(t)
            .invalid(Joi.ref('oldPassword'))
            .messages({"any.invalid": t('modal-change-password-new-password-not-different-error')}),
        cpassword: useCPasswordSchema(t)
    })
    const {
        register,
        handleSubmit,
        reset,
        formState: {errors}
    } = useForm<FormFields>({resolver: joiResolver(formSchema)});

    function changePasswordClicked() {
        reset()
        setPasswordChangeModalOpen(true)
    }

    function changePassword(data: FormFields) {
        setPasswordChangeModalOpen(false)
        socket!.emitWithAck("change_password", {old_password: data.oldPassword, new_password: data.password})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err)
                    showPersistentErrorAlert(t('modal-change-password-failed'))
                else
                    showTemporalSuccessAlertForModal(t('modal-change-password-success'))

            })
            .catch(() => {
                showPersistentErrorAlert(t('modal-change-password-failed'))
            })
    }

    return (
        <>
            <BtnSecondary
                onClick={changePasswordClicked}
            >{t('modal-change-password-btn')}
            </BtnSecondary>
            <ModalWHeader
                title={t('modal-change-password-title')}
                open={passwordChangeModalOpen}
                setOpen={setPasswordChangeModalOpen}
                content={
                    <form onSubmit={handleSubmit(changePassword)} noValidate>
                        <div className="mb-3">
                            <div className="flex justify-between">
                                <Label htmlFor="oldPassword">{t('modal-change-password-old-password-label')}</Label>
                                <Help
                                    tooltipId="oldPassword-help"
                                    className="w-4"
                                    content={t('modal-change-password-old-password-help')}
                                />
                            </div>
                            <Input
                                id="oldPassword"
                                type="password"
                                required
                                {...register('oldPassword')}
                            />
                            {errors.oldPassword
                                ? <p className="text-danger font-semibold">{errors.oldPassword.message}</p>
                                : <p className="text-danger invisible font-semibold">L</p>
                            }
                        </div>
                        <div className="mb-3">
                            <div className="flex justify-between">
                                <Label htmlFor="password">{t('modal-change-password-password-label')}</Label>
                                <Help
                                    tooltipId="password-help"
                                    className="w-4"
                                    content={t('modal-change-password-password-help')}
                                />
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                {...register('password')}
                            />
                            {errors.password
                                ? <p className="text-danger font-semibold">{errors.password.message}</p>
                                : <p className="text-danger invisible font-semibold">L</p>}
                        </div>
                        <div className="mb-3">
                            <div className="flex justify-between">
                                <Label htmlFor="cpassword">{t('modal-change-password-cpassword-label')}</Label>
                                <Help
                                    tooltipId="cpassword-help"
                                    className="w-4"
                                    content={t('modal-change-password-cpassword-help')}
                                />
                            </div>
                            <Input
                                id="cpassword"
                                type="password"
                                required
                                {...register('cpassword')}
                            />
                            {errors.cpassword
                                ? <p className="text-danger font-semibold">{errors.cpassword.message}</p>
                                : <p className="text-danger invisible font-semibold">L</p>}
                        </div>
                        <hr className="-ml-6 -mr-6 mt-4 mb-4"/>
                        <div className="flex gap-3">
                            <BtnPrimary type="submit">{t('modal-change-action-btn')}</BtnPrimary>
                            <BtnSecondary
                                onClick={() => setPasswordChangeModalOpen(false)}>{t('modal-keep-btn')}</BtnSecondary>
                        </div>
                    </form>
                }
            />
        </>
    )
}

interface Props {
    setLoading: (b: boolean) => void
}

interface FormFields {
    oldPassword: string
    password: string
    cpassword: string
}