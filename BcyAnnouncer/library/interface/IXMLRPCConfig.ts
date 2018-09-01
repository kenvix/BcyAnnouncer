interface IXMLRPCConfig extends ICommonAnnouncerConfig {
    url: string,
    username: string,
    password: string,
    upload: boolean,
    category: string[],
    status: "publish" | "draft" | "pending" | "private" | "trash", //see https://codex.wordpress.org/Post_Status
    template: string,
    blog_id: number,
    post_password ?: string,
    ping_status ?: "open" | "closed",
    post_format ?: any,
    comment_status ?: "open" | "closed"
}