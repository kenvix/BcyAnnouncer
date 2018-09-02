import Telegraf, {ContextMessageUpdate} from "telegraf";
import * as fs from "fs";
import "./TelegramUploadMode";
import CommonAnnouncer from "./CommonAnnouncer";

export default class TelegramAnnouncer extends CommonAnnouncer {
    cfg: ITelegramConfig;
    bot: Telegraf<ContextMessageUpdate>;
    agent: any = null;
    sleep: number;

    constructor(cfg: ITelegramConfig) {
        super();
        this.cfg = cfg;
        this.sleep = cfg.sleep;
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
    }

    public async start() {
        await this.startProcessTask();
        this.bot.startPolling();
    }

    public async send(object: ISiteTask) {
        switch (this.cfg.mode) {
            case TelegramAnnouncerUploadMode.Upload:
                await this.bot.telegram.sendPhoto(this.cfg.chatid, {
                    source: fs.createReadStream(object.fullpath)
                });
                break;
            case TelegramAnnouncerUploadMode.URL:
                await this.bot.telegram.sendPhoto(this.cfg.chatid, object.url);
                break;
            default:
                break;
        }
        if(this.cfg.sendtext)
            await this.bot.telegram.sendMessage(this.cfg.chatid, await this.compileTemplate(object));
    }
}

export enum TelegramAnnouncerUploadMode {
    Upload = "upload",
    URL = "url",
    None = "none"
}