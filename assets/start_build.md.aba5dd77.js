import{_ as s,c as a,o as n,N as p}from"./chunks/framework.7c29c9c7.js";const l="/vue3-analysis/assets/build.a996e5ec.jpg",F=JSON.parse('{"title":"Vue3的项目构建","description":"","frontmatter":{},"headers":[],"relativePath":"start/build.md"}'),o={name:"start/build.md"},e=p(`<h1 id="vue3的项目构建" tabindex="-1">Vue3的项目构建 <a class="header-anchor" href="#vue3的项目构建" aria-label="Permalink to &quot;Vue3的项目构建&quot;">​</a></h1><blockquote><p>在github中fork一份Vu3的代码到自己的仓库，学习源码路程正式开始</p></blockquote><h2 id="安装依赖" tabindex="-1">安装依赖 <a class="header-anchor" href="#安装依赖" aria-label="Permalink to &quot;安装依赖&quot;">​</a></h2><p>1:该项目配置只能用pnpm安装，启动，在package.json的script中preinstall做了校验</p><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">preinstall</span><span style="color:#89DDFF;">&quot;</span><span style="color:#A6ACCD;">: </span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">node ./scripts/preinstall.js</span><span style="color:#89DDFF;">&quot;</span></span>
<span class="line"></span></code></pre></div><p><img src="`+l+`" alt="vitepress init screenshot" style="border-radius:8px;"></p><h2 id="pnpm-run-dev命令执行流程" tabindex="-1">pnpm run dev命令执行流程 <a class="header-anchor" href="#pnpm-run-dev命令执行流程" aria-label="Permalink to &quot;pnpm run dev命令执行流程&quot;">​</a></h2><ul><li><ol><li><p>先执行script文件夹中的dev.js, 改文件处理命令 环境变量有：</p><p>TARGET：需要编译的文件夹（有compiler-core, compiler-dom, reactivity等等）默认是vue文件夹；</p><p>FORMATS：表示编译的格式</p><p>COMMIT：git提交的日志</p></li></ol></li></ul><p>案例：rollup -c --environment BUILD:production</p><p>表示注入环境变量，可以通过p<wbr>rocess.env.BUILD拿到production的值</p><p>实际上执行： <code>vue3构建命名：rollup -wc --environment COMMIT:xxx,TARGET:vue,FORMATS:global</code></p><ul><li><ol start="2"><li>解析命令行之后，就开始执行rollup.config.js文件</li></ol><p>获取TARGET文件夹的package.json的内容，既vue/pageage.json内容</p><p>packageOptions = pkg.buildOptions 最终packageConfigs是一个数组</p><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">  [</span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">      </span><span style="color:#F07178;">input</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> xxx</span><span style="color:#89DDFF;">/</span><span style="color:#A6ACCD;">packges</span><span style="color:#89DDFF;">/</span><span style="color:#A6ACCD;">vue</span><span style="color:#89DDFF;">/</span><span style="color:#A6ACCD;">src</span><span style="color:#89DDFF;">/</span><span style="color:#A6ACCD;">index</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">js</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">      </span><span style="color:#F07178;">output</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> xxx</span><span style="color:#89DDFF;">/</span><span style="color:#A6ACCD;">packges</span><span style="color:#89DDFF;">/</span><span style="color:#A6ACCD;">vue</span><span style="color:#89DDFF;">/</span><span style="color:#A6ACCD;">dist</span><span style="color:#89DDFF;">/</span><span style="color:#A6ACCD;">vue</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">global</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">js</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;">]</span></span>
<span class="line"></span></code></pre></div></li></ul><p>入口文件就是指向<code>packges/vue/src/index.js</code></p><p>注意一点的就是在入口文件import的路径别名是在tsconfig.json配置的 配置项是：</p><div class="language-json"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">paths</span><span style="color:#89DDFF;">&quot;</span><span style="color:#A6ACCD;">: </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">&quot;</span><span style="color:#C792EA;">@vue/*</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">packages</span><span style="color:#A6ACCD;">\\/</span><span style="color:#C3E88D;">*</span><span style="color:#A6ACCD;">\\/</span><span style="color:#C3E88D;">src</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">],</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">&quot;</span><span style="color:#C792EA;">vue</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">packages/vue/src</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><p>这时候就完成了yarn dev命令的构建</p><h2 id="执行单独模块" tabindex="-1">执行单独模块： <a class="header-anchor" href="#执行单独模块" aria-label="Permalink to &quot;执行单独模块：&quot;">​</a></h2><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">npm run dev template-explorer</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h2 id="git-fork代码保持与原代码同步" tabindex="-1">git fork代码保持与原代码同步 <a class="header-anchor" href="#git-fork代码保持与原代码同步" aria-label="Permalink to &quot;git fork代码保持与原代码同步&quot;">​</a></h2><p>remote_origin 相当于 vue-next</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">git remote add remote_origin git@github.com:***/***.git</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">git fetch remote_origin</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">git merge remote_origin/master</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div>`,21),t=[e];function c(r,i,D,y,C,u){return n(),a("div",null,t)}const d=s(o,[["render",c]]);export{F as __pageData,d as default};
