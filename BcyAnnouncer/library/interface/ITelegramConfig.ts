interface ITelegramConfig {
    name: string,
    key: string,
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