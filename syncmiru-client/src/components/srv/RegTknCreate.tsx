import {ChangeEvent, ReactElement, useState} from "react";
import {BtnPrimary, BtnSecondary} from "@components/widgets/Button.tsx";
import Label from "@components/widgets/Label.tsx";
import Help from "@components/widgets/Help.tsx";
import {Input} from "@components/widgets/Input.tsx";
import {ModalWHeader} from "@components/widgets/Modal.tsx";
import Joi from "joi";
import {useForm} from "react-hook-form";
import {joiResolver} from "@hookform/resolvers/joi";
import {useRegTknNameSchema} from "@hooks/fieldSchema.ts";
import {useTranslation} from "react-i18next";
import {maxRegsValidate} from "src/form/validators.ts";

export default function RegTknCreate(): ReactElement {
    const [regTknCreateModalOpen, setRegTknCreateModalOpen] = useState<boolean>(false);
    const [limitEnable, setLimitEnable] = useState<boolean>(false);
    const [showMaxRegsEmptyError, setShowMaxRegsEmptyError] = useState<boolean>(false);
    const {t} = useTranslation()
    const formSchema = Joi.object({
        regTknName: useRegTknNameSchema(t),
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
        setRegTknCreateModalOpen(true)
    }

    function createRegTkn(data: FormFields) {
        if(data.maxRegs === '' && limitEnable) {
            setShowMaxRegsEmptyError(true)
            return
        }
        console.log(JSON.stringify(data))
    }

    function onLimitEnableChanged(e: ChangeEvent<HTMLInputElement>) {
        setLimitEnable(e.target.checked)
        setShowMaxRegsEmptyError(false)
    }

    return (
        <>
            <BtnSecondary
                onClick={createRegTknClicked}
            >Vytvořit token
            </BtnSecondary>
            <ModalWHeader
                title="Nový registrační token"
                open={regTknCreateModalOpen}
                setOpen={setRegTknCreateModalOpen}
                content={
                    <form onSubmit={handleSubmit(createRegTkn)} noValidate>
                        <div className="flex flex-col">
                            <div className="flex justify-between">
                                <Label htmlFor="regTknName">Název</Label>
                                <Help
                                    tooltipId="regTknName-help"
                                    className="w-4"
                                    content="TODO"
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
                                    <Input id="limitEnable" type="checkbox" checked={limitEnable} onChange={onLimitEnableChanged}/>
                                </div>
                                <Label className="mt-1" htmlFor="limitEnable">Omezení počtu registrací</Label>
                            </div>

                            {limitEnable && <div>
                                <div className="flex justify-between mt-4">
                                    <Label htmlFor="maxRegs">Maximální počet registrací</Label>
                                    <Help
                                        tooltipId="maxRegs-help"
                                        className="w-4"
                                        content="TODO"
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

interface FormFields {
    regTknName: string
    maxRegs: string
}