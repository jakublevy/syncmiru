export function bytesPretty(b: number): string {
    const kb = 1024
    const mb = kb * 1024
    const gb = mb * 1024
    const tb = gb * 1024

    if(b < kb)
        return `${b} B`
    if(b < mb) {
        const r = Math.round(b / 1024)
        return `${r} kB`
    }
    if(b < gb) {
        const r = Math.round(b / 1024 / 1024 * 10) / 10
        return `${r} MB`
    }
    if(b < tb) {
        const r = Math.round(b / 1024 / 1024 / 1024 * 10) / 10
        return `${r} GB`
    }
    const r = Math.round(b / 1024 / 1024 / 1024 / 1024 * 10) / 10
    return `${r} TB`
}