# OnTap Packs

OnTap 社区 Prompt Pack 注册表 — 浏览、安装与分享 `.otpack` 指令集合。

这里托管各类 **纯 Prompt** 指令包（写作 / 开发 / 销售 / 客服 / 办公…），
OnTap 客户端通过本仓库的 `index.json` 读取可用包并一键安装。

> 阶段 0 仅接受纯 Prompt 内容；暂不支持含脚本的插件包。

## 目录结构

```
.
├── index.json                  # 注册表索引（OnTap 客户端只读此文件）
├── packs/
│   └── <pack-id>/
│       ├── pack.json           # 包元数据（人读 + 生成 index）
│       └── <pack-id>.otpack    # 实际包
├── docs/pack-spec.md           # 字段 / 命名 / 版本 / 下载地址规范
└── CONTRIBUTING.md             # 贡献指引
```

## 安装一个 Pack

1. 在 OnTap 客户端打开「库 → 在线 Pack」
2. 找到想要的包，点击「安装」
3. 客户端会从本仓库下载 `.otpack` 并校验 sha256 后安装

也可直接下载 `packs/<pack-id>/<pack-id>.otpack`，在客户端「导入 Pack」中选择文件。

## 提交一个 Pack

1. 在 OnTap 客户端「导出为 Pack」得到 `.otpack`，并准备 `pack.json`
2. Fork 本仓库，新建 `packs/<pack-id>/`，放入 `pack.json` 与 `<pack-id>.otpack`
3. 计算 sha256 并更新 `index.json`
4. 提交 Pull Request，等待审核

详见 [CONTRIBUTING.md](./CONTRIBUTING.md) 与 [docs/pack-spec.md](./docs/pack-spec.md)。

## 索引格式

`index.json`：

```json
{
  "schema": 1,
  "updatedAt": "2026-09-24T00:00:00Z",
  "packs": [
    {
      "id": "customer-support-zh",
      "name": "客服回复模板（中文）",
      "author": "your-name",
      "version": 1,
      "description": "常见客服场景的高情商回复模板",
      "tags": ["客服", "中文"],
      "categories": ["销售/客服"],
      "download": "packs/customer-support-zh/customer-support-zh.otpack",
      "sha256": "<64 位十六进制>",
      "homepage": "https://gitee.com/ontap-packs/packs/tree/master/packs/customer-support-zh",
      "minAppVersion": "1.3.0"
    }
  ]
}
```

- `download` 支持**相对路径**（相对本索引所在目录）或**绝对 URL**。
- `version` 为**整数**，每次更新递增。
