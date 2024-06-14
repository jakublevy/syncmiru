import {ChangeEvent, ReactElement, useState} from "react";
import {BtnPrimary, BtnSecondary} from "@components/widgets/Button.tsx";
import Label from "@components/widgets/Label.tsx";
import Help from "@components/widgets/Help.tsx";
import {Input} from "@components/widgets/Input.tsx";
import {ModalWHeader} from "@components/widgets/Modal.tsx";
import Joi from "joi";
import {useForm} from "react-hook-form";
import {joiResolver} from "@hookform/resolvers/joi";
import {useTranslation} from "react-i18next";
import {maxRegsValidate, regTknNameValidate} from "src/form/validators.ts";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {useMainContext} from "@hooks/useMainContext.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";

export default function RegTknCreate(p: Props): ReactElement {
    const {socket} = useMainContext()
    const [regTknCreateModalOpen, setRegTknCreateModalOpen] = useState<boolean>(false);
    const [limitEnable, setLimitEnable] = useState<boolean>(false);
    const [showMaxRegsEmptyError, setShowMaxRegsEmptyError] = useState<boolean>(false);
    const {t} = useTranslation()
    const formSchema = Joi.object({
        regTknName: Joi
            .string()
            .required()
            .messages({"string.empty": t('required-field-error')})
            .custom((v: string, h) => {
                if(!regTknNameValidate(v))
                    return h.message({custom: t('title-invalid-format')})
                return v
            })
            .external(async (v: string, h) => {
                let ack = await socket!.emitWithAck("check_reg_tkn_name_unique", {reg_tkn_name: v})
                if(ack.status === SocketIoAckType.Err || (ack.status === SocketIoAckType.Ok && !ack.payload))
                    return h.message({external: t('modal-reg-tkn-name-not-unique')})
                return v
            }),
        maxRegs: Joi
            .string()
            .allow('')
            .optional()
            .custom((v: string, h) => {
                if(!maxRegsValidate(v))
                    return h.message({custom: t('max-regs-invalid-format')})
                return v
            })
    })

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors}
    } = useForm<FormFields>({resolver: joiResolver(formSchema)});

    function createRegTknClicked() {
        reset()
        setLimitEnable(false)
        setRegTknCreateModalOpen(true)
    }

    function createRegTkn(data: FormFields) {
        if(data.maxRegs === '' && limitEnable) {
            setShowMaxRegsEmptyError(true)
            return
        }
        setRegTknCreateModalOpen(false)
        let sendData: SendData = {reg_tkn_name: data.regTknName}
        if(data.maxRegs !== '')
            sendData.max_regs = parseInt(data.maxRegs)

        p.setLoading(true)
        socket!.emitWithAck("create_reg_tkn", sendData)
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err)
                    showPersistentErrorAlert(t('modal-reg-tkn-create-error'))

            })
            .catch(() => {
                showPersistentErrorAlert(t('modal-reg-tkn-create-error'))
            })
            .finally(() => p.setLoading(false))
    }

    function onLimitEnableChanged(e: ChangeEvent<HTMLInputElement>) {
        setLimitEnable(e.target.checked)
        setShowMaxRegsEmptyError(false)
    }

    return (
        <>
            <BtnSecondary
                onClick={createRegTknClicked}
            >{t('modal-reg-tkn-create-btn')}
            </BtnSecondary>
            <ModalWHeader
                title={t('modal-create-reg-tkn-title')}
                open={regTknCreateModalOpen}
                setOpen={setRegTknCreateModalOpen}
                content={
                    <form onSubmit={handleSubmit(createRegTkn)} noValidate>
                        <div className="flex flex-col">
                            <div className="flex justify-between">
                                <Label htmlFor="regTknName">{t('modal-reg-tkn-name-label')}</Label>
                                <Help
                                    tooltipId="regTknName-help"
                                    className="w-4"
                                    content={t('modal-reg-tkn-name-help')}
                                />
                            </div>
                            <Input
                                id="regTknName"
                                required
                                {...register('regTknName')}
                            />
                            {errors.regTknName
                                ? <p className="text-danger font-semibold">{errors.regTknName.message}</p>
                                : <p className="text-danger invisible font-semibold">L</p>}

                            <div className="flex items-center gap-x-1.5">
                                <div>
                                    <Input id="limitEnable" type="checkbox" className="hover:cursor-pointer" checked={limitEnable} onChange={onLimitEnableChanged}/>
                                </div>
                                <Label className="mt-1 hover:cursor-pointer" htmlFor="limitEnable">{t('modal-reg-tkn-limit-label')}</Label>
                            </div>

                            {limitEnable && <div>
                                <div className="flex justify-between mt-4">
                                    <Label htmlFor="maxRegs">{t('modal-reg-tkn-max-regs-label')}</Label>
                                    <Help
                                        tooltipId="maxRegs-help"
                                        className="w-4"
                                        content={t('modal-reg-tkn-max-regs-help')}
                                    />
                                </div>
                                <Input
                                    min={1}
                                    id="maxRegs"
                                    type="number"
                                    required={false}
                                    {...register('maxRegs')}
                                />
                                {errors.maxRegs
                                    ? <p className="text-danger font-semibold">{errors.maxRegs.message}</p>
                                    : <>{showMaxRegsEmptyError
                                        ? <p className="text-danger font-semibold">{t('required-field-error')}</p>
                                        : <p className="text-danger invisible font-semibold">L</p>}</>}
                            </div>}
                        </div>
                        <hr className="-ml-6 -mr-6 mt-4 mb-4"/>
                        <div className="flex gap-3">
                            <BtnPrimary type="submit">{t('modal-create-action-btn')}</BtnPrimary>
                            <BtnSecondary
                                onClick={() => setRegTknCreateModalOpen(false)}>{t('modal-cancel-btn')}</BtnSecondary>
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
    regTknName: string
    maxRegs: string
}

export interface SendData {
    reg_tkn_name: string,
    max_regs?: number
}