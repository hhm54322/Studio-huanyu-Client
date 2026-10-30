# 主站发布记录与连接方式

## 固定部署目标

- 网站：`https://www.huanyumedical.com/`
- SSH：`root@47.237.198.228:22`；本机部署密钥 `~/.ssh/huanyu_deploy`。
- 用户提到的“SSH22 IP”是 ECS 安全组允许的客户端出口地址，不是服务器地址。连接目标继续使用 `47.237.198.228`。
- 静态目录：`/var/www/huanyu`。
- 发布目录：`/opt/huanyu/releases/<version>`；回滚备份：`/opt/huanyu/backups/website-before-<version>.tar.gz`。
- 本次仅更新主站前端；专家工作台、API、数据库和报告生成服务不随此静态发布更新。

## 已验证流程

1. 使用当前可用 Node 运行对应页面门禁、类型检查和生产构建；用 `VITE_APP_VERSION` 指定唯一版本。
2. 对实际发布构建进行本地生产预览验证；生成逐文件 SHA256 清单与压缩包 SHA256。
3. 上传到独立发布目录，核验压缩包和全部文件。
4. 检查 `nginx -t`、`http://127.0.0.1:3000/health`，备份现有静态目录。
5. 先同步静态资源，保留历史哈希资源，最后原子替换 `index.html` 和 `version.json`。
   同步必须使用 `rsync -rltp --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r`；`-p` 确保目标已有文件也应用权限。静态文件应为 0644、目录为 0755，避免校验和正常但 Nginx 返回 403。发布后需实际请求图标及图片，不能只检查文件哈希。
6. 核验源站版本、文件清单和 API 健康，再通过公网浏览器检查页面与交互。
7. 保存发布清单、服务器执行日志、备份位置和公网验证证据到本地忽略目录 `artifacts/deployment/<version>/`。

发布脚本参考：`artifacts/deployment/20261030150141/publish-main.sh`。执行前使用对应版本的清单和备份路径，不覆盖已发布版本。

源码文档位于 `docs/source/`，只在项目留档；不复制到网站静态目录。

## 2026-10-30 发布结果

- 当前版本：`20261030150141`，修正牙科医生案例显示逻辑。卡片和详情共用医生自身 `caseStudies`；无真实授权案例时不渲染 Figma 示例案例图、案例预览和案例入口。六位医生当前均为无案例布局，卡片高度338px。
- 仅更新主站前端，后端/API/数据库未变更。上传 2,102 个静态文件，发布包 SHA256 为 `4280dd0b8ea50eb1ddf1322842f8fabd8ed34e8ea4748793496ceffbd51d2425`；Nginx 配置、API 健康检查和发布后全文件校验通过；回滚备份 `/opt/huanyu/backups/website-before-20261030150141.tar.gz`。
- 公网牙科专项验证：六位医生详情五个标签全部可打开，卡片案例预览/案例入口均为0，卡片高度均338px；无脚本错误、资源失败或破图，列表截图 NMAE `0.00843%`。证据：`artifacts/deployment/20261030150141/online/dental-assets.json`、`dental-matching-loaded.png`、`dental-profile-loaded.png`。

- 当前版本：`20261030142104`，牙科医生卡片 Figma 回归修复已发布；下方 `20261030124327` 为同日上一版本。
- 恢复源稿评分/价格富文本、完整案例预览框和两张源图片，案例预览绑定对应医生的案例标签。图片以160×160 WebP发布，两张共19,228字节。
- 本地开发与实际发布构建的牙科专项检查通过；生产构建截图对 Figma 的案例框 NMAE 0.87091%、pixelmatch 0.52906%，评分/价格区 NMAE 0.62168%、pixelmatch 0.53943%。已人工查看对照图和公网加载截图。
- `vue-tsc -b`、`pnpm run build:app`、`pnpm run audit:figma -- dental.md` 通过。全站 `pnpm run build` 的 prebuild 门禁因本次范围外的旧页面 QA 时效及 trust 源校验未通过；没有放宽门禁，不将本次专项结果表述为全站通过。
- 新版本2,106个文件及发布包 SHA256 核验通过，Nginx与API健康检查通过；回滚备份 `/opt/huanyu/backups/website-before-20261030142104.tar.gz`。
- 公网确认 `version.json` 为 `20261030142104`；六位医生的五个详情标签及相关图标、图片正常，无脚本或资源错误。列表截图与同一发布构建 NMAE 为0.00857%（部署一致性）。
- 本次证据：`artifacts/deployment/20261030142104/published.json`、`online/dental-assets.json`、`online/dental-matching-loaded.png`、`online/dental-profile-loaded.png`；Figma专项证据为 `artifacts/dental-physicians-2026-10-30/production/behavior-qa.json`。

### 同日上一版本

- 版本：`20261030124327`；六位牙科医生资料与现有中国医生目录等前端更新已发布。
- 上传 2103 个文件，逐项 SHA256 校验通过；旧版备份保存在 `/opt/huanyu/backups/website-before-20261030124327.tar.gz`。
- 公网检查 12 个主要路由，均正常渲染，无页面脚本异常或资源 HTTP 错误；177 位中国医生和科室筛选、六位牙科医生详情五个标签/筛选/报价入口/关闭恢复已验证。
- 收尾修正静态目录 32 个文件的读取权限；图标和图片已复核，API 健康正常。
- 发布与在线证据：`artifacts/deployment/20261030124327/published.json`、`permissions-corrected.json`、`online/smoke.json`、`online/dental-assets.json`。
