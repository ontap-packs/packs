# 贡献指引（Contributing）

感谢你为 OnTap 社区贡献 Prompt Pack！本仓库收录**纯 Prompt** 指令包。

> 阶段 0 仅接受纯 Prompt 内容；含脚本的插件包暂不收录。

---

## 提交流程

1. **准备 Pack**
   - 打开 OnTap → 指令库（Library）
   - 点工具栏右侧的 **「批量选择」**（进入多选，按钮变为「完成」）
   - 勾选要打包的指令 → 列表上方出现批量操作栏
   - 点 **「导出为 Pack」** → 弹窗填写 Pack 名称 / Pack ID / 版本 / 描述 / 作者 → 选保存位置 → 点 **「导出」**
   - 得到 `<pack-id>.otpack`；编写对应的 `pack.json`（字段见 [docs/pack-spec.md](./docs/pack-spec.md)）
2. **Fork 本仓库**，新建目录 `packs/<pack-id>/`，放入：
   - `pack.json`
   - `<pack-id>.otpack`
3. **计算 sha256** 并更新 `index.json`：
   ```powershell
   Get-FileHash -Algorithm SHA256 packs\<pack-id>\<pack-id>.otpack
   ```
4. **提交 Pull Request**，填写 PR 模板中的自查清单
5. **等待审核**，维护者会检查内容质量、命名规范与安全

> 不熟悉 Git？可在 [Issues](https://gitee.com/ontap-packs/packs/issues) 使用「Pack 投稿」模板提交，由维护者代为整理。

---

## 审核标准

- **内容质量**：Prompt 有明确的实用价值，非重复/低质/广告
- **命名规范**：`id` 符合 `^[a-z0-9]+(-[a-z0-9]+)*$`，全局唯一
- **分类正确**：与 OnTap 内置分类对齐
- **元数据完整**：`index.json` 与 `pack.json` 字段齐全、`sha256` 正确、`version` 已递增
- **安全合规**：纯 Prompt、无脚本、无敏感信息、无侵权内容
- **可复现**：维护者能本地导入 `.otpack` 成功

---

## 命名与分类

详见 [docs/pack-spec.md](./docs/pack-spec.md) §4 命名规范、§5 分类规范。

---

## 提交前自查

- [ ] `id` 唯一且符合命名规范
- [ ] `.otpack` 可被 OnTap 客户端正常导入
- [ ] `pack.json` 与 `index.json` 一致
- [ ] `sha256` 正确
- [ ] `version` 已递增
- [ ] 纯 Prompt，无脚本 / 敏感 / 侵权内容

---

## 提交前本地校验（必做）

新增或更新 Pack 后，请在仓库根目录运行：

```bash
npm install              # 首次
npm run validate         # 校验全部 Pack：字段 / sha256 / 纯 Prompt / 索引一致性
npm run generate-index   # 由各 pack.json + 真实 sha256 重建 index.json
```

- `npm run validate` 通过后才提交；CI 会在 PR 上再跑一次。
- **不要手写 `index.json` 里的 sha256**：用 `npm run generate-index` 生成，避免人算错。
- 若仅替换了 `.otpack` 内容而未递增 `version`，`validate` 会报 sha256 不一致——请按 [docs/pack-spec.md](./docs/pack-spec.md) §8 递增 `version` 并重新生成索引。
