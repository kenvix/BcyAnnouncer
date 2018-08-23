import Telegraf, { ContextMessageUpdate, Telegram } from "telegraf";

export default class announcer {
    cfg: ITelegramConfig;
    bot: Telegraf<ContextMessageUpdate>;
    tg: Telegram;
    agent: any = null;

    constructor(cfg: ITelegramConfig) {
        this.cfg = cfg;
        switch (cfg.proxy.type) {
            case "socks5":
                let SocksAgent = require('socks5-https-client/lib/Agent');
                this.agent = new SocksAgent({
                    socksHost: cfg.proxy.socks5.host,
                    socksPort: cfg.proxy.socks5.port,
                    socksUsername: cfg.proxy.socks5.user,
                    socksPassword: cfg.proxy.socks5.password,
                });
                break;

            case "https":
                const HttpsProxyAgent = require('https-proxy-agent')
                this.agent = new HttpsProxyAgent(cfg.proxy.https.url);
                break;
        }
        this.bot = new Telegraf(cfg.key, {
            username: cfg.name,
            telegram: {           // Telegram options
                agent: this.agent // https.Agent instance, allows custom proxy, certificate, keep alive, etc.
            }
        });
        this.tg = new Telegram(cfg.key, {
            agent: this.agent
        });
    }

    start() {
        this.bot.startPolling();
    }
}