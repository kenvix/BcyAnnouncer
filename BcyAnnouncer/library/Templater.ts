import * as fs from "fs";
import * as path from "path";
import * as ejs from "ejs";

export default class Templater {
    vars: any = {};
    file: string;

    constructor(name: string) {
        this.file = path.join(__dirname, "template", name + ".ejs");
        if(!fs.existsSync(this.file))
            throw new Error("EJS File not exist!!!");
    }

    public addVar(key: string, value: any) {
        this.vars[key] = value;
        return this;
    }

    public compile() {
        return ejs.compile(this.file);
    }

    public get() {
        return this.compile()(this.vars);
    }
}