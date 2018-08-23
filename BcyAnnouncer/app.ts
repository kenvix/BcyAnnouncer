/// <reference path="library/interface/IConfig.ts" />
/// <reference path="library/announcer.ts" />
/// <reference path="library/bcy.ts" />

import * as superagent from "superagent";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as process from "process";

async function Main() {
    //Initialize
    console.log("Bcy Telegram Announcer v1.0 // By Kenvix");
    const cfgPath = path.join(__dirname, "config.json");
    const downloadPath = path.join(__dirname, "downloads");
    if (!fs.existsSync(cfgPath)) {
        console.error(cfgPath + " not exist!!");
        process.exit(2);
    }
    const cfg: IConfig = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
    if (!fs.existsSync(downloadPath))
        fs.mkdirSync(downloadPath);
    //Telegraf Init

}

Main();