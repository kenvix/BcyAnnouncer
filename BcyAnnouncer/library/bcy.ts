import * as superagent from "superagent";
import { JSDOM } from "jsdom";
import * as uri from "url";
import * as path from "path";
import * as fs from "fs";

export default class bcy {
    cfg: ISiteConfig;
    tasks: IAnnouncerTasks;

    constructor(cfg: ISiteConfig) {
        this.cfg = cfg;
    }

    public async addTask(url: string) {
        const info = this.parseUrl(url);
        if (!fs.existsSync(path.join(this.cfg.storage.dir, info.md5 + this.cfg.extname))) {
            this.tasks[info.md5] = {
                url: info.url,
                filename: info.md5 + this.cfg.extname
            };
        }
    }

    public async processOneTask() {

    }

    protected parseUrl(url: string): ParseUrlResult {
        const returnUrl = url.substring(0, url.indexOf(this.cfg.extname) + 4);
        return {
            url: returnUrl,
            md5: path.basename(uri.parse(returnUrl).pathname, this.cfg.extname)
        }
    }

    public async checkUpdate(): Promise<void> {
        superagent.get(this.cfg.url)
            .set("Useragent", "	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36")
            .end(async (err, res) => {
                if (err) throw err;
                if (!res || res.text.length < 1)
                    throw new Error("接收服务器返回数据失败");
                const dom = new JSDOM(res.text);
                const window = dom.window;
                const document = window.document;
                const $: JQueryStatic = require("jquery")(window);
                const shit = this;
                $("img.cardImage").each(function () {
                    console.dir(shit.parseUrl($(this).attr("src")));
                });
            })
    }

    public async start(): Promise<void> {
        try {
            setInterval(this.checkUpdate, this.cfg.sleep.check);
        } catch (err) {
            console.warn(err);
        }
    }
}