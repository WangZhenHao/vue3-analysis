import{_ as e,c as n,o as l,N as a,x as s,a as t}from"./chunks/framework.7c29c9c7.js";const _=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"reactive/data.md"}'),p={name:"reactive/data.md"},o=a('<blockquote><p>问题：没有在data定义属性，但是在新增一个属性的时候，是如何更新视图的呢？</p></blockquote><h3 id="data中的form没有定义text属性-但是修改form-text的时候-却可以更新视图" tabindex="-1">data中的form没有定义text属性，但是修改form.text的时候，却可以更新视图 <a class="header-anchor" href="#data中的form没有定义text属性-但是修改form-text的时候-却可以更新视图" aria-label="Permalink to &quot;data中的form没有定义text属性，但是修改form.text的时候，却可以更新视图&quot;">​</a></h3><ol><li>data使用了new Proxy()封装<code>instance.data = reactive(data)</code>-&gt;packages\\runtime-core\\src\\componentOptions.ts</li></ol><p>1-1. 这时候，data里面定义的值，有个get和set属性</p><ol start="2"><li>开始执行render函数生成vnode，在这个过程中就会触发get方法，处理如下： <code>packages\\reactivity\\src\\baseHandlers.ts-&gt; createGetter(isReadonly = false, shallow = false)</code></li></ol><p>2-1. 当取值form.msg 的时候，执行track(target, TrackOpTypes.GET, key)</p><p>2-2. 定义const targetMap = new WeakMap()全局变量</p>',7),c=s("ul",null,[s("li",null,[s("p",null,"判断{msg: 'hello vue'},也就是form对象有没有new Map()对象，如果没有创建一个")]),s("li",{"msg:":"",hello:"",vue:""},[s("p",null,"targetMap.set(target, (depsMap = new Map()))，target就是")]),s("li",null,[s("p",null,"depsMaps类似对象，存储key作为键值命")]),s("li",null,[s("p",null,"判断let dep = depsMap.get(key) 中的dep有没有值，如果没有创建一个dep = new Set()")]),s("li",null,[s("p",null,[t("添加依赖dep.add(activeEffect!) "),s("code",null,"ReactiveEffect2为渲染函数")])]),s("li",null,[s("p",null,"dep类似数组，存储渲染函数")])],-1),r=a(`<p>这时候会得到一个类似的对象</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">targetMap = {</span></span>
<span class="line"><span style="color:#A6ACCD;">    {msg: &#39;hello vue&#39;}: {</span></span>
<span class="line"><span style="color:#A6ACCD;">       msg: [ReactiveEffect2]</span></span>
<span class="line"><span style="color:#A6ACCD;">    }</span></span>
<span class="line"><span style="color:#A6ACCD;">}</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>2-3. 当取值form.text的时候，执行track(target, TrackOpTypes.GET, key)</p>`,3),i=s("ul",null,[s("li",{"msg:":"",hello:"",vue:""},"targetMap.set(target, (depsMap = new Map()))，target就是"),s("li",null,"由于depsMaps已经有了，所以不需要重新创建，取值let dep = depsMap.get(key)，这里的key也就是text"),s("li",null,"判断dep有没有，这里发现不存在，于是创建一个dep = new Set()"),s("li",null,"添加依赖dep.add(activeEffect!)")],-1),C=a(`<p>这时候会得到一个类似的对象</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">targetMap = {</span></span>
<span class="line"><span style="color:#A6ACCD;">    {msg: &#39;hello vue&#39;}: {</span></span>
<span class="line"><span style="color:#A6ACCD;">    msg: [ReactiveEffect2],</span></span>
<span class="line"><span style="color:#A6ACCD;">    text: [ReactiveEffect2]</span></span>
<span class="line"><span style="color:#A6ACCD;">    }</span></span>
<span class="line"><span style="color:#A6ACCD;">}</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><ol start="3"><li>修改text的是<code>this.form.text = &#39;add-text&#39;</code>,这个过程中会触发set方法，处理如下： packages\\reactivity\\src\\baseHandlers.ts-&gt; createSetter(shallow = false)</li></ol><p>3-0. 判断text是否存在form里面，保存布尔值变量hadKey</p><p>3-1. 执行<code>const result = Reflect.set(target, key, value, receiver)</code>对form对象设新的键值，form这时候变成了</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">form: { </span></span>
<span class="line"><span style="color:#A6ACCD;">    msg:&quot;hello vue&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">    text: &quot;add-text&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">}</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>3-2. hadkey为false,执行 <code>trigger(target, TriggerOpTypes.ADD, key, value)</code></p><p>3-3. 由于依赖收集对象targetMap是弱引用，这时候</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">targetMap = {</span></span>
<span class="line"><span style="color:#A6ACCD;">{msg: &#39;hello vue&#39;, text: &#39;change&#39;}: {</span></span>
<span class="line"><span style="color:#A6ACCD;">    msg: [ReactiveEffect2],</span></span>
<span class="line"><span style="color:#A6ACCD;">    text: [ReactiveEffect2]</span></span>
<span class="line"><span style="color:#A6ACCD;">}</span></span>
<span class="line"><span style="color:#A6ACCD;">}</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p><code>const depsMap = targetMap.get(target)</code> depsMap有值，赋值到deps.push(depsMap.get(key))</p><p>deps里面，key有text， deps这时候就是[ReactiveEffect2]了</p><p>3-4. 执行<code>triggerEffects(createDep(effects))</code>，循环遍历，执行<code>triggerEffect(effect, debuggerEventExtraInfo)</code></p><ul><li><p>判断渲染函数有没有scheduler，这个函数是一个异步函数，因为每次触发都会执行scheduler函数，所有都会同时执行queueJob函数(packages\\runtime-core\\src\\scheduler.ts)</p></li><li><p>queueJob函数会判断queue数组里面的值，如果还是相同的scheduler函数，就不插入数据了 是的只是更新一次渲染函数，是的性能更加好</p></li></ul><p>3-5. 最后出发触发render函数，生成新的vnode, 渲染真实DOM</p><h3 id="总结" tabindex="-1">总结： <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结：&quot;">​</a></h3><p>能够做到上面的更新视图效果，new Proxy起到了第一层作用，</p><p>第二层就是WeakMap, Map, Set这三个特性，起到了关键作用，用来搜集每一个属性的渲染函数</p><p>再触发的时候，通过WeakMap, Map, Set去查询该值的渲染函数，从而执行视图的更新</p><h2 id="相关代码" tabindex="-1">相关代码 <a class="header-anchor" href="#相关代码" aria-label="Permalink to &quot;相关代码&quot;">​</a></h2><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">&lt;!DOCTYPE html&gt;</span></span>
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
<span class="line"><span style="color:#A6ACCD;">    const { createApp } = Vue;</span></span>
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
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div>`,20),A=[o,c,r,i,C];function d(u,g,y,D,h,m){return l(),n("div",null,A)}const v=e(p,[["render",d]]);export{_ as __pageData,v as default};
