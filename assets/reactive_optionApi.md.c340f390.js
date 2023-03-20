import{_ as s,c as n,o as a,N as e}from"./chunks/framework.7c29c9c7.js";const y=JSON.parse('{"title":"Vue渲染流程","description":"","frontmatter":{},"headers":[],"relativePath":"reactive/optionApi.md"}'),p={name:"reactive/optionApi.md"},t=e(`<h1 id="vue渲染流程" tabindex="-1">Vue渲染流程 <a class="header-anchor" href="#vue渲染流程" aria-label="Permalink to &quot;Vue渲染流程&quot;">​</a></h1><h2 id="createapp函数是什么" tabindex="-1">createApp函数是什么？ <a class="header-anchor" href="#createapp函数是什么" aria-label="Permalink to &quot;createApp函数是什么？&quot;">​</a></h2><ol><li><p><code>packages\\runtime-dom\\src\\index.ts</code> 中，传入参数<code>{data:xxx, methods:xx}</code>， 执行<code>const app = ensureRenderer().createApp(...args)。</code> <code>ensureRender()</code>方法返回<code>{ render, hydrate, createApp }</code></p></li><li><p><code>ensureRenderer()</code> 的返回值由<code>baseCreateRenderer()</code>方法产生，在packages\\runtime-core\\src\\renderer.ts中</p></li><li><p><code>ensureRenderer()</code>的<code>creteApp</code>，函数是packages\\runtime-core\\src\\apiCreateApp.ts的createAppAPI方法</p></li></ol><p>createAppAPI就是接收了{data:xxx, methods:xx}的原始参数，该函数返回一个对象</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    use: xxx,</span></span>
<span class="line"><span style="color:#A6ACCD;">    mixin: xxx,</span></span>
<span class="line"><span style="color:#A6ACCD;">    component: xxx,</span></span>
<span class="line"><span style="color:#A6ACCD;">    directive: xxx,</span></span>
<span class="line"><span style="color:#A6ACCD;">    mount: xxx</span></span>
<span class="line"><span style="color:#A6ACCD;">} </span></span>
<span class="line"><span style="color:#A6ACCD;">这些就是很经常用到的方法了</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><ol start="4"><li><code>const app = ensureRenderer().createApp(...args)。</code></li></ol><p><code>app.mount</code> 被重写，获取根节点，判断<code>app._compnent</code>是不是函数，有没有<code>render函数</code>，template属性有没有值。如果都是否，就把html内容赋值到<code>app._compnent.template = container.innerHTML</code></p><p>4-1. 之后执行<code>createAppAPI.mount()方法</code>packages\\runtime-core\\src\\apiCreateApp.ts，由于改方法缓存了rootComponent属性，所有可以直接引用该属性， 执行createVnode方法，执行<code>render()</code>方法</p><p>该<code>render</code>方法是packages\\runtime-core\\src\\renderer.ts的<code>baseCreateRenderer的render</code>方法的传参</p><p>4-2. 执行<code>render(vnode, rootContainer, isSVG)</code>函数， 执行关键函数<code>patch-&gt;processComponent-&gt;mountComponent-&gt;setupComponent</code></p><p><code>setupComponent</code>方法在packages\\runtime-core\\src\\component.ts</p><p>生成了真正意义上的<code>render</code>函数.</p><pre><code>  1) \`Component.render = compile(template, finalCompilerOptions)\`
  template是写的html代码
  \`finalCompilerOptions\`. 配置\`delimiters，isCustomElement\`等

  2) 执行\`applyOptions(instance)\`-&gt;packages\\runtime-core\\src\\component.ts
    处理自定义的method，data,mounted生命周期等等，

    1-data定义成响应式属性\`instance.data\` = reactive(data)

    2-reactive在packages\\reactivity\\src\\reactive.ts中
</code></pre><ol start="5"><li><code>mountComponent</code>函数中执行完<code>setupComponent</code>之后，接下来开始执行<code>setupRenderEffect</code>函数了</li></ol><p>5-1. <code>setupComponent</code>执行<code>new ReactiveEffect(xxx)</code>, 把封装<code>componentUpdateFn</code>函数，里面就是包含数据更新，渲染的一个函数；如何执行<code>update()</code></p><p>1)update实际执行ReactiveEffect的run方法，</p><p>2)run方法执行componentUpdateFn函数</p><p>2-1）run里面有一个细节，activeEffect = this, 就是把当前的new ReactiveEffect(packages\\runtime-core\\src\\renderer.ts) 赋值到全局属性activeEffect中，主要是用于更新视图的依赖的收集</p><p>5-2. 执行<code>componentUpdateFn</code>(packages\\runtime-core\\src\\renderer.ts)函数，执行<code>instance.subTree = renderComponentRoot(instance)</code></p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">renderComponentRoot方法执行执行render函数，生成虚拟vnode</span></span>
<span class="line"><span style="color:#A6ACCD;">      result = normalizeVNode(</span></span>
<span class="line"><span style="color:#A6ACCD;">        render!.call(</span></span>
<span class="line"><span style="color:#A6ACCD;">          proxyToUse,</span></span>
<span class="line"><span style="color:#A6ACCD;">          proxyToUse!,</span></span>
<span class="line"><span style="color:#A6ACCD;">          renderCache,</span></span>
<span class="line"><span style="color:#A6ACCD;">          props,</span></span>
<span class="line"><span style="color:#A6ACCD;">          setupState,</span></span>
<span class="line"><span style="color:#A6ACCD;">          data,</span></span>
<span class="line"><span style="color:#A6ACCD;">          ctx</span></span>
<span class="line"><span style="color:#A6ACCD;">        )</span></span>
<span class="line"><span style="color:#A6ACCD;">      )</span></span>
<span class="line"><span style="color:#A6ACCD;">这时候会触发get方法，对activeEffect进行收集</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>5-3. 生成vnode值，就会触发proxy的createGetter-&gt;get()方法(packages\\reactivity\\src\\baseHandlers.ts)，执行<code>track()</code>方法收集依赖packages\\reactivity\\src\\effect.ts</p><ol><li>只有生成vnode的时候用到了data定义的数据，就会触发一次 track函数</li></ol><p>2）创建一个全局WeakMap()属性targetMap, target是对象，html模板的值 target作为WeakMap对象的键值，如果value没有值. 就创建一个Map()对象，并且设置一个Map对象 targetMap.set(target, (depsMap = new Map()))</p><p>3）Map()的值查询有没有Set()数组，如果没有. 就创建一个Set()对象,并且设置一个Set数组 depsMap.set(key, (dep = createDep()))</p><p>4）最后就是把更新视图的函数，设置到dep数组里面; dep数组可以判断是否是唯一</p><p>5-4. 拿到vnode之后，执行patch</p><ol start="6"><li>当有一个值改变的时候，就会触发proxy的set方法（packages\\reactivity\\src\\baseHandlers.ts）</li></ol><p>1）保存旧的值oldValue,</p><p>2）然后判断当前设置的key在对象中是否已经存在const hadKey=xxx;</p><p>3）如果hadKey是false, 执行trigger（packages\\reactivity\\src\\effect.ts）方法，传入add标识</p><p>4）如果两个值不一样，执行trigger方法，传入set标识</p><p>最终执行更新视图函数componentUpdateFn</p><h2 id="多次触发data的值-如何只更新一次视图" tabindex="-1">多次触发data的值，如何只更新一次视图 <a class="header-anchor" href="#多次触发data的值-如何只更新一次视图" aria-label="Permalink to &quot;多次触发data的值，如何只更新一次视图&quot;">​</a></h2><ol><li>定义new ReactiveEffect渲染函数的时候（packages\\runtime-core\\src\\renderer.ts），有一个scheduler参数</li></ol><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">const effect = (instance.effect = new ReactiveEffect(</span></span>
<span class="line"><span style="color:#A6ACCD;">    componentUpdateFn,</span></span>
<span class="line"><span style="color:#A6ACCD;">    () =&gt; queueJob(update),</span></span>
<span class="line"><span style="color:#A6ACCD;">    instance.scope</span></span>
<span class="line"><span style="color:#A6ACCD;">))</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>1-2. scheduler函数会在data属性触发的时候执行，因为每次触发都会执行scheduler函数，所有都会同时执行queueJob函数(packages\\runtime-core\\src\\scheduler.ts)</p><p>1-3: queueJob函数会判断queue数组里面的值，如果还是相同的scheduler函数，就不插入数据了</p><h2 id="相关代码" tabindex="-1">相关代码 <a class="header-anchor" href="#相关代码" aria-label="Permalink to &quot;相关代码&quot;">​</a></h2><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">&lt;!DOCTYPE html&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">&lt;html lang=&quot;en&quot;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">&lt;head&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">  &lt;meta charset=&quot;UTF-8&quot;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">  &lt;meta name=&quot;viewport&quot; content=&quot;width=device-width, initial-scale=1.0&quot;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">  &lt;title&gt;Document&lt;/title&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">  &lt;script src=&quot;../../dist/vue.global.js&quot;&gt;&lt;/script&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">&lt;/head&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">&lt;body&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">  &lt;div id=&quot;app&quot;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">    &lt;button @click=&quot;test&quot;&gt;{{ form.msg }} - {{ form.text}}&lt;/button&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">    &lt;button&gt;static&lt;/button&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">  &lt;/div&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">  &lt;script&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">    /**</span></span>
<span class="line"><span style="color:#A6ACCD;">    (function anonymous(</span></span>
<span class="line"><span style="color:#A6ACCD;">    ) {</span></span>
<span class="line"><span style="color:#A6ACCD;">    const _Vue = Vue</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">    return function render(_ctx, _cache) {</span></span>
<span class="line"><span style="color:#A6ACCD;">      with (_ctx) {</span></span>
<span class="line"><span style="color:#A6ACCD;">        const { toDisplayString: _toDisplayString, createVNode: _createVNode, openBlock: _openBlock, createBlock: _createBlock } = _Vue</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">        return (_openBlock(), _createBlock(&quot;button&quot;, { onClick: test }, _toDisplayString(form.msg) + &quot; - &quot; + _toDisplayString(form.text), 9 , [&quot;onClick&quot;]))</span></span>
<span class="line"><span style="color:#A6ACCD;">      }</span></span>
<span class="line"><span style="color:#A6ACCD;">    }</span></span>
<span class="line"><span style="color:#A6ACCD;">    })</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span></span>
<span class="line"><span style="color:#A6ACCD;">  */</span></span>
<span class="line"><span style="color:#A6ACCD;">    const { createApp } = Vue;</span></span>
<span class="line"><span style="color:#A6ACCD;">    // var a = Vue.createApp</span></span>
<span class="line"><span style="color:#A6ACCD;">    var app = createApp({</span></span>
<span class="line"><span style="color:#A6ACCD;">      data() {</span></span>
<span class="line"><span style="color:#A6ACCD;">        return {</span></span>
<span class="line"><span style="color:#A6ACCD;">          form: {</span></span>
<span class="line"><span style="color:#A6ACCD;">            msg: &#39;hello vue&#39;,</span></span>
<span class="line"><span style="color:#A6ACCD;">          }</span></span>
<span class="line"><span style="color:#A6ACCD;">        }</span></span>
<span class="line"><span style="color:#A6ACCD;">      },</span></span>
<span class="line"><span style="color:#A6ACCD;">      mounted() {</span></span>
<span class="line"><span style="color:#A6ACCD;">        setTimeout(() =&gt; {</span></span>
<span class="line"><span style="color:#A6ACCD;">          this.form.text = &#39;add-text&#39;;</span></span>
<span class="line"><span style="color:#A6ACCD;">        }, 3000)</span></span>
<span class="line"><span style="color:#A6ACCD;">        // setInterval(() =&gt; {</span></span>
<span class="line"><span style="color:#A6ACCD;">          // this.msg++</span></span>
<span class="line"><span style="color:#A6ACCD;">        // }, 1000);</span></span>
<span class="line"><span style="color:#A6ACCD;">      },</span></span>
<span class="line"><span style="color:#A6ACCD;">      methods: {</span></span>
<span class="line"><span style="color:#A6ACCD;">        test() {</span></span>
<span class="line"><span style="color:#A6ACCD;">          alert(1)</span></span>
<span class="line"><span style="color:#A6ACCD;">        }</span></span>
<span class="line"><span style="color:#A6ACCD;">      }</span></span>
<span class="line"><span style="color:#A6ACCD;">    })</span></span>
<span class="line"><span style="color:#A6ACCD;">    console.log(app)</span></span>
<span class="line"><span style="color:#A6ACCD;">    app.mount(&#39;#app&#39;)</span></span>
<span class="line"><span style="color:#A6ACCD;">  &lt;/script&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">&lt;/body&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">&lt;/html&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div>`,39),l=[t];function o(c,r,i,C,d,A){return a(),n("div",null,l)}const m=s(p,[["render",o]]);export{y as __pageData,m as default};
