# COS-Algolia

用于生产Algolia搜索代码的Repo

Status:
![](https://travis-ci.org/Lchiffon/cosx-algolia.svg?branch=master)

## 特性

- node运行
- 每天定时运行
- 检查cosx.org是否有更新, 如果有, 更新索引文件, 上传algolia

## 修改

- 在`.env`中修改`ALGOLIA_API_KEY`为
- 在travis管理界面中里面增加`AL_VALUE`变量, 值为algolia的admin密码
