# 半次元自动爬虫
此项目正在开发中，当前状态：
```
正在实现Telegram发布
√ 已实现多线程下载和记录
```

 * 支持使用代理
 * Telegram 部分支持使用代理
 
## 模版
此程序使用 EJS 渲染模版。你可以使用 EJS 的语法。    
但是，若你要发布到 Telegram 频道，则应遵循 Markdown 语法。     
你可以使用下列变量：    

| Name       | Description         |
| ---------- | ------------------- |
| item.url   | string 半次元原生图片下载地址 |
| item.detailUrl |  string 半次元图片详情页面地址 |
| item.author |  string 图片作者 |
| item.description |  string 纯文本. 作者对此作品的描述 |
| item.tags | string[] 图片TAGS |
| item.filename | string 本地已下载的文件名称 |
| item.fullpath | string 本地已下载的文件完整路径 |
| item.hash | string 已下载的文件 MD5 |
| item.localurl | string 仅特定Announcer且开启upload选项才可用。上传后的图片URL |