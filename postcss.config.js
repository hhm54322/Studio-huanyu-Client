export default {
  plugins: {
    // postcss-px-to-viewport 已禁用
    // 原因：Tailwind CSS 4 自身的响应式工具类（px-4, md:px-6 等）已提供完善的移动端适配。
    // px-to-viewport 会将 Tailwind 生成的 px 值转为 vw，破坏 padding/margin/spacing 布局，
    // 导致移动端内容贴边、间距异常。Kimi 原版也未使用此插件。
    // 如需对特定组件使用 vw 单位，请在组件内手动编写 vw 值。
  },
}
