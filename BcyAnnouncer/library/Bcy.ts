import * as superagent from "superagent";
import {JSDOM} from "jsdom";
import * as uri from "url";
import * as path from "path";
import * as fs from "fs";
import {setTimeout} from "timers";
import * as Downloader from "mt-files-downloader";
import * as pEvent from "p-event";
import Index from "./Index";
import IEnabledAnnouncers from "./interface/IEnabledAnnouncers";
import * as ProgressBar from "cli-progress";

export default class Bcy {
    cfg: ISiteConfig;
    domain: string;
    tasks: ISiteTask[] = [];
    index: ISiteIndex;
    badTasks: ISiteIndex;
    
    enabledAnnouncers: IEnabledAnnouncers;

    constructor(cfg: ISiteConfig, enabledAnnouncers: IEnabledAnnouncers) {
        this.cfg = cfg;
        const urlParseResult = uri.parse(cfg.url);
        this.domain = urlParseResult.protocol + "//" + urlParseResult.host;
        this.index = Index.parse(cfg.storage.index);
        this.badTasks = Index.parse("bad-" + cfg.storage.index);
        this.enabledAnnouncers = enabledAnnouncers;
    }

    public async addTask(object: JQuery<HTMLElement>): Promise<void> {
        try {
            const info = await this.parseObject(object);
            if (typeof(this.badTasks[info.id]) == "undefined" && typeof(this.tasks[info.id]) == "undefined" && !fs.existsSync(info.img[0].fullpath))
                this.tasks.push(info);
        } catch (e) {
            console.warn("Failed to parse bcy info: " + e);
        }
    }

    public async startProcessTask(printLog: boolean = true) {
        if (this.tasks.length > 0) {
            const task = this.tasks.shift();
            task.status = SiteTaskStatus.Downloading;
            try {
                const artDir = path.join(task.img[0].fullpath, "..");
                if(!fs.existsSync(artDir))
                    fs.mkdirSync(artDir);
                for(let imgTask of task.img) {
                    if (printLog)
                        console.log("download file: " + imgTask.url);
                    const extname = path.extname(imgTask.fullpath);
                    if(extname == ".jpg" || extname == ".png" || extname == ".gif" || extname == ".webp") {
                        let dl = (new Downloader()).download(imgTask.url, imgTask.fullpath);
                        dl.on("error", msg => {
                            throw new Error("Failed to download: " + msg);
                        });
                        dl.start();
                        await pEvent(dl, "start");
                        let downloadStats: IXDownloaderStats = dl.getStats();
                        const bar = new ProgressBar.Bar({clearOnComplete:true}, ProgressBar.Presets.shades_classic);
                        bar.start(downloadStats.total.size, downloadStats.total.downloaded);
                        const downloadTimer = setInterval(() => {
                            downloadStats = dl.getStats();
                            bar.update(downloadStats.total.downloaded)
                        }, 50);
                        await pEvent(dl, "end");
                        clearInterval(downloadTimer);
                        bar.stop();
                        if (printLog)
                            console.log("file downloaded: " + imgTask.fullpath);
                    }
                }
                await this.addIndex(task);
                await this.publish(task);
            } catch (err) {
                try {
                    task.fail++;
                    if(this.cfg.maxfails > 0 && task.fail >= this.cfg.maxfails) {
                        task.status = SiteTaskStatus.Abandoned;
                        this.badTasks[task.id] = task;
                        await this.saveIndex("bad", this.badTasks);
                    } else {
                        task.status = SiteTaskStatus.Failed;
                        this.tasks.push(task);
                    }
                } catch (e) {
                    console.warn("Unable to re-add failed task: " + e);
                }
                console.warn(err);
            }
        }
        setTimeout(async () => await this.startProcessTask(), this.cfg.sleep.download);
    }

    protected async addIndex(object: ISiteTask) {
        this.index[object.id] = object;
        await this.saveIndex();
    }

    public async saveIndex(prefix: string = "", index: ISiteIndex = this.index) {
        try {
            await Index.save(prefix + this.cfg.storage.index, index);
        } catch (err) {
            console.warn("Failed to save Index file: " + err);
        }
    }

    protected async parseObject(object: JQuery<HTMLElement>): Promise<ISiteTask> {
        const father = object.parent();
        const detailUrl = this.domain + father.attr("href");
        let tags: string[] = [];
        let res = await superagent.get(detailUrl)
            .set("Useragent", this.cfg.userAgent)
            .set("Referer", this.cfg.url);
        if (!res || res.text.length < 1)
            throw new Error("fuck the fucking server boom!!");
        const dom = new JSDOM(res.text);
        const window = dom.window;
        const $: JQueryStatic = require("jquery")(window);
        $("ul.tags li.tag").each(function () {
            tags.push($(this).find("a").text().trim());
        });
        $("div.post__content>p>br").each(function () {
            $(this).replaceWith("\n");
        });
        let imgs = [];
        const extname = this.cfg.extname;
        const storageDir = this.cfg.storage.dir;
        $("div.post__content>img.detail_std").each(function () {
            const url = $(this).attr("src");
            const returnUrl = url.substring(0, url.indexOf(extname) + 4);
            const filename = path.basename(uri.parse(returnUrl).pathname);
            imgs.push({
                url: returnUrl,
                filename: filename,
                hash: filename.substring(0, filename.length - path.extname(filename).length)
            });
        });
        if(imgs.length < 1)
            throw new Error("Invaild object!!");
        for (let key in imgs) {
            imgs[key].fullpath = path.join(storageDir, imgs[0].hash, imgs[key].filename);
        }
        return {
            id: imgs[0].hash,
            detailUrl: detailUrl,
            description: $("div.post__content>p").text(),
            author: father.attr("title").trim(),
            tags: tags,
            status: SiteTaskStatus.Pending,
            fail: 0,
            img: imgs
        }
    }

    public async startCheckUpdate(): Promise<void> {
        const res = await superagent.get(this.cfg.url)
            .set("Useragent", this.cfg.userAgent);
        if (!res || typeof (res.text.length) == "undefined" || res.text.length < 1)
            throw new Error("fuck the fucking server boom!!");
        const dom = new JSDOM(res.text);
        const window = dom.window;
        const $: JQueryStatic = require("jquery")(window);
        const shit = this;
        $("img.cardImage").each(function () {
            shit.addTask($(this));
        });
        setTimeout(async () => await this.startCheckUpdate(), this.cfg.sleep.check);
    }

    public async start(): Promise<void> {
        try {
            await this.startCheckUpdate();
            await this.startProcessTask();
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

enum SiteTaskStatus {
    Pending,
    Downloading,
    Failed,
    Abandoned
}