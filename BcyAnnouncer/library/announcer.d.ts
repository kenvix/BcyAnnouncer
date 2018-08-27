import Telegraf, { ContextMessageUpdate, Telegram } from "telegraf";
export default class announcer {
    cfg: ITelegramConfig;
    bot: Telegraf<ContextMessageUpdate>;
    tg: Telegram;
    agent: any;
    constructor(cfg: ITelegramConfig);
    start(): void;
}
