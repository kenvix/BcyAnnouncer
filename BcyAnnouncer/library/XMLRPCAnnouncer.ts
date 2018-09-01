import * as fs from "fs";
import * as path from "path";
import CommonAnnouncer from "./CommonAnnouncer";
import * as mime from "mime";
import * as xmlrpc from "xmlrpc";
import * as parseURL from "url";
import Templater from "./Templater";
import {ActionRefusedError} from "./Errors";
import Promise = JQuery.Promise;

/**
 * Announcer of Wordpress XMLRPC API
 * @see https://codex.wordpress.org/XML-RPC_WordPress_API/Posts
 */
export default class XMLRPCAnnouncer extends CommonAnnouncer {
    cfg: IXMLRPCConfig;
    client: any;
    sleep: number;

    constructor(cfg: IXMLRPCConfig) {
        super();
        this.cfg = cfg;
        this.sleep = cfg.sleep;
        //const url = parseURL.parse(this.cfg.url);
        //const defaultPort = url.protocol == 'https:' ? "443" : "80";
        this.client = xmlrpc.createClient({
            url: cfg.url,
            basic_auth: {
                user: cfg.username,
                pass: cfg.password
            }
        });
    }

    public async buildForm(object: ISiteTask) {
        return [
            this.cfg.blog_id,
            this.cfg.username,
            this.cfg.password,
            {
                "post_title" : await this.compileTemplate(object, "XMLRPC.title"),
                "post_status" : this.cfg.status,
                "post_content": await this.compileTemplate(object),
                "terms_names" : {
                    "post_tag": object.tags,
                    "category": this.cfg.category,
                    //"comment_status": this.cfg.comment_status,
                    //"post_password" : this.cfg.post_password,
                    //"ping_status" : this.cfg.ping_status,
                    //"post_format" : this.cfg.post_format,
                }
            }];
    }

    public async start() {
        await this.startProcessTask();
    }

    /**
     * Send XMLRPC Wordpress Add Post Request
     * @param {ISiteTask} object
     * @returns {Promise<string>} new post id
     */
    public async send(object: ISiteTask) {
        try {
            if(this.cfg.upload) {

            }
            return <string>await new Promise(async (resolve, reject) => {
                this.client.methodCall("wp.newPost", await this.buildForm(object), (error, value) => {
                    if(error) reject(error);
                    else resolve(value);
                });
            });
        } catch (e) {
            throw new ActionRefusedError(e.toString());
        }
    }
}