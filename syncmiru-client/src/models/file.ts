interface FileInfoCommon {
    name: string,
    file_type: FileType
    size?: number
}

export interface FileInfoClient extends FileInfoCommon {
    mtime: Date
}

export interface FileInfoSrv extends FileInfoCommon {
    mtime: string
}

export enum FileType {
    File = 0,
    Directory = 1
}

export enum FileKind {
    Video = 0
}