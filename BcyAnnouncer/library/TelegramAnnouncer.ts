import Telegraf, {ContextMessageUpdate} from "telegraf";
import * as fs from "fs";
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
        let message;
        if(this.cfg.sendtext)
            message = await this.compileTemplate(object);
        let caption = (this.cfg.sendtext && this.cfg.ascaption) ? message.substring(0, 200) : '';
        for (let value of object.img)  {
            switch (this.cfg.mode) {
                case TelegramAnnouncerUploadMode.Upload:
                    await this.bot.telegram.sendPhoto(this.cfg.chatid, {
                        source: fs.createReadStream(value.fullpath)
                    }, {
                        caption: caption
                    });
                    break;
                case TelegramAnnouncerUploadMode.File:
                    await this.bot.telegram.sendDocument(this.cfg.chatid, {
                        source: fs.createReadStream(value.fullpath)
                    }, {
                        caption: caption
                    });
                    break;
                case TelegramAnnouncerUploadMode.URL:
                    await this.bot.telegram.sendPhoto(this.cfg.chatid, value.url);
                    break;
                case TelegramAnnouncerUploadMode.URLFile:
                    await this.bot.telegram.sendDocument(this.cfg.chatid, value.url);
                    break;
                default:
                    break;
            }
            if(this.cfg.sendtext && !this.cfg.ascaption)
                await this.bot.telegram.sendMessage(this.cfg.chatid, message);
        }
    }
}

export enum TelegramAnnouncerUploadMode {
    Upload = "upload",
    URL = "url",
    File = "file",
    URLFile = "urlfile",
    None = "none"
}