import * as fs from "fs";
import * as path from "path";
import CommonAnnouncer from "./CommonAnnouncer";
import * as mime from "mime";
import * as xmlrpc from "xmlrpc";
import * as parseURL from "url";
import {ActionRefusedError, NetworkError} from "./Errors";

/**
 * Announcer of Wordpress XMLRPC API
 * @see https://codex.wordpress.org/XML-RPC_WordPress_API
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

    public async buildForm(data: any) {
        return [
            this.cfg.blog_id,
            this.cfg.username,
            this.cfg.password,
            data
        ];
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
        if(this.cfg.upload) {
            const uploadBase64Binary = <string>await new Promise((resolve, reject) => {
                fs.readFile(object.fullpath,(err, str) => {
                    if(err) reject(err);
                    else resolve(str);
                });
            });
            const uploadData = {
                "name": object.filename,
                "type": mime.getType(object.filename),
                "bits": uploadBase64Binary,
                "overwrite": true
            };
            const uploadResult = <IXMLRPCUploadResult>await new Promise(async (resolve, reject) => {
                this.client.methodCall("wp.uploadFile", await this.buildForm(uploadData), (error, value) => {
                    if(error) reject(error);
                    else resolve(value);
                });
            });
            if(uploadResult.url.length <= 1)
                throw new NetworkError("XMLRPC: Unable to upload file.");
            object.localurl = uploadResult.url;
        }
        const postData = {
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
        };
        return <string>await new Promise(async (resolve, reject) => {
            this.client.methodCall("wp.newPost", await this.buildForm(postData), (error, value) => {
                if(error) reject(error);
                else resolve(value);
            });
        });
    }
}