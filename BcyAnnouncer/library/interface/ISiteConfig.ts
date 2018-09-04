interface ISiteConfig {
    url: string,
    extname: string,
    userAgent: string,
    maxfails: number,
    sleep: {
        download: number,
        check: number
    },
    storage: {
        dir: string,
        maxnum: number,
        index: string
    }
}