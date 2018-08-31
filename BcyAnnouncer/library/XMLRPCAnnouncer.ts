import * as fs from "fs";
import * as path from "path";
import * as wordpress from "wordpress";
import CommonAnnouncer from "./CommonAnnouncer";

export default class XMLRPCAnnouncer extends CommonAnnouncer {
    cfg: IXMLRPCConfig;
    client: any;
    sleep: number;

    constructor(cfg: IXMLRPCConfig) {
        super();
        this.cfg = cfg;
        this.sleep = cfg.sleep;
        this.client = wordpress.createClient({
            url: this.cfg.url,
            username: this.cfg.username,
            password: this.cfg.password
        });
        this.loadTasks();
    }

    public async start() {
        await this.startProcessTask();
    }

    public async send(object: ISiteTask) {
        this.client.newPost({
            title: this.compileTemplate(object, "XMLRPC.title"),
            content: this.compileTemplate(object),
        }, function( error, data ) {
            console.log( arguments );
        });
    }
}