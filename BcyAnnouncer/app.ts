/// <reference path="library/interface/IConfig.ts" />
/// <reference path="library/announcer.ts" />
/// <reference path="library/bcy.ts" />

import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as process from "process";
import bcy from "./library/bcy";
import announcer from "./library/announcer";

async function Main() {
    //Initialize
    console.log("Bcy Telegram Announcer v1.0 // By Kenvix");
    const cfgPath = path.join(__dirname, "config.json");
    if (!fs.existsSync(cfgPath)) {
        console.error(cfgPath + " not exist!!");
        process.exit(2);
    }
    let cfg: IConfig = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
    const downloadPath = path.join(__dirname, cfg.site.storage.dir);
    cfg.site.storage.dir = downloadPath;
    if (!fs.existsSync(downloadPath))
        fs.mkdirSync(downloadPath);
    //Telegraf Init
    const tg = new announcer(cfg.tg);
    const site = new bcy(cfg.site);

    //site.start();
    site.checkUpdate();
    tg.start();
}

Main();