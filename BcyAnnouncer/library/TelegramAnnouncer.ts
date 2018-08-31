import Telegraf, { ContextMessageUpdate, Telegram } from "telegraf";
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
            case TelegramUploadMode.Upload:
                await this.bot.telegram.sendPhoto(this.cfg.chatid, {
                    source: fs.createReadStream(object.fullpath)
                });
                break;
            case TelegramUploadMode.SendTextMessage:
                await this.bot.telegram.sendMessage(this.cfg.chatid, object.url);
                break;
            case TelegramUploadMode.SendURL:
                await this.bot.telegram.sendPhoto(this.cfg.chatid, object.url);
                break;
        }
    }
}

export enum TelegramUploadMode {
    Upload = "upload",
    SendURL = "sendurl",
    SendTextMessage = "sendtext"
}