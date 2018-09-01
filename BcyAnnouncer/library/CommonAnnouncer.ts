import * as fs from "fs";
import * as path from "path";
import * as ejs from "ejs";
import {IllegalArgumentError} from "./Errors";

/**
 * Common Announcer
 */
export default abstract class CommonAnnouncer {
    tasks: ISiteTasks = [];
    isTaskLoaded = false;
    name: string;

    protected constructor() {
        this.name = this.constructor.name.substring(0, this.constructor.name.indexOf("Announcer"));
        this.loadTasks();
    }

    public addTask(object: ISiteTask) {
        if(this.tasks !instanceof Array)
            this.tasks = []; //Node, FUCK YOU!!!
        this.tasks.push(object);
        this.saveTasks();
    }

    public saveTasks() {
        fs.writeFileSync(path.join(__dirname, "..", "index", this.name + ".json"), JSON.stringify(this.tasks));
    }

    public loadTasks() {
        if (!this.isTaskLoaded) {
            const storagePath = path.join(__dirname, "..", "index", this.name + ".json");
            if (!fs.existsSync(storagePath))
                fs.writeFileSync(storagePath, "{}", "utf8");
            this.tasks = <ISiteTasks>JSON.parse(fs.readFileSync(storagePath, "utf8"));
        }
    }

    public async startProcessTask(printLog: boolean = true) {
        if (this.tasks.length > 0) {
            const task = this.tasks.shift();
            try {
                await this.send(task);
                if (printLog)
                    console.log("Published to " + this.name + " API: " + task.url);
            } catch (err) {
                this.tasks.push(task);
                console.warn(err);
            }
        }
        setTimeout(async () => await this.startProcessTask(), this.sleep);
    }

    public async compileTemplate(object: ISiteTask, file: string = this.name) {
        const fullpath = path.join(__dirname, "template", file + ".ejs");
        if(!fs.existsSync(fullpath))
            throw new IllegalArgumentError("EJS File not exist!!!");
        return await new Promise((resolve, reject) => {
            ejs.renderFile(fullpath, {item: object}, (err, str) => {
                if(err) reject(err);
                else resolve(str);
            });
        });
    }

    abstract sleep: number;
    abstract send(object: ISiteTask);
    abstract start();
}