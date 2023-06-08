import { defineConfig } from 'vitepress';

// refer https://vitepress.vuejs.org/config/introduction for details
export default defineConfig({
  base: '/vue3-analysis/',
  outDir: '../dist',
  lang: 'en-US',
  title: 'vue3源码解析',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文档仓库', link: 'https://github.com/WangZhenHao/vue3-analysis' },
      { text: 'Vue3官方仓库', link: 'https://github.com/vuejs/core' }
    ],

    sidebar: [
      {
        text: '准备工作',
        items: [
          { text: '读源码步骤', link: '/start/preface' },
          { text: 'Vue3项目构建流程', link: '/start/build' },
          { text: 'es6的新特性', link: '/start/es6' },
          { text: '联系&讨论', link: '/start/contact' },
        ],
      },
      {
        text: '数据驱动',
        items: [
          { text: 'Vue渲染流程', link: '/reactive/optionApi' },
          { text: 'data响应式', link: '/reactive/data' },
          { text: '组合式函数流程', link: '/reactive/compostionApi' },
          { text: 'render函数', link: '/reactive/render' },
          { text: '如何产生vnode', link: '/reactive/vnode' },
          { text: 'vnode渲染真实dom', link: '/reactive/patch' },
          { text: 'vnode的update', link: '/reactive/patchUpdate' },
        ],
      },
      {
        text: 'Vue的api解读',
        items: [
          { text: 'reactive', link: '/property/reactive' },
          { text: 'ref', link: '/property/ref' },
          { text: 'watch', link: '/property/watch' },
          { text: 'watch案例', link: '/property/watch2' },
          { text: 'computed', link: '/property/computed' },
          { text: 'slot插槽', link: '/property/slot' },
        ]
      },
      {
        'text': 'Vue最佳实践',
        items: [
          { text: 'Proxy特性的应用', link: '/practice/proxy' },
          { text: '函数调用式的组件-弹层', link: '/practice/toast' },
        ]
      }
    ],
  },
});
