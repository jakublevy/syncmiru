import React, {ReactElement, useState} from "react";
import Server from "@components/svg/Server.tsx";
import {MenuItem} from "@szhsin/react-menu";
import {useTranslation} from "react-i18next";
import {ModalWHeader} from "@components/widgets/Modal.tsx";
import FilePicker from "@components/panel/FilePicker.tsx";
import {BtnPrimary} from "@components/widgets/Button.tsx";
import {FileKind} from "@models/file.ts";
import {useMainContext} from "@hooks/useMainContext.ts";

export default function AddFromFileSrv(): ReactElement {
    const {t} = useTranslation()
    const {
        socket,
        setPlaylistLoading
    } = useMainContext()
    const [showModal, setShowModal] = useState<boolean>(false);
    const [filesPicked, setFilesPicked] = useState<Array<string>>(new Array<string>())

    function addClicked() {
        setFilesPicked([])
        setShowModal(true);
    }

    function addToPlaylistClicked() {
        setPlaylistLoading(true)
        socket!.emitWithAck("add_video_files", {full_paths: filesPicked})
            .then(() => {
                
            })
            .catch(() => {

            })
            .finally(() => {
                setPlaylistLoading(false)
            })
    }

    return (
        <>
            <MenuItem
                className="w-[13rem]"
                onClick={addClicked}
            >
                <div className="flex gap-x-3">
                    <Server className="h-6 w-6"/>
                    <p>{t('add-to-playlist-file-server')}</p>
                </div>
            </MenuItem>
            <ModalWHeader
                title={t('modal-add-to-playlist-from-file-srv-title')}
                open={showModal}
                setOpen={setShowModal}
                content={
                    <div className="flex flex-col">
                        <FilePicker
                            filesPicked={filesPicked}
                            setFilesPicked={setFilesPicked}
                            fileKind={FileKind.Video}
                        />
                        <BtnPrimary
                            className="mt-4"
                            disabled={filesPicked.length === 0}
                            onClick={addToPlaylistClicked}
                        >{t('add-to-playlist-btn')}</BtnPrimary>
                    </div>
                }
            />
        </>
    )
}