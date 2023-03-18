import { defineConfig } from 'vitepress';

// refer https://vitepress.vuejs.org/config/introduction for details
export default defineConfig({
  base: '/vue3-analysis/',
  outDir: '../dist',
  lang: 'en-US',
  title: 'vue3源码解析',
  description: '直白，简单的方式去学习Vue3源码',
  themeConfig: {
    nav: [
      { text: '文档仓库', link: 'https://github.com/vuejs/vitepress/issues/1506' },
      { text: 'Vue3官方仓库', link: 'https://github.com/vuejs/core' }
    ],

    sidebar: [
      {
        text: '准备工作',
        items: [
          { text: '读源码步骤', link: '/start/preface' },
          { text: 'Vue3项目构建流程', link: '/start/build' },
          { text: 'es6的新特性', link: '/start/es6' },
        ],
      },
      {
        text: '数据驱动',
        items: [
          { text: 'Vue渲染流程', link: '/reactive/optionApi' },
          { text: 'data响应式', link: '/reactive/data' },
        ],
      }
    ],
  },
});
