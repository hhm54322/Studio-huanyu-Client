# 中国医生资料来源

## 2026-11-03 头像补齐

- 用户提供「头像/男头像」「头像/女头像」共55张单人方图，明确授权按性别分配到缺头像医生：30男、25女。不是按文件名辨认医生身份；逐人稳定对应关系、性别依据和原始文件SHA256见 `avatar-assignments.json`。
- 性别以精简文档头部为准；柳光宇/苗华栋/陈骏良为男、徐化梅为女由用户补充。王春燕原文“她”确定为女。
- 周莉莉、柳光宇和原网站谭兆林、徐宇、陈疾忤保留原头像。新增55张头像只补充中国医生列表和对应详情，名单、正文和科室筛选不变。
- 发布图为320×320 WebP、quality80，位于 `public/images/physicians/assigned/`；原始PNG不重复加入Git。可用映射及输出图片长期留档；后续已有映射不静默重新分配。
- 重建：使用配置好的Python/Pillow运行 `scripts/build-physician-avatars.py --source /absolute/path/头像`。运行时仅使用 `src/data/physicianAvatars.json`；图片继续经过全站内容哈希及长期缓存流程。

## 当前发布数据（2026-10-31）

- 当前发布原件：`曜影医疗专家信息汇总-精简发布版.docx`，57 位医生、34 个科室；SHA256 `83d02e83c0293e6924dd217e79b314b167b7847f21eab7e7e851b6d4a6846421`。
- 运行时数据：`src/data/yaoyingPhysicians.json`。该名单与原有 Figma 来源医生合并为 60 位：谭兆林、徐宇、陈疾忤保留各自原卡片/详情；周莉莉、柳光宇采用同名文档记录，周莉莉擅长按下述已批准规则覆盖。
- 周莉莉的血液内科擅长字段按用户批准的 `publication-overrides.json` 修正，其他字段按精简文档；覆盖字段和哈希由导入脚本校验。
- 缺失头像不显示，不使用其他医生头像或编造内容；首页专家资料不受此名录影响。
- 导入：在前端项目根目录使用配置好的 Python 运行 `python3 scripts/build-yaoying-physicians.py`，更新后运行当前目录 QA 和审计。

## 历史原件

- 原件：`曜影医疗专家信息汇总.docx`，2026-10-30 归档，177 位医生、34 个科室。
- 原件 SHA256：`cb05c6c9413afd89de709596dcc0e168f0d23a4c674415cc39447ff3147ff9f2`。
- 使用范围：中国医院下的“中国医生”（`/doctors`）。首页专家资料独立维护。
- 运行时数据：`src/data/yaoyingPhysicians.json`；由 `scripts/build-yaoying-physicians.py` 提取。
- 导入：在前端项目根目录使用安装了 `python-docx` 的 Python 运行 `python3 scripts/build-yaoying-physicians.py`。
- 更新原件时保留历史版本，核对人数与源文档序号；历史 177 位原件仅作为归档；当前导入脚本对精简发布版 57 条记录设有数量保护，新名录增减时须同步检查。更新后重新验证科室、所有详情及来源哈希。
- 缺失的头像和资料不补造；文档中的设计师核对附录不展示在患者端。
