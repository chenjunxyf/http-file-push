# http-file-push

http协议文件传输

## 环境

[服务端接收器](https://github.com/zhoujq/fis-receiver)

## 使用

**服务器开启接收端口**

```bash
# default port 8999, use `fisrcv <port>` change port
fisrcv `port`
```

**客户端发送文件**

```javascript
var pushFiles = require('http-file-push');
var deploy = {
  "receiver": '服务地址',
  "to": '目标地址'
};

/**
 * @param deploy 发布信息
 * @param dir 发布目录
 */
pushFiles(deploy, 'build');
```

## 参考

* [fis3 http 部署插件](https://github.com/fex-team/fis3-deploy-http-push)
* [fis3](https://github.com/fex-team/fis3)
