import {ReactElement, ReactNode} from 'react'
import { Dialog } from '@headlessui/react'
import {BtnDanger, BtnSecondary, CloseBtn} from "@components/widgets/Button.tsx";
import {useTranslation} from "react-i18next";

export default function DeleteDialog({open, setOpen, content, onDeleteConfirmed}: Props): ReactElement {
    const {t} = useTranslation()

    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            className="relative z-50"
        >
            {/* The backdrop, rendered as a fixed sibling to the panel container */}
            <div className="fixed inset-0 bg-black/50" aria-hidden="true"/>

            {/* Full-screen container to center the panel */}
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                {/* The actual dialog panel  */}
                <Dialog.Panel
                    className="mx-auto max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-darkbg dark:border-gray-700 p-6 min-w-[40rem]">
                    <div className="flex items-center">
                        <Dialog.Title className="text-3xl">{t('modal-delete-title')}</Dialog.Title>
                        <div className="flex-1"></div>
                        <CloseBtn onClick={() => setOpen(false)}></CloseBtn>
                    </div>
                    <hr className="-ml-6 -mr-6 mt-4 mb-4"/>
                    {content}
                    <hr className="-ml-6 -mr-6 mt-4 mb-4"/>
                    <div className="flex gap-3">
                        <BtnDanger onClick={() => {setOpen(false); onDeleteConfirmed()}}>{t('modal-delete-delete-btn')}</BtnDanger>
                        <BtnSecondary onClick={() => setOpen(false)}>{t('modal-no-action-btn')}</BtnSecondary>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}

interface Props {
    open: boolean,
    setOpen: (open: boolean) => void
    content: ReactNode
    onDeleteConfirmed: () => void
}