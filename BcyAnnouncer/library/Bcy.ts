import * as superagent from "superagent";
import { JSDOM } from "jsdom";
import * as uri from "url";
import * as path from "path";
import * as fs from "fs";
import { E2BIG } from "constants";
import { setInterval, setTimeout } from "timers";
import * as Downloader from "mt-files-downloader";
import * as pEvent from "p-event";
import index from "./index";
import telegramAnnouncer from "./telegramAnnouncer";
import IEnabledAnnouncers from "./interface/IEnabledAnnouncers";

export default class Bcy {
    cfg: ISiteConfig;
    domain: string;
    static tasks: ISiteTasks = [];
    index: ISiteIndex;
    enabledAnnouncers: IEnabledAnnouncers;

    constructor(cfg: ISiteConfig, enabledAnnouncers: IEnabledAnnouncers) {
        this.cfg = cfg;
        const urlParseResult = uri.parse(cfg.url);
        this.domain = urlParseResult.protocol + "//" + urlParseResult.host;
        this.index = index.parse(cfg.storage.index);
        this.enabledAnnouncers = enabledAnnouncers;
    }

    public async addTask(object: JQuery<HTMLElement>): Promise<void> {
        const info = await this.parseObject(object);
        if (!fs.existsSync(info.fullpath))
            Bcy.tasks.push(info);
    }
    
    public async startProcessTask(printLog: boolean = true) {
        if (Bcy.tasks.length > 0) {
            const task = Bcy.tasks.shift();
            if (printLog)
                console.log("download file: " + task.url)
            try {
                let dl = (new Downloader()).download(task.url, task.fullpath);
                dl.on("error", msg => {
                    throw new Error("failed to download: " + msg);
                });
                dl.start();
                await pEvent(dl, "end");
                this.addIndex(task);
                if (printLog)
                    console.log("file downloaded: " + task.fullpath);
                this.addIndex(task);
                this.publish(task);
            } catch (err) {
                Bcy.tasks.push(task);
                console.warn(err);
                if (fs.existsSync(task.fullpath))
                    fs.unlink(task.fullpath, () => { });
            }
        }
        setTimeout(async () => await this.startProcessTask(), this.cfg.sleep.download);
    }

    protected async addIndex(object: ISiteTask) {
        this.index[object.hash] = object;
        this.saveIndex();
    }

    protected async saveIndex() {
        try {
            index.save(this.cfg.storage.index, this.index);
        } catch (err) {
            console.warn("Failed to save Index file: " + err);
        }
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
        $("div.post__content>p>br").each(function () {
            $(this).replaceWith("\n");
        });
        const filename = path.basename(uri.parse(returnUrl).pathname);
        return {
            url: returnUrl,
            detailUrl: detailUrl,
            filename: filename,
            description: $("div.post__content>p").text(),
            author: father.attr("title").trim(),
            tags: tags,
            fullpath: path.join(this.cfg.storage.dir, filename),
            hash: filename.substring(0, filename.length - path.extname(filename).length)
        }
    }

    public async startCheckUpdate(): Promise<void> {
        const res = await superagent.get(this.cfg.url)
            .set("Useragent", this.cfg.userAgent);
        if (!res || typeof (res.text.length) == "undefined" || res.text.length < 1)
            throw new Error("fuck the fucking server boom!!");
        const dom = new JSDOM(res.text);
        const window = dom.window;
        const document = window.document;
        const $: JQueryStatic = require("jquery")(window);
        const shit = this;
        $("img.cardImage").each(function () {
            shit.addTask($(this));
        });
        setTimeout(async () => await this.startCheckUpdate(), this.cfg.sleep.check);
    }

    public async start(): Promise<void> {
        try {
            this.startCheckUpdate();
            this.startProcessTask();
        } catch (err) {
            console.warn(err);
        }
    }

    public async publish(object: ISiteTask) {
        if (this.enabledAnnouncers.telegram)
            this.enabledAnnouncers.telegram.addTask(object);
        if (this.enabledAnnouncers.xmlrpc)
            this.enabledAnnouncers.xmlrpc.addTask(object);
    }
}