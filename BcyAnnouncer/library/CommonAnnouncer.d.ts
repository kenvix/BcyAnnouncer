export default abstract class commonAnnouncer {
    tasks: ISiteTasks;
    isTaskLoaded: boolean;
    constructor();
    addTask(object: ISiteTask): void;
    saveTasks(): void;
    loadTasks(): void;
    abstract send(object: ISiteTask): any;
    abstract start(): any;
    abstract startProcessTask(): any;
    abstract startProcessTask(printLog: boolean): any;
}
