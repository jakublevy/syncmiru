import {Dispatch, ReactElement, SetStateAction, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useMainContext} from "@hooks/useMainContext.ts";
import Select, {SingleValue} from "react-select";
import {FileInfoClient, FileInfoSrv, FileKind} from "@models/file.ts";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {SearchInput} from "@components/widgets/Input.tsx";
import {ParentFolderBtn} from "@components/widgets/Button.tsx";

export default function FilePicker(p: Props): ReactElement {
    const {t} = useTranslation()
    const {
        sources,
        socket
    } = useMainContext()
    const [selectedSource, setSelectedSource] = useState<SourceSelect | null>(null)
    const [files, setFiles] = useState<Array<FileInfoClient>>([])
    const [currentPath, setCurrentPath] = useState<string>('/')
    const [filesLoading, setFilesLoading] = useState<boolean>(true)
    const [filesError, setFilesError] = useState<boolean>(false)
    const [search, setSearch] = useState<string>("")

    useEffect(() => {
        if (sources.length >= 0)
            setSelectedSource({label: sources[0], value: sources[0]} as SourceSelect)
    }, [sources]);

    useEffect(() => {
        if(selectedSource == null)
            return

        fetchFiles()
    }, [selectedSource, currentPath]);

    function fetchFiles() {
        setFilesLoading(true)
        socket!.emitWithAck('get_files', {file_srv: selectedSource?.value, path: currentPath, file_kind: p.fileKind})
            .then((ack: SocketIoAck<Array<FileInfoSrv>>) => {
                if(ack.status === SocketIoAckType.Err) {
                    setFilesError(true)
                }
                else {
                    const payload = ack.payload as Array<FileInfoSrv>
                    const m: Array<FileInfoClient> = []
                    for(const file of payload) {
                        const {mtime, ...rest} = file
                        m.push({mtime: new Date(mtime), ...rest})
                    }
                    console.log(m)
                }

            })
            .catch(() => {
                setFilesError(true)
            })
            .finally(() => {
                setFilesLoading(false)
            })
    }

    function selectedSourceChanged(e: SingleValue<SourceSelect>) {
        setSelectedSource(e)
        setCurrentPath('/')
    }

    return (
        <div className="flex flex-col gap-y-4">
            <div>
                <p className="mb-1">{t('file-picker-select-text')}</p>
                <Select
                    getOptionLabel={(source: SourceSelect) => source.label}
                    getOptionValue={(source: SourceSelect) => source.value}
                    value={selectedSource}
                    classNamePrefix="my-react-select"
                    className={`w-full my-react-select-container`}
                    onChange={selectedSourceChanged}
                    options={sources.map(x => {
                        return {label: x, value: x} as SourceSelect
                    })}
                />
            </div>
            <div className="h-[40dvh] border">
                <div className="flex flex-col">
                    <div className="flex items-center gap-x-2">
                        <p className="text-sm w-[23.2rem] max-h-10 break-words">{selectedSource != null ? `${selectedSource.value}:${currentPath}` : ''}</p>
                        <div className="flex-1"></div>
                        <ParentFolderBtn className="min-w-8 w-8"/>
                        <SearchInput className="w-40 min-w-40" value={search} setValue={setSearch}/>
                    </div>
                </div>
            </div>
            <div className="h-[30dvh] border"></div>
        </div>
    )
}

interface Props {
    filesPicked: Array<string>,
    setFilesPicked: Dispatch<SetStateAction<Array<string>>>,
    fileKind: FileKind
}

interface SourceSelect {
    label: string,
    value: string
}