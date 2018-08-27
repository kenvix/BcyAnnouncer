interface ISiteConfig {
    url: string;
    extname: string;
    userAgent: string;
    sleep: {
        download: number;
        check: number;
    };
    storage: {
        dir: string;
        maxnum: number;
        index: string;
    };
}
