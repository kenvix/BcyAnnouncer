interface IXDownloaderStats {
    time: {
        start: number,
        end: number
    },
    total: {
        size: number,
        downloaded: number,
        completed: number
    },
    past: {
        downloaded: number
    },
    present: {
        downloaded: number,
        time: number,
        speed: number
    },
    future: {
        remaining: number,
        eta: number
    },
    threadStatus: {
        idle: number,
        open: number,
        closed: number,
        failed: number
    }
}