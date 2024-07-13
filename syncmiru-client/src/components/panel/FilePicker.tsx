import React, {Dispatch, MouseEvent, ReactElement, SetStateAction, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useMainContext} from "@hooks/useMainContext.ts";
import {FileInfoClient, FileInfoSrv, FileKind, FileType} from "@models/file.ts";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {SearchInput} from "@components/widgets/Input.tsx";
import {Btn, BtnPrimary, DeleteBtn, ParentFolderBtn} from "@components/widgets/Button.tsx";
import {TableColumn} from "react-data-table-component";
import DataTableThemeAware from "@components/widgets/DataTableThemeAware.tsx";
import {Language} from "@models/config.tsx";
import {useLanguage} from "@hooks/useLanguage.ts";
import Folder from "@components/svg/Folder.tsx";
import DateTimeLocalPretty from "@components/widgets/DateTimeLocalPretty.tsx";
import {bytesPretty} from "src/utils/pretty.ts";
import Loading from "@components/Loading.tsx";
import Plus from "@components/svg/Plus.tsx";
import Danger from "@components/svg/Danger.tsx";
import {arrayMove, List, OnChangeMeta, RenderListParams} from "react-movable";
import VideoFile from "@components/svg/VideoFile.tsx";
import SubFile from "@components/svg/SubFile.tsx";
import SelectLangAware from "@components/widgets/SelectLangAware.tsx";
import {MultiValue, SingleValue} from "react-select";

export default function FilePicker(p: Props): ReactElement {
    const {t} = useTranslation()
    const lang = useLanguage()
    const {
        source2url,
        socket
    } = useMainContext()
    const sources = [...source2url.keys()]
    const [selectedSource, setSelectedSource] = useState<SourceSelect | null>(null)
    const [files, setFiles] = useState<Array<FileInfoClient>>([])
    const [currentPath, setCurrentPath] = useState<string>('/')
    const [filesLoading, setFilesLoading] = useState<boolean>(true)
    const [filesError, setFilesError] = useState<boolean>(false)
    const [noSourceAvailable, setNoSourceAvailable] = useState<boolean>(false)
    const [search, setSearch] = useState<string>("")

    const columns: TableColumn<FileInfoClient>[] = [
        {
            id: 'name',
            width: '16rem',
            name: t('file-picker-file-name'),
            sortable: true,
            sortFunction: (a, b) => a.name.localeCompare(b.name),
            cell: row => {
                return (
                    <div
                        data-tag="allowRowEvents"
                        className="flex items-center gap-x-2">
                        {row.file_type === FileType.Directory
                            ? <Folder
                                className="min-w-6 w-6"
                                data-tag="allowRowEvents"
                            />
                            : p.fileKind === FileKind.Video
                                ? <VideoFile
                                    className="min-w-6 w-6"
                                    data-tag="allowRowEvents"
                                />
                                : <SubFile
                                    className="min-w-6 w-6"
                                    data-tag="allowRowEvents"
                                />
                        }
                        <p data-tag="allowRowEvents">{row.name}</p>
                    </div>
                )
            }
        },
        {
            name: t('file-picker-mtime'),
            sortable: true,
            sortFunction: (a, b) => a.mtime.getTime() - b.mtime.getTime(),
            cell: row => {
                return <DateTimeLocalPretty data-tag="allowRowEvents" datetime={row.mtime}/>
            }
        },
        {
            name: t('file-picker-size'),
            sortable: true,
            sortFunction: (a, b) => {
                if (a.size != null) {
                    if (b.size != null) {
                        return a.size - b.size
                    } else {
                        return -1
                    }
                } else {
                    if (b.size != null) {
                        return 1
                    } else {
                        return 0
                    }
                }
            },
            cell: row => {
                return (
                    <p data-tag="allowRowEvents">{row.size != null ? bytesPretty(row.size) : '-'}</p>
                )
            }
        },
        {
            name: "",
            cell: row => {
                if (row.file_type === FileType.File) {
                    if (p.filesPicked.includes(fullFilePath(row.name)))
                        return (
                            <div className="w-full flex justify-center">
                                <DeleteBtn
                                    className="w-8"
                                    onClick={() => deleteFromFilePicker(row)}
                                />
                            </div>
                        )
                    return (
                        <div className="w-full flex justify-center">
                            <Btn
                                className="p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                                onClick={() => addFileClicked(row)}
                            >
                                <Plus className="w-6"/>
                            </Btn>
                        </div>
                    )
                }
                return <></>
            }
        }
    ]

    useEffect(() => {
        if (sources.length > 0)
            setSelectedSource({label: sources[0], value: sources[0]} as SourceSelect)
    }, [source2url]);

    useEffect(() => {
        if (selectedSource == null) {
            setNoSourceAvailable(true)
            setFilesLoading(false)
            return
        }
        setFilesError(false)
        setNoSourceAvailable(false)
        fetchFiles()
    }, [selectedSource, currentPath]);

    function fetchFiles() {
        setFilesLoading(true)
        socket!.emitWithAck('get_files', {file_srv: selectedSource?.value, path: currentPath, file_kind: p.fileKind})
            .then((ack: SocketIoAck<Array<FileInfoSrv>>) => {
                if (ack.status === SocketIoAckType.Err) {
                    setFilesError(true)
                } else {
                    const payload = ack.payload as Array<FileInfoSrv>
                    const m: Array<FileInfoClient> = []
                    for (const file of payload) {
                        const {mtime, ...rest} = file
                        m.push({mtime: new Date(mtime), ...rest})
                    }
                    setFiles(m)
                    setFilesError(false)
                }

            })
            .catch(() => {
                setFilesError(true)
            })
            .finally(() => {
                setFilesLoading(false)
            })
    }

    function selectedSourceChanged(e: SingleValue<SourceSelect> | MultiValue<SourceSelect>) {
        setSelectedSource(e as SingleValue<SourceSelect>)
        setCurrentPath('/')
    }

    function fileClicked(row: FileInfoClient, e: MouseEvent<Element>) {
        if (row.file_type === FileType.Directory) {
            setCurrentPath((p) => {
                if (p.endsWith("/"))
                    return p + row.name
                return p + '/' + row.name
            })
        }
    }

    function parentFolderClicked() {
        setCurrentPath((p) => {
            const arr = p.split('/')
            arr.pop()
            const parentPath = arr.join('/')
            if (parentPath === '')
                return '/'
            return parentPath
        })
    }

    function reloadContent() {
        setFilesError(false)
        fetchFiles()
    }

    function addFileClicked(f: FileInfoClient) {
        p.setFilesPicked((p) => [...p, fullFilePath(f.name)])
    }

    function deleteFromFilePicker(f: FileInfoClient) {
        const fullPath = fullFilePath(f.name)
        p.setFilesPicked((p) => p.filter(x => x !== fullPath))
    }

    function deleteFromSummary(fullPath: string) {
        p.setFilesPicked((p) => p.filter(x => x !== fullPath))
    }

    function fullFilePath(fileName: string) {
        return selectedSource?.value + ':' + currentPath + '/' + fileName
    }

    function orderChanged(e: OnChangeMeta) {
        const newFilesPicked = arrayMove(p.filesPicked, e.oldIndex, e.newIndex)
        p.setFilesPicked(newFilesPicked)
    }

    return (
        <div className="flex flex-col gap-y-4">
            <div>
                <p className="mb-1">{t('file-picker-select-text')}</p>
                <SelectLangAware
                    getOptionLabel={(source: SourceSelect) => source.label}
                    getOptionValue={(source: SourceSelect) => source.value}
                    value={selectedSource}
                    classNamePrefix="my-react-select"
                    className={`w-full my-react-select-container`}
                    onChange={selectedSourceChanged}
                    options={sources.map(x => {
                        return {label: x, value: x} as SourceSelect
                    })}
                    isDisabled={filesLoading}
                />
            </div>
            <div className="flex flex-col h-[40dvh]">
                {noSourceAvailable
                    ? <div className="flex flex-col self-center justify-center items-center h-full gap-y-4">
                        <p>{t('file-picker-no-source-available')}</p>
                        <Danger className="w-20"/>
                    </div>
                    : <>
                        {filesError
                            ? <div className="flex flex-col self-center justify-center items-center h-full gap-y-4">
                                <p>{t('file-picker-error')}</p>
                                <Danger className="w-20"/>
                                <BtnPrimary onClick={reloadContent}>{t('file-picker-reload-btn')}</BtnPrimary>
                            </div>
                            : <>
                                <div className="flex items-center gap-x-2">
                                    <p className="text-sm font-semibold ml-2 w-[23.2rem] max-h-10 break-words">{selectedSource != null ? `${selectedSource.value}:${currentPath}` : ''}</p>
                                    <div className="flex-1"></div>
                                    <ParentFolderBtn
                                        className="min-w-8 w-8"
                                        onClick={parentFolderClicked}
                                        disabled={filesLoading}
                                    />
                                    <SearchInput
                                        className="w-40 min-w-40"
                                        value={search}
                                        setValue={setSearch}
                                        disabled={filesLoading}
                                    />
                                </div>
                                {filesLoading
                                    ? <div className="flex justify-center items-center h-full">
                                        <Loading/>
                                    </div>
                                    : <div className="overflow-y-auto h-max">
                                        <DataTableThemeAware
                                            noDataComponent={
                                                <div className="p-6">
                                                    {t('datatable-no-files')}
                                                </div>
                                            }
                                            onRowClicked={fileClicked}
                                            highlightOnHover={true}
                                            pointerOnHover={true}
                                            defaultSortFieldId="name"
                                            columns={columns}
                                            data={
                                                files.filter(item => {
                                                    const s = search.toLowerCase()
                                                    let mtimePretty = item.mtime.toLocaleString("en-US")
                                                    if (lang === Language.Czech)
                                                        mtimePretty = item.mtime.toLocaleString("cs-CZ")

                                                    if (mtimePretty.includes(s))
                                                        return item
                                                    if (item.name.toLowerCase().includes(s))
                                                        return item
                                                    if (item?.size?.toString().includes(s))
                                                        return item

                                                })
                                            }
                                        />
                                    </div>
                                }
                            </>
                        }
                    </>
                }
            </div>
            <hr/>
            <div className="flex flex-col max-h-[30dvh]">
                <p>{t('file-picker-summary')}</p>
                {p.filesPicked.length === 0
                    ? <p className="self-center p-1 mt-2 text-sm font-semibold">{t('file-picker-nothing-added')}</p>
                    : <List
                        onChange={orderChanged}
                        values={p.filesPicked}
                        renderList={({children, props}: RenderListParams) => {
                            return (
                                <ul
                                    {...props}
                                    className="border-l flex-1 overflow-auto p-1"
                                >{children}</ul>
                            )
                        }}
                        renderItem={({value: filePath, props}) => {
                            const {key, ...restProps} = props
                            return (
                                <li
                                    key={key}
                                    {...restProps}
                                    style={{
                                        ...props.style,
                                        listStyleType: 'none'
                                    }}
                                >
                                    <div
                                        className="flex items-center gap-x-2 mb-0.5 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 hover:cursor-pointer rounded">
                                        {p.fileKind === FileKind.Video
                                            ? <VideoFile className="min-w-6 w-6"/>
                                            : <SubFile className="min-w-6 w-6"/>
                                        }
                                        <p className="text-xs">{filePath}</p>
                                        <div className="flex-1"></div>
                                        <DeleteBtn
                                            className="min-w-8 w-8"
                                            onClick={() => deleteFromSummary(filePath)}
                                        />
                                    </div>
                                </li>
                            )
                        }}
                    />
                }
            </div>
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