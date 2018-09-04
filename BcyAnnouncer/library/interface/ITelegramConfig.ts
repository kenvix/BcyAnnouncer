interface ITelegramConfig extends ICommonAnnouncerConfig {
    name: string,
    key: string,
    chatid: string,
    mode: string,
    ascaption: boolean,
    sendtext: boolean,
    proxy: {
        type: string,
        socks5?: {
            host: string,
            port: number,
            user?: string,
            password?: string
        },
        https?: {
            url: string
        }
    }
}