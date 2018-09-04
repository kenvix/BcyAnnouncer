# 半次元自动爬虫
爬取热门项目并自动发布到博客(XMLRPC)和Telegram频道          
所有支持 Wordpress XMLRPC API 的博客，例如 Wordpress/Typecho/Emlog 都可以使用。     
默认爬取【本周热门】，你可以修改配置文件来爬取所有结构相似的页面。    
请一定要记得修改延时设置，防止被屏蔽。      

当前状态：V1.0 版本已发布   
**警告**：使用本软件即表明您同意承担因使用本软件所造成的一切后果，作者不对此承担任何责任。
## 部署
1. 前往 Release 页面下载发布版本
2. 安装 Nodejs, Yarn ( `npm install yarn -g` )
3. 运行 `yarn install` 安装依赖包
4. 修改配置文件 `config.yml`
5. 运行 `node app` 开始运行
## 配置博客文章发布
您需要使用支持 XMLRPC (或称为离线写作) 的博客程序，例如 Wordpress和Typecho.      
然后，修改 `config.json` 的 `xmlrpc` 节的 `url` 字段   
Wordpress 通常为：`http(s)://博客地址/xmlrpc.php`     
Typecho 通常为：`http(s)://博客地址/index.php/action/xmlrpc`    
你可以使用 Microsoft Word 测试你的博客。安全起见，建议您禁用 Pingback
## 模版
此程序使用 EJS 渲染模版。你可以使用 EJS 的语法。    
但是，若你要发布到 Telegram 频道，则同时应遵循 Markdown 语法。     
你可以使用下列变量：    

| Name       | Description         |
| ---------- | ------------------- |
| item.id    | string 作品ID | 
| item.img   | Array\<ISiteTaskImg\> 数组，包含所有图片对象 |
| item.detailUrl |  string 半次元图片详情页面地址 |
| item.author |  string 图片作者 |
| item.description |  string 纯文本. 作者对此作品的描述 |
| item.tags | string[] 图片TAGS |

图片对象说明：(假设循环赋值到变量photo)

| Name       | Description         |
| ---------- | ------------------- |
| photo.url   | string 半次元原生图片下载地址 |
| photo.filename | string 本地已下载的文件名称 |
| photo.fullpath | string 本地已下载的文件完整路径 |
| photo.hash | string 已下载的文件 MD5 |
| photo.localurl | string 仅特定Announcer且开启upload选项才可用。上传后的图片URL |

## 常见问题解决办法
### XML-RPC 发布
#### 报错 Unknown XML-RPC tag 
```
Error: Unknown XML-RPC tag 'TITLE'    
Error: Unknown XML-RPC tag 'META'   
```
你的服务器配置有问题，打印多半是服务端提示了某些信息，一般有：    
**301 Moved Permanently**    
检查该地址是否被重定向了   
**413 Request Entity Too Large**   
检查你的服务端(PHP等)的文件大小限制     
Nginx: 在 `nginx.conf` 的 `http` 节设置 `client_max_body_size 999M;`     
PHP: 在 `php.ini` 设置 `post_max_size = 999M` 和 `upload_max_filesize = 999M`         
总之建议先用其他离线撰写软件测试下文章发布和图片上传