import {ReactElement, ReactNode, useEffect} from 'react'
import {Dialog} from '@headlessui/react'
import {BtnDanger, BtnSecondary, CloseBtn} from "@components/widgets/Button.tsx";
import {useTranslation} from "react-i18next";
import {useMainContext} from "@hooks/useMainContext.ts";

export function Modal(p: ModalProps): ReactElement {
    const {reconnecting, setModalShown} = useMainContext()

    useEffect(() => {
        setModalShown(p.open)
    }, [p.open]);

    return (
        <Dialog
            open={p.open && !reconnecting}
            onClose={() => p.setOpen(false)}
        >
            <div className="fixed inset-0 bg-black/50" aria-hidden="true"/>

            <div className="fixed flex inset-0 w-screen items-center overflow-y-auto p-4">
                <div className="m-auto">
                    <Dialog.Panel
                        className="mx-auto max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-darkbg dark:border-gray-700 p-6 min-w-[40rem]">
                        {p.content}
                    </Dialog.Panel>
                </div>
            </div>
        </Dialog>
    )
}

interface ModalProps {
    open: boolean,
    setOpen: (open: boolean) => void
    content: ReactNode
}

export function ModalWHeader(p: ModalWHeaderProps): ReactElement {
    const {title, content, ...restParams} = p

    return (
        <Modal
            {...restParams}
            content={
                <>
                    <div className="flex items-center">
                        <Dialog.Title className="text-3xl">{p.title}</Dialog.Title>
                        <div className="flex-1"></div>
                        <CloseBtn onClick={() => p.setOpen(false)}></CloseBtn>
                    </div>
                    <hr className="-ml-6 -mr-6 mt-4 mb-4"/>
                    {content}
                </>
            }/>
    )
}

interface ModalWHeaderProps extends ModalProps {
    title: string
}

export function ModalDelete(p: ModalDeleteProps
):
    ReactElement {
    const {t} = useTranslation()
    const {content, onDeleteConfirmed, open, setOpen, ...restParams} = p
    return (
        <ModalWHeader
            open={open}
            setOpen={setOpen}
            title={t('modal-delete-title')}
            {...restParams}
            content={
                <>
                    {content}
                    <hr className="-ml-6 -mr-6 mt-4 mb-4"/>
                    <div className="flex gap-3">
                        <BtnDanger onClick={() => {
                            setOpen(false);
                            onDeleteConfirmed()
                        }}>{t('modal-delete-delete-btn')}</BtnDanger>
                        <BtnSecondary onClick={() => setOpen(false)}>{t('modal-keep-btn')}</BtnSecondary>
                    </div>
                </>

            }
        />
    )
}

interface ModalDeleteProps extends Omit<ModalWHeaderProps, "title"> {
    onDeleteConfirmed: () => void
}