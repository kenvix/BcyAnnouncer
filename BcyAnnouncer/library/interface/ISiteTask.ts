interface ISiteTask extends ISiteTaskChild {
    detailUrl: string,
    author?: string,
    tags?: string[],
    description?: string,
    status: SiteTaskStatus,
    fail: number,
    child: Array<ISiteTaskChild>
}

enum SiteTaskStatus {
    Pending,
    Downloading,
    Failed,
    Abandoned
}