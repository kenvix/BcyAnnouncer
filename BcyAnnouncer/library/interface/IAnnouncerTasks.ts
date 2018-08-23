interface IAnnouncerTasks {
    [index: string]: IAnnouncerTask
}

interface IAnnouncerTask {
    url: string,
    filename: string
}