export default {
  plugins: {
    'postcss-px-to-viewport-8-plugin': {
      viewportWidth: 375,
      unitPrecision: 5,
      viewportUnit: 'vw',
      selectorBlackList: ['.ignore-vw', '.pc-only'],
      minPixelValue: 1,
      mediaQuery: false,
      landscape: false,
      exclude: [/node_modules\/vant/],
    },
  },
}
