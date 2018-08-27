/// <reference types="jquery" />
export default class bcy {
    cfg: ISiteConfig;
    domain: string;
    tasks: ISiteTasks;
    index: ISiteIndex;
    constructor(cfg: ISiteConfig);
    addTask(object: JQuery<HTMLElement>): Promise<void>;
    startProcessTask(printLog?: boolean): Promise<void>;
    protected addIndex(object: ISiteTask): Promise<void>;
    protected saveIndex(): Promise<void>;
    protected parseObject(object: JQuery<HTMLElement>): Promise<ISiteTask>;
    startCheckUpdate(): Promise<void>;
    start(): Promise<void>;
}
