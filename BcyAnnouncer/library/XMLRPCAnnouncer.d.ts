import commonAnnouncer from "./commonAnnouncer";
export default class xmlrpcAnnouncer extends commonAnnouncer {
    cfg: IXMLRPCConfig;
    client: any;
    constructor(cfg: IXMLRPCConfig);
    start(): Promise<void>;
    startProcessTask(printLog?: boolean): Promise<void>;
    send(object: ISiteTask): Promise<void>;
}
