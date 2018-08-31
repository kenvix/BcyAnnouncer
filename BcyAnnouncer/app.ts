import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as process from "process";
import Bcy from "./library/bcy";
import TelegramAnnouncer from "./library/telegramAnnouncer";
import IEnabledAnnouncers from "./library/interface/IEnabledAnnouncers";
import XMLRPCAnnouncer from "./library/xmlrpcAnnouncer";

(async () => {
    //Initialize
    console.log("Bcy Telegram Announcer v1.0 // By Kenvix");
    const cfgPath = path.join(__dirname, "config.json");
    if (!fs.existsSync(cfgPath)) {
        console.error(cfgPath + " not exist!!");
        process.exit(2);
    }
    let config: IConfig = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
    const downloadPath = path.join(__dirname, config.site.storage.dir);
    const indexPath = path.join(__dirname, "index");
    config.site.storage.dir = downloadPath;
    if (!fs.existsSync(downloadPath))
        fs.mkdirSync(downloadPath);
    if (!fs.existsSync(indexPath))
        fs.mkdirSync(indexPath);
    config.site.storage.index = path.join(indexPath, config.site.storage.index);
    if (!fs.existsSync(config.site.storage.index)) {
        fs.writeFileSync(config.site.storage.index, "{}", "utf8");
    }
    //Telegraf Init
    const tg = new TelegramAnnouncer(config.tg);
    const xmlrpc = new XMLRPCAnnouncer(config.xmlrpc);
    let enabledAnnouncers: IEnabledAnnouncers = {
        telegram: config.tg.enable ? tg : false,
        xmlrpc: config.xmlrpc.enable ? xmlrpc : false
    };
    const site = new Bcy(config.site, enabledAnnouncers);

    if (config.tg.enable) {
        tg.start();
        console.log("Publisher Module: Telegram Channel ["+ config.tg.chatid +"] Enabled");
    }
    if (config.xmlrpc.enable) {
        xmlrpc.start();
        console.log("Publisher Module: XMLRPC ["+config.xmlrpc.url+"] Enabled");
    }
    site.start();
})();