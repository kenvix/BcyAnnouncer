/// <reference types="jquery" />
import IEnabledAnnouncers from "./interface/IEnabledAnnouncers";

export default class bcy {
    cfg: ISiteConfig;
    domain: string;
    static tasks: ISiteTasks;
    index: ISiteIndex;
    self: typeof bcy;
    enabledAnnouncers: IEnabledAnnouncers;
    constructor(cfg: ISiteConfig, enabledAnnouncers: IEnabledAnnouncers);
    addTask(object: JQuery<HTMLElement>): Promise<void>;
    startProcessTask(printLog?: boolean): Promise<void>;
    protected addIndex(object: ISiteTask): Promise<void>;
    protected saveIndex(): Promise<void>;
    protected parseObject(object: JQuery<HTMLElement>): Promise<ISiteTask>;
    startCheckUpdate(): Promise<void>;
    start(): Promise<void>;
    publish(object: ISiteTask): Promise<void>;
}
