import Telegraf, { ContextMessageUpdate } from "telegraf";
import "./TelegramUploadMode";
import commonAnnouncer from "./commonAnnouncer";
export default class telegramAnnouncer extends commonAnnouncer {
    cfg: ITelegramConfig;
    bot: Telegraf<ContextMessageUpdate>;
    agent: any;
    constructor(cfg: ITelegramConfig);
    start(): Promise<void>;
    startProcessTask(printLog?: boolean): Promise<void>;
    send(object: ISiteTask): Promise<void>;
}
export declare enum TelegramUploadMode {
    Upload = "upload",
    SendURL = "sendurl",
    SendTextMessage = "sendtext",
}
