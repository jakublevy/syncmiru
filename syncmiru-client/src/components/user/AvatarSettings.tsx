import DefaultAvatar from "@components/svg/DefaultAvatar.tsx";
import {BtnPrimary, BtnSecondary, Clickable, EditBtn} from "@components/widgets/Button.tsx";
import React, {ChangeEvent, ReactElement, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {ModalWHeader} from "@components/widgets/Modal.tsx";
import Upload from "@components/svg/Upload.tsx";
import Delete from "@components/svg/Delete.tsx";
import ExifReader from 'exifreader';
import {showTemporalErrorAlertForModal} from "src/utils/alert.ts";
import Pic from "@components/svg/Pic.tsx";
import Slider from "rc-slider";
import 'rc-slider/assets/index.css';
import AvatarEditor from 'react-avatar-editor'
import ZoomReset from "@components/svg/ZoomReset.tsx";

export default function AvatarSettings(): ReactElement {
    const {t} = useTranslation()
    const [avatarActionModalOpen, setAvatarActionModalOpen] = useState<boolean>(false)
    const [picEditorModalOpen, setPicEditorModalOpen] = useState<boolean>(false)
    const avatarFileRef = useRef<HTMLInputElement>(null)
    const [avatarFile, setAvatarFile] = useState<File>()
    const [avatarEditorScale, setAvatarEditorScale] = useState<number>(1.0)

    function editClicked() {
        setAvatarActionModalOpen(true)
        console.log("TODO")
    }

    function deleteAvatarClicked() {
        // TODO: delete avatar
    }

    function uploadNewAvatarClicked() {
        if (avatarFileRef.current == null)
            return;

        avatarFileRef.current.value = ''
        avatarFileRef.current.click()
    }

    function reset() {
        setAvatarEditorScale(1.0)
    }

    async function avatarFileChanged(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files == null || e.target.files.length === 0)
            return;

        reset()
        const picFile = e.target.files[0]
        const picBuffer = await picFile.arrayBuffer()
        const tags = await ExifReader.load(picBuffer);
        if (
            tags["Image Height"]?.value == undefined
            || tags["Image Height"]?.value < 128
            || tags["Image Width"]?.value == undefined
            || tags["Image Width"]?.value < 128
        ) {
            showTemporalErrorAlertForModal("Avatar musí mít rozměry alespoň 128x128 pixelů")
            return;
        }
        setAvatarFile(picFile)
        setAvatarActionModalOpen(false)
        setPicEditorModalOpen(true)
    }

    return (
        <>
            <div className="flex items-center">
                <p className="w-56">{t('user-settings-account-avatar-label')}</p>
                <DefaultAvatar className="w-14"/>
                <div className="flex-1"></div>
                <EditBtn className="w-10" onClick={editClicked}/>
            </div>
            <ModalWHeader
                title="Změna avatara"
                open={avatarActionModalOpen}
                setOpen={setAvatarActionModalOpen}
                content={
                    <div className="flex justify-center">
                        <Clickable className="w-44 h-32 border" onClick={uploadNewAvatarClicked}>
                            <div className="flex flex-col items-center">
                                <input
                                    ref={avatarFileRef}
                                    type="file"
                                    className="hidden"
                                    accept=".jpg,.jpeg,.png"
                                    onChange={avatarFileChanged}
                                />
                                <Upload className="w-8"/>
                                <p className="mt-2">Nahrát nový z PC</p>
                            </div>
                        </Clickable>
                        <div className="w-4"></div>
                        <Clickable className="w-44 h-32 border" onClick={deleteAvatarClicked}>
                            <div className="flex flex-col items-center">
                                <Delete className="w-8"/>
                                <p className="mt-2">Odstranit</p>
                            </div>
                        </Clickable>
                    </div>
                }
            />
            <ModalWHeader
                title="Úprava obrázku"
                open={picEditorModalOpen}
                setOpen={setPicEditorModalOpen}
                content={
                    <>
                        <div className="flex flex-col items-center justify-center gap-y-4">
                            <AvatarEditor
                                image={avatarFile}
                                width={250}
                                height={250}
                                border={50}
                                borderRadius={9999}
                                color={[0, 0, 0, 0.8]}
                                scale={avatarEditorScale}
                                rotate={0}
                            />
                            <div className="relative">
                                <div className="flex items-center gap-x-4 w-96">
                                    <Pic className="w-4"/>
                                    <Slider
                                        min={0.5}
                                        max={5}
                                        step={0.001}
                                        defaultValue={1.0}
                                        onChange={(v) => setAvatarEditorScale(v as number)}
                                    />
                                    <Pic className="w-8"/>
                                    <BtnSecondary className="w-12 absolute right-0 -mr-24">
                                        <ZoomReset className="w-full"/>
                                    </BtnSecondary>
                                </div>
                            </div>
                        </div>
                        <hr className="-ml-6 -mr-6 mt-4 mb-4"/>
                        <div className="flex gap-3">
                            <BtnPrimary type="submit">{t('modal-change-action-btn')}</BtnPrimary>
                            <BtnSecondary
                                onClick={() => setPicEditorModalOpen(false)}>{t('modal-no-action-btn')}</BtnSecondary>
                        </div>
                    </>
                }
            />
        </>
    )
}