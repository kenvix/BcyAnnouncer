import * as fs from "fs";
import * as ph from "path";

export default class Index {
    public static parse(path: string): ISiteIndex {
        path = ph.join(__dirname, "..", "index" , path);
        if(!fs.existsSync(path))
            fs.writeFileSync(path, "{}", "utf8");
        return JSON.parse(fs.readFileSync(path, "utf8"));
    }

    public static async save(path: string, data: ISiteIndex) {
        fs.writeFile(path, JSON.stringify(data), err => { if (err) throw err });
    }
}