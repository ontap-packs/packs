# Pack 规范（pack-spec）

本文件定义 OnTap 社区 Pack 注册表的**目录结构、字段规范与下载地址规则**。提交前请通读。

---

## 1. 目录结构

```
.
├── index.json                  # 注册表索引（OnTap 客户端只读此文件）
├── packs/
│   └── <pack-id>/
│       ├── pack.json           # 包元数据
│       └── <pack-id>.otpack    # 实际包（ZIP，由 OnTap 客户端「导出为 Pack」生成）
├── docs/pack-spec.md           # 本文件
└── CONTRIBUTING.md             # 贡献指引
```

- 每个 Pack 一个目录 `packs/<pack-id>/`。
- `.otpack` 文件名必须与 `<pack-id>` 一致。

---

## 2. `index.json`

注册表索引，OnTap 客户端据此展示在线 Pack 列表。

```json
{
  "schema": 1,
  "updatedAt": "2026-09-25T00:00:00Z",
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
      "minAppVersion": "1.3.0",
      "deprecated": false,
      "revoked": false
    }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|:---:|------|
| `schema` | number | ✅ | 索引格式版本，当前固定为 `1` |
| `updatedAt` | string | ✅ | 最近更新时间（ISO 8601，UTC） |
| `packs` | array | ✅ | Pack 条目列表 |
| `packs[].id` | string | ✅ | Pack 唯一标识（见 §4 命名规范） |
| `packs[].name` | string | ✅ | 展示名称 |
| `packs[].author` | string | ✅ | 作者（Gitee 用户名或署名） |
| `packs[].version` | integer | ✅ | 版本号，**整数**，每次更新 +1 |
| `packs[].description` | string | ⬜ | 一句话简介 |
| `packs[].tags` | string[] | ⬜ | 标签 |
| `packs[].categories` | string[] | ⬜ | 分类（见 §5） |
| `packs[].download` | string | ✅ | 下载地址（相对路径或绝对 URL，见 §6） |
| `packs[].sha256` | string | ✅ | `.otpack` 的 SHA-256（64 位小写十六进制） |
| `packs[].homepage` | string | ⬜ | Pack 主页 / 仓库目录链接 |
| `packs[].minAppVersion` | string | ⬜ | 所需最低 OnTap 版本（语义化版本） |
| `packs[].deprecated` | boolean | ⬜ | 已下架/弃用：在线目录灰显并**禁用安装**；已安装用户不受影响。缺省 `false` |
| `packs[].revoked` | boolean | ⬜ | **紧急作废**：在线目录灰显 + 「已作废」、禁装/禁更新；客户端拉取注册表成功后**立即停用**已安装对应指令（不删除用户编辑过的内容）。缺省 `false` |
| `packs[].securityNotice` | string | ⬜ | 可选安全公告文本，随 `revoked` 一并展示；缺省省略 |
| `packs[].downloads` | number | ⬜ | 下载量（阶段 2 前留空/省略） |
| `packs[].rating` | number | ⬜ | 评分（阶段 2 前留空/省略） |

> **治理字段（索引级）**：`deprecated` / `revoked` / `securityNotice` **不写在 `pack.json` 内**，只存在于 `index.json`。`generate-index.mjs` 重建索引时会从既有索引**保留**这些字段（不会被抹掉）；`validate.mjs` 校验其类型（布尔 / 字符串）。要下架或作废整包，请直接编辑 `index.json` 的对应条目，**勿改 `pack.json`**。

---

## 3. `pack.json`

每个 Pack 目录内的元数据文件（供人阅读，也用于生成 `index.json` 条目）。

```json
{
  "id": "customer-support-zh",
  "name": "客服回复模板（中文）",
  "version": 1,
  "description": "常见客服场景的高情商回复模板",
  "author": "your-name",
  "tags": ["客服", "中文"],
  "categories": ["销售/客服"],
  "license": "MIT",
  "minAppVersion": "1.3.0"
}
```

- `license` 为该 Pack 内容授权（如 `MIT` / `CC0-1.0`），与仓库 LICENSE 独立。
- 其余字段与 `index.json` 条目一致。

---

## 4. 命名规范（`id`）

- 小写英文字母、数字、短横线 `-`；不得包含空格、下划线、中文或路径分隔符。
- 全局唯一，建议「主题-语言/场景」结构，如 `customer-support-zh`。
- 已发布后**不得修改** `id`（客户端据此识别与更新）。

正则：`^[a-z0-9]+(-[a-z0-9]+)*$`

---

## 5. 分类规范

建议与 OnTap 内置分类对齐，例：

`写作`、`开发`、`销售`、`客服`、`办公`、`翻译`、`分析`、`其他`

---

## 6. 下载地址规则（`download`）

支持两种形式：

1. **相对路径**（推荐）——相对 `index.json` 所在目录解析：
   - `packs/customer-support-zh/customer-support-zh.otpack`
   - 解析结果：`https://gitee.com/ontap-packs/packs/raw/master/packs/customer-support-zh/customer-support-zh.otpack`
2. **绝对 URL**——以 `http://` 或 `https://` 开头，直接使用：
   - `https://example.com/packs/xxx.otpack`

> 使用相对路径的好处：同一份 `index.json` 可同时挂载到 Gitee / 对象存储 / CDN 等多个镜像，切换源时无需修改索引。

---

## 7. SHA-256 计算

Windows PowerShell：

```powershell
Get-FileHash -Algorithm SHA256 packs\<pack-id>\<pack-id>.otpack
```

macOS / Linux：

```bash
shasum -a 256 packs/<pack-id>/<pack-id>.otpack
```

取**小写十六进制**结果填入 `index.json` 的 `sha256`。

---

## 8. 版本与更新

- `version` 为整数，仅在**内容变更**时递增。
- 更新 Pack 时：替换 `.otpack` → 重新计算 `sha256` → 递增 `version` → 更新 `index.json`。

---

## 9. 阶段 0 限制

- **仅接受纯 Prompt Pack**：不包含任何可执行脚本（`.py` / `.exe` 等）。
- 含脚本的插件包在安全审查机制就绪前不予收录。

---

## 10. 校验清单（提交前自查）

- [ ] `id` 符合命名规范且全局唯一
- [ ] `.otpack` 可被 OnTap 客户端正常预览/导入
- [ ] `index.json` 与 `pack.json` 字段一致
- [ ] `sha256` 与 `.otpack` 实际哈希一致
- [ ] `version` 已正确递增
- [ ] `download` 路径有效（相对路径指向本仓库真实文件）
- [ ] 纯 Prompt，无脚本、无敏感/侵权内容
