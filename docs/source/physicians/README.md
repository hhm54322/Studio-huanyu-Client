# 中国医生资料来源

- 原件：`曜影医疗专家信息汇总.docx`，2026-10-30 归档，177 位医生、34 个科室。
- 原件 SHA256：`cb05c6c9413afd89de709596dcc0e168f0d23a4c674415cc39447ff3147ff9f2`。
- 使用范围：中国医院下的“中国医生”（`/doctors`）。首页专家资料独立维护。
- 运行时数据：`src/data/yaoyingPhysicians.json`；由 `scripts/build-yaoying-physicians.py` 提取。
- 导入：在前端项目根目录使用安装了 `python-docx` 的 Python 运行 `python3 scripts/build-yaoying-physicians.py`。
- 更新原件时保留历史版本，核对人数与源文档序号；当前脚本对 177 条记录设有数量保护，新名录增减时须同步检查。更新后重新验证科室、所有详情及来源哈希。
- 缺失的头像和资料不补造；文档中的设计师核对附录不展示在患者端。
