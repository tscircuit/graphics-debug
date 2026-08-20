# OfferDesk 源码包

这里保存 OfferDesk 的完整源码压缩包，供备份和下载。

## 文件

- `offerdesk-source.tar.gz.b64.part-aa` 到 `offerdesk-source.tar.gz.b64.part-ag`：源码包的 base64 分片。

## 还原方法

在本地下载这些分片后运行：

```bash
cat offerdesk-source.tar.gz.b64.part-* > offerdesk-source.tar.gz.b64
base64 -d offerdesk-source.tar.gz.b64 > offerdesk-source.tar.gz
tar -xzf offerdesk-source.tar.gz
```

## 校验

- 源码文件数：57
- 压缩包 SHA-256：8539675944ff8ca6985f0f0856177c32b413cff5e3699b10859920bfeb59c94a

说明：压缩包不包含 `dist/`，也不包含付款后邮件里的授权码明文。
