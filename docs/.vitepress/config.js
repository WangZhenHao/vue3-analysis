import { defineConfig } from 'vitepress';

// refer https://vitepress.vuejs.org/config/introduction for details
export default defineConfig({
  lang: 'en-US',
  title: 'vue3源码解析',
  description: '直白，简单的方式去学习Vue3源码',
  themeConfig: {
    nav: [
      { text: '文档git仓库', link: 'https://github.com/vuejs/vitepress/issues/1506' },
      { text: 'Vue3官方仓库', link: 'https://github.com/vuejs/core' }
    ],

    sidebar: [
      {
        text: '项目介绍',
        items: [
          { text: '序言', link: '/start/preface' },
          { text: '如何构建', link: '/start/build' },
          // ...
        ],
      },
    ],
  },
});
