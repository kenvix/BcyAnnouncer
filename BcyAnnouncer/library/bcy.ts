import * as superagent from "superagent";
import { JSDOM } from "jsdom";
import * as uri from "url";
import * as path from "path";
import * as fs from "fs";

export default class bcy {
    cfg: ISiteConfig;
    domain: string;
    tasks: ISiteTasks;

    constructor(cfg: ISiteConfig) {
        this.cfg = cfg;
        const urlParseResult = uri.parse(cfg.url);
        this.domain = urlParseResult.protocol + "//" + urlParseResult.host;
    }
    /*
    public async addTask(url: string) {
        const info = this.parseObject(url);
        if (!fs.existsSync(path.join(this.cfg.storage.dir, info.md5 + this.cfg.extname))) {
            this.tasks[info.md5] = {
                url: info.url,
                filename: info.md5 + this.cfg.extname
            };
        }
    }
    */
    public async processOneTask(object: JQuery<HTMLElement>) {
        console.log(await this.parseObject(object));
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
                    shit.processOneTask($(this));
                });
            });
    }

    public async start(): Promise<void> {
        try {
            setInterval(this.checkUpdate, this.cfg.sleep.check);
        } catch (err) {
            console.warn(err);
        }
    }
}