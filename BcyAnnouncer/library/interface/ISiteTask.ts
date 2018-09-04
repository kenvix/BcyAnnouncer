interface ISiteTask {
    detailUrl: string,
    author?: string,
    id: string,
    tags?: string[],
    description?: string,
    status: any,
    fail: number,
    img: Array<ISiteTaskImg>
}