# Figma 连接的唯一入口

连接前必须使用 `scripts/figma-connect.mjs`，不要复制旧版本初始化代码。脚本只通过官方 browser-client 和当前会话的 IAB 连接；不启动外部浏览器、不改设置、不借用其他实例、不创建标签。

在 deferred `mcp__node_repl__js` 中执行：

```js
var figmaConnector = await import('/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/scripts/figma-connect.mjs')
var figmaConnection = await figmaConnector.connectHuanyuFigma({
  sessionId: nodeRepl.requestMeta.threadId ?? nodeRepl.requestMeta.sessionId,
  existingAgent: typeof agent !== 'undefined' ? agent : undefined,
})
globalThis.agent = figmaConnection.agent
globalThis.browser = figmaConnection.browser
globalThis.figmaTab = figmaConnection.figmaTab
nodeRepl.write(figmaConnection.evidence)
```

每次调用都会重新发现最新安装路径并检查真实页面；同版本复用运行时。仅当 Design、Layers、Inspect/Properties 可读时返回 `verified: true`。此结果只证明连接可用，不证明页面实现或参数提取已完成。页面实施时另将证据与选中节点记录到对应 page spec。

失败只报告当前失败环节：`runtime-discovery`（安装路径）、`runtime-bootstrap`（运行时初始化）、`browser-discovery`（当前会话 IAB）、`session-match`（缺少会话标识）、`tab-discovery`（源文件标签）、`design-verification`（真实设计内容）。不得把这些不同故障统称为 Figma 权限/登录问题。

仅 `tab-discovery` 允许通过 `open_in_codex` 打开提示中的规范地址一次，再复用此入口检查。只有已知状态改变（如运行时更新、后端恢复、设计页加载完成）才重试；不反复初始化、重置 REPL、开标签或打开设置。

自检测试：`node --test scripts/figma-connect.test.mjs`。模拟测试不代替真实 Figma 检查。
