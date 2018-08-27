export default class index {
    static parse(path: string): ISiteIndex;
    static save(path: string, data: ISiteIndex): Promise<void>;
}
