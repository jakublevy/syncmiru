import {BtnPrimary, BtnSecondary, Clickable, EditBtn, ZoomResetBtn} from "@components/widgets/Button.tsx";
import React, {ChangeEvent, ReactElement, useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {ModalWHeader} from "@components/widgets/Modal.tsx";
import Upload from "@components/svg/Upload.tsx";
import Delete from "@components/svg/Delete.tsx";
import ExifReader from 'exifreader';
import {showPersistentErrorAlert, showTemporalErrorAlertForModal} from "src/utils/alert.ts";
import Pic from "@components/svg/Pic.tsx";
import Slider from "rc-slider";
import 'rc-slider/assets/index.css';
import AvatarEditor from 'react-avatar-editor'
import {useMainContext} from "@hooks/useMainContext.ts";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import Avatar from "@components/widgets/Avatar.tsx";

export default function AvatarSettings(p: Props): ReactElement {
    const {uid, users, socket} = useMainContext()
    const [avatar, setAvatar] = useState<string>('')
    const {t} = useTranslation()
    const [avatarActionModalOpen, setAvatarActionModalOpen] = useState<boolean>(false)
    const [picEditorModalOpen, setPicEditorModalOpen] = useState<boolean>(false)
    const avatarFileRef = useRef<HTMLInputElement>(null)
    const [avatarFile, setAvatarFile] = useState<File | string>('')
    const [avatarEditorScale, setAvatarEditorScale] = useState<number>(1.0)
    const avatarEditorRef = useRef<AvatarEditor>(null)

    useEffect(() => {
        const user = users.get(uid)
        if(user !== undefined)
            setAvatar(user.avatar)

        p.setLoading(false)
    }, [users]);

    function editClicked() {
        setAvatarActionModalOpen(true)
    }

    function deleteAvatarClicked() {
        p.setLoading(true)
        socket!.emitWithAck('delete_avatar')
            .catch(() => {
                showPersistentErrorAlert(t('modal-avatar-delete-error'))
            })
            .finally(() => {
                p.setLoading(false)
                setAvatarActionModalOpen(false)
            })
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
        if(picBuffer.byteLength > 5*1024*1024) {
            showTemporalErrorAlertForModal(t('modal-avatar-max-size-error'))
            return;
        }

        const tags = await ExifReader.load(picBuffer);
        if (
            tags["Image Height"]?.value == undefined
            || tags["Image Height"]?.value < 128
            || tags["Image Width"]?.value == undefined
            || tags["Image Width"]?.value < 128
        ) {
            showTemporalErrorAlertForModal(t('modal-avatar-res-error'))
            return;
        }

        setAvatarFile(picFile)
        setAvatarActionModalOpen(false)
        setPicEditorModalOpen(true)
    }

    async function setAvatarClicked() {
        const canvas: HTMLCanvasElement = scaleTo128(avatarEditorRef.current!.getImageScaledToCanvas())
        const blob = await getCanvasBlob(canvas) as Blob
        const imgBin = Array.from(new Uint8Array(await blob.arrayBuffer()))

        setPicEditorModalOpen(false)
        p.setLoading(true)
        socket!.emitWithAck("set_avatar", {data: imgBin})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err) {
                    showPersistentErrorAlert(t('modal-avatar-change-error'))
                }
            })
            .catch(() => {
                showPersistentErrorAlert(t('modal-avatar-change-error'))
            })
            .finally(() => {
                p.setLoading(false)
            })
    }

    function scaleTo128(canvas: HTMLCanvasElement): HTMLCanvasElement {
        const canvas128 = document.createElement('canvas');
        canvas128.width = 128;
        canvas128.height = 128;
        const ctx = canvas128.getContext('2d') as CanvasRenderingContext2D;
        ctx.drawImage(canvas, 0, 0, 128, 128);
        return canvas128
    }

    function getCanvasBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
        return new Promise(function(resolve, reject) {
            canvas.toBlob(function(blob) {
                resolve(blob)
            })
        })
    }

    return (
        <>
            <div className="flex items-center">
                <p className="w-56">{t('user-settings-account-avatar-label')}</p>
                <Avatar className="w-14" picBase64={avatar}/>
                <div className="flex-1"></div>
                <EditBtn className="w-10" onClick={editClicked}/>
            </div>
            <ModalWHeader
                title={t('modal-avatar-action-title')}
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
                                <p className="mt-2">{t('modal-avatar-change-btn')}</p>
                            </div>
                        </Clickable>
                        <div className="w-4"></div>
                        <Clickable className="w-44 h-32 border" onClick={deleteAvatarClicked}>
                            <div className="flex flex-col items-center">
                                <Delete className="w-8"/>
                                <p className="mt-2">{t('modal-avatar-delete-btn')}</p>
                            </div>
                        </Clickable>
                    </div>
                }
            />
            <ModalWHeader
                title={t('modal-avatar-edit-title')}
                open={picEditorModalOpen}
                setOpen={setPicEditorModalOpen}
                content={
                    <>
                        <div className="flex flex-col items-center justify-center gap-y-4">
                            <AvatarEditor
                                ref={avatarEditorRef}
                                image={avatarFile}
                                width={256}
                                height={256}
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
                                        value={avatarEditorScale}
                                        onChange={(v) => setAvatarEditorScale(v as number)}
                                    />
                                    <Pic className="w-8"/>
                                    <ZoomResetBtn
                                        className="w-10 absolute right-0 -mr-24"
                                        onClick={() => setAvatarEditorScale(1.0)}
                                    />
                                </div>
                            </div>
                        </div>
                        <hr className="-ml-6 -mr-6 mt-4 mb-4"/>
                        <div className="flex gap-3">
                            <BtnPrimary
                                onClick={setAvatarClicked}
                            >{t('modal-change-action-btn')}</BtnPrimary>
                            <BtnSecondary
                                onClick={() => setPicEditorModalOpen(false)}>{t('modal-keep-btn')}</BtnSecondary>
                        </div>
                    </>
                }
            />
        </>
    )
}

interface Props {
    setLoading: (b: boolean) => void
}