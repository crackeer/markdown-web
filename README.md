# 个人markdown文档、书签、代码管理工具

个人使用的`markdown文档编辑器`，`书签管理`,`代码片段管理`的web站点，后端使用`golang`，前端纯静态，无需编译（反编译，大道至简）

1. 数据库可选用使用`MySQL`| `SQLite`
2. markdown编辑器使用`cherry-markdown`(from:https://github.com/Tencent/cherry-markdown)
3. 代码编辑器使用`monaco-editor`(来自：https://github.com/microsoft/monaco-editor)
4. 前端UI使用bootstrap3，沉稳大气，完全够用，配合`vue`使用

# 运行

```sh
git clone git@github.com:crackeer/markdown-web.git markdown-web
cd markdown-web
go run main.go
```

## .env文件
```ini
# 程序运行端口database
PORT=9500
# 数据库配置SQLite
DATABASE="sqlite://./sqlite.db"
# 数据库配置MySQL
# DATABASE="mysql://username:password@tcp(host:port)/database?charset=utf8&parseTime=True&loc=Local"
# 代码管理的语言
CODE_LANGUAGE="go,javascript,shell,php,sql,css,html"
```

# 截图

## 1. Markdown文档

![](images/2023-11-21-07-21-23.png)
![](images/2023-11-21-07-24-35.png)

## 2. 书签管理

![](images/2023-11-21-07-18-09.png)
![](images/2023-11-21-07-18-41.png)

## 3. 代码管理

![](images/2023-11-21-07-23-56.png)
![](images/2023-11-21-07-22-43.png)