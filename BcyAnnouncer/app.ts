import * as fs from "fs";
import * as path from "path";
import * as process from "process";
import Bcy from "./library/Bcy";
import TelegramAnnouncer from "./library/TelegramAnnouncer";
import IEnabledAnnouncers from "./library/interface/IEnabledAnnouncers";
import XMLRPCAnnouncer from "./library/XMLRPCAnnouncer";
import * as yaml from "js-yaml";

(async () => {
    //Initialize
    console.log("Bcy Telegram Announcer v1.0 // By Kenvix");
    const cfgPath = path.join(__dirname, "config.yml");
    if (!fs.existsSync(cfgPath)) {
        console.error(cfgPath + " not exist!!");
        process.exit(2);
    }
    let config: IConfig = yaml.safeLoad(fs.readFileSync(cfgPath, "utf8"));
    const downloadPath = path.join(__dirname, config.site.storage.dir);
    const indexPath = path.join(__dirname, "index");
    config.site.storage.dir = downloadPath;
    if (!fs.existsSync(downloadPath))
        fs.mkdirSync(downloadPath);
    if (!fs.existsSync(indexPath))
        fs.mkdirSync(indexPath);
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
    /*
    process.on('SIGINT', async () => {
        console.log("Exiting: Saving tasks ...");
        if (config.tg.enable)
            await tg.saveTasks();
        if (config.xmlrpc.enable)
            await xmlrpc.saveTasks();
        await site.saveIndex();
        process.exit(0);
    });
    */
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