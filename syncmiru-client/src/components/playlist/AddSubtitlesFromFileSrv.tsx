import React, {ReactElement, useState} from "react";
import {useTranslation} from "react-i18next";
import {ModalWHeader} from "@components/widgets/Modal.tsx";
import FilePicker from "@components/panel/FilePicker.tsx";
import {BtnPrimary} from "@components/widgets/Button.tsx";
import {FileKind} from "@models/file.ts";
import {useMainContext} from "@hooks/useMainContext.ts";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import {PlaylistEntryId} from "@models/playlist.ts";

export default function AddSubtitlesFromFileSrv(p: Props): ReactElement {
    const {t} = useTranslation()
    const {
        socket,
        setPlaylistLoading
    } = useMainContext()
    const [filesPicked, setFilesPicked] = useState<Array<string>>(new Array<string>())

    function addToPlaylistClicked() {
        p.setShowModal(false)
        setPlaylistLoading(true)
        socket!.emitWithAck("add_subtitles_files", {video_id: p.videoId, subs_full_paths: filesPicked})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err) {
                    showPersistentErrorAlert(t('playlist-modify-error'))
                }
            })
            .catch(() => {
                showPersistentErrorAlert(t('playlist-modify-error'))
            })
            .finally(() => {
                setPlaylistLoading(false)
            })
    }

    return (
        <ModalWHeader
            title={t('modal-add-subtitles-to-playlist-from-file-srv-title')}
            open={p.showModal}
            setOpen={p.setShowModal}
            content={
                <div className="flex flex-col">
                    <FilePicker
                        filesPicked={filesPicked}
                        setFilesPicked={setFilesPicked}
                        fileKind={FileKind.Subtitles}
                    />
                    <BtnPrimary
                        className="mt-4"
                        disabled={filesPicked.length === 0}
                        onClick={addToPlaylistClicked}
                    >{t('add-to-playlist-btn')}</BtnPrimary>
                </div>
            }
        />
    )
}

interface Props {
    videoId: PlaylistEntryId
    showModal: boolean,
    setShowModal: (open: boolean) => void
}