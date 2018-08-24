import * as superagent from "superagent";
import { JSDOM } from "jsdom";
import * as uri from "url";
import * as path from "path";
import * as fs from "fs";
import { E2BIG } from "constants";
import { setInterval } from "timers";
import * as Downloader from "mt-files-downloader";
import * as pEvent from "p-event";

export default class bcy {
    cfg: ISiteConfig;
    domain: string;
    tasks: ISiteTasks = [];

    constructor(cfg: ISiteConfig) {
        this.cfg = cfg;
        const urlParseResult = uri.parse(cfg.url);
        this.domain = urlParseResult.protocol + "//" + urlParseResult.host;
    }

    public async addTask(object: JQuery<HTMLElement>): Promise<void> {
        const info = await this.parseObject(object);
        if (!fs.existsSync(path.join(this.cfg.storage.dir, info.filename)))
            this.tasks.push(info);
    }
    
    public async processOneTask(printLog: boolean = true) {
        if (this.tasks.length > 0) {
            const task = this.tasks.shift();
            if (printLog)
                console.log("download file: " + task.url)
            const savePath = path.join(this.cfg.storage.dir, task.filename);
            try {
                let dl = (new Downloader()).download(task.url, savePath);
                dl.on("error", function (msg) {
                    throw new Error("failed to download: " + msg);
                });/*
                dl.on("end", function (dl) {
                    console.log("file REALLY!! downloaded: " + savePath);
                });*/
                await dl.start();
                await pEvent(dl, "end");
                if (printLog)
                    console.log("file downloaded: " + savePath);
            } catch (err) {
                this.tasks.push(task);
                console.warn(err);
                if (fs.existsSync(savePath))
                    fs.unlink(savePath, () => { });
            }
        }
        setTimeout(async () => await this.processOneTask(), 1000);
    }

    protected async parseObject(object: JQuery<HTMLElement>): Promise<ISiteTask> {
        const father = object.parent();
        const url = object.attr("src");
        const returnUrl = url.substring(0, url.indexOf(this.cfg.extname) + 4);
        const detailUrl = this.domain + father.attr("href");
        let tags: string[] = [];
        let res = await superagent.get(detailUrl)
            .set("Useragent", this.cfg.userAgent)
            .set("Referer", this.cfg.url);
        if (!res || res.text.length < 1)
            throw new Error("fuck the fucking server boom!!");
        const dom = new JSDOM(res.text);
        const window = dom.window;
        const document = window.document;
        const $: JQueryStatic = require("jquery")(window);
        $("ul.tags li.tag").each(function () {
            tags.push($(this).find("a").text().trim());
        });
        return {
            url: returnUrl,
            detailUrl: detailUrl,
            filename: path.basename(uri.parse(returnUrl).pathname),
            author: father.attr("title").trim(),
            tags: tags
        }
    }

    public async checkUpdate(): Promise<void> {
        superagent.get(this.cfg.url)
            .set("Useragent", this.cfg.userAgent)
            .end(async (err, res) => {
                if (err) throw err;
                if (!res || res.text.length < 1)
                    throw new Error("fuck the fucking server boom!!");
                const dom = new JSDOM(res.text);
                const window = dom.window;
                const document = window.document;
                const $: JQueryStatic = require("jquery")(window);
                const shit = this;
                $("img.cardImage").each(function () {
                    shit.addTask($(this));
                });
            });
    }

    public async start(): Promise<void> {
        try {
            setInterval(async () => await this.checkUpdate(), 1000);
            this.processOneTask();
        } catch (err) {
            console.warn(err);
        }
    }
}