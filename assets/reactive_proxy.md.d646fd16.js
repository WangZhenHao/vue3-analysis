import{_ as s,c as n,o as a,N as l}from"./chunks/framework.7c29c9c7.js";const u=JSON.parse('{"title":"Proxy特性在Vue3的应用","description":"","frontmatter":{},"headers":[],"relativePath":"reactive/proxy.md"}'),p={name:"reactive/proxy.md"},e=l(`<h1 id="proxy特性在vue3的应用" tabindex="-1">Proxy特性在Vue3的应用 <a class="header-anchor" href="#proxy特性在vue3的应用" aria-label="Permalink to &quot;Proxy特性在Vue3的应用&quot;">​</a></h1><h2 id="简单实现vue3响应式" tabindex="-1">简单实现Vue3响应式 <a class="header-anchor" href="#简单实现vue3响应式" aria-label="Permalink to &quot;简单实现Vue3响应式&quot;">​</a></h2><p>通过Vue3源码的抽丝剥茧，整理一个简单的应用，通过修改对象属性，实现html页面的更新</p><h2 id="实例代码" tabindex="-1">实例代码 <a class="header-anchor" href="#实例代码" aria-label="Permalink to &quot;实例代码&quot;">​</a></h2><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">&lt;!DOCTYPE html&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">&lt;html lang=&quot;en&quot;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">&lt;head&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">    &lt;meta charset=&quot;UTF-8&quot;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">    &lt;meta</span></span>
<span class="line"><span style="color:#A6ACCD;">        name=&quot;viewport&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">        content=&quot;width=device-width, initial-scale=1.0&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">    &gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">    &lt;title&gt;Document&lt;/title&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">&lt;/head&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">&lt;body&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">    &lt;div id=&quot;app&quot;&gt;&lt;/div&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">    &lt;script&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">        var effectActive = null;</span></span>
<span class="line"><span style="color:#A6ACCD;">        var targetMap = new WeakMap();</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">        var track = function (target, key) {</span></span>
<span class="line"><span style="color:#A6ACCD;">            var depsMap = targetMap.get(target);</span></span>
<span class="line"><span style="color:#A6ACCD;">            if (!depsMap) {</span></span>
<span class="line"><span style="color:#A6ACCD;">                depsMap = new Map();</span></span>
<span class="line"><span style="color:#A6ACCD;">                targetMap.set(target, depsMap)</span></span>
<span class="line"><span style="color:#A6ACCD;">            }</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">            var dep = depsMap.get(key)</span></span>
<span class="line"><span style="color:#A6ACCD;">            if (!dep) {</span></span>
<span class="line"><span style="color:#A6ACCD;">                dep = new Set();</span></span>
<span class="line"><span style="color:#A6ACCD;">                depsMap.set(key, dep)</span></span>
<span class="line"><span style="color:#A6ACCD;">            }</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">            if (!dep.has(effectActive)) {</span></span>
<span class="line"><span style="color:#A6ACCD;">                dep.add(effectActive)</span></span>
<span class="line"><span style="color:#A6ACCD;">            }</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">            // console.log(targetMap)</span></span>
<span class="line"><span style="color:#A6ACCD;">        }</span></span>
<span class="line"><span style="color:#A6ACCD;">        var trigger = function (target, type, key, value, oldValue) {</span></span>
<span class="line"><span style="color:#A6ACCD;">            var depsMap = targetMap.get(target);</span></span>
<span class="line"><span style="color:#A6ACCD;">            if (!depsMap) {</span></span>
<span class="line"><span style="color:#A6ACCD;">                return;</span></span>
<span class="line"><span style="color:#A6ACCD;">            }</span></span>
<span class="line"><span style="color:#A6ACCD;">            var deps = []</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span></span>
<span class="line"><span style="color:#A6ACCD;">            if (key !== void 0) {</span></span>
<span class="line"><span style="color:#A6ACCD;">                deps.push(depsMap.get(key))</span></span>
<span class="line"><span style="color:#A6ACCD;">            }</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">            triggerEffects(deps[0])</span></span>
<span class="line"><span style="color:#A6ACCD;">            // if (deps.length === 1) {</span></span>
<span class="line"><span style="color:#A6ACCD;">            //     triggerEffects(deps[0])</span></span>
<span class="line"><span style="color:#A6ACCD;">            // } else {</span></span>
<span class="line"><span style="color:#A6ACCD;">            //     const effects = []</span></span>
<span class="line"><span style="color:#A6ACCD;">            //     for (const dep of deps) {</span></span>
<span class="line"><span style="color:#A6ACCD;">            //         if (dep) {</span></span>
<span class="line"><span style="color:#A6ACCD;">            //             effects.push(...dep)</span></span>
<span class="line"><span style="color:#A6ACCD;">            //         }</span></span>
<span class="line"><span style="color:#A6ACCD;">            //     }</span></span>
<span class="line"><span style="color:#A6ACCD;">            //     triggerEffects(new Set(effects))</span></span>
<span class="line"><span style="color:#A6ACCD;">            // }</span></span>
<span class="line"><span style="color:#A6ACCD;">        }</span></span>
<span class="line"><span style="color:#A6ACCD;">        var triggerEffects = function (deps) {</span></span>
<span class="line"><span style="color:#A6ACCD;">            const effects = Array.isArray(deps) ? deps : [...deps]</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">            for (const effect of effects) {</span></span>
<span class="line"><span style="color:#A6ACCD;">                if(effect.scheduler) {</span></span>
<span class="line"><span style="color:#A6ACCD;">                    effect.scheduler();</span></span>
<span class="line"><span style="color:#A6ACCD;">                } else {</span></span>
<span class="line"><span style="color:#A6ACCD;">                    effect.run();</span></span>
<span class="line"><span style="color:#A6ACCD;">                }</span></span>
<span class="line"><span style="color:#A6ACCD;">            }</span></span>
<span class="line"><span style="color:#A6ACCD;">        }</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">        var baseHandlers = {</span></span>
<span class="line"><span style="color:#A6ACCD;">            get(traget, key, receiver) {</span></span>
<span class="line"><span style="color:#A6ACCD;">                const res = Reflect.get(traget, key, receiver)</span></span>
<span class="line"><span style="color:#A6ACCD;">                track(traget, key)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">                if(typeof res === &#39;object&#39;) {</span></span>
<span class="line"><span style="color:#A6ACCD;">                    return reactive(res)</span></span>
<span class="line"><span style="color:#A6ACCD;">                }</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">                return res;</span></span>
<span class="line"><span style="color:#A6ACCD;">            },</span></span>
<span class="line"><span style="color:#A6ACCD;">            set(target, key, value, reactiver) {</span></span>
<span class="line"><span style="color:#A6ACCD;">                var oldValue = target[key]</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">                const hadKey = Object.prototype.hasOwnProperty.call(target, key)</span></span>
<span class="line"><span style="color:#A6ACCD;">                const result = Reflect.set(target, key, value, reactiver)</span></span>
<span class="line"><span style="color:#A6ACCD;">                </span></span>
<span class="line"><span style="color:#A6ACCD;">                if (!hadKey) {</span></span>
<span class="line"><span style="color:#A6ACCD;">                    trigger(target, &#39;ADD&#39;, key, value)</span></span>
<span class="line"><span style="color:#A6ACCD;">                } else if (value !== oldValue) {</span></span>
<span class="line"><span style="color:#A6ACCD;">                    trigger(target, &#39;SET&#39;, key, value, oldValue)</span></span>
<span class="line"><span style="color:#A6ACCD;">                }</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">                return result</span></span>
<span class="line"><span style="color:#A6ACCD;">            }</span></span>
<span class="line"><span style="color:#A6ACCD;">        }</span></span>
<span class="line"><span style="color:#A6ACCD;">        var reactive = function (target) {</span></span>
<span class="line"><span style="color:#A6ACCD;">            var proxy = new Proxy(target, baseHandlers)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">            return proxy</span></span>
<span class="line"><span style="color:#A6ACCD;">        }</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">        var ReactiveEffect = function (fn, scheduler) {</span></span>
<span class="line"><span style="color:#A6ACCD;">            this.fn = fn;</span></span>
<span class="line"><span style="color:#A6ACCD;">            this.scheduler = scheduler;</span></span>
<span class="line"><span style="color:#A6ACCD;">        }</span></span>
<span class="line"><span style="color:#A6ACCD;">        ReactiveEffect.prototype.run = function () {</span></span>
<span class="line"><span style="color:#A6ACCD;">            try {</span></span>
<span class="line"><span style="color:#A6ACCD;">                effectActive = this</span></span>
<span class="line"><span style="color:#A6ACCD;">                return this.fn();</span></span>
<span class="line"><span style="color:#A6ACCD;">            } finally {</span></span>
<span class="line"><span style="color:#A6ACCD;">            }</span></span>
<span class="line"><span style="color:#A6ACCD;">        }</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">        var queue = [];</span></span>
<span class="line"><span style="color:#A6ACCD;">        var currentFlushPromise = null;</span></span>
<span class="line"><span style="color:#A6ACCD;">        var resolvedPromise = Promise.resolve();</span></span>
<span class="line"><span style="color:#A6ACCD;">        var count = 0</span></span>
<span class="line"><span style="color:#A6ACCD;">        function flushJobs(seen) {</span></span>
<span class="line"><span style="color:#A6ACCD;">            try {</span></span>
<span class="line"><span style="color:#A6ACCD;">                // ++count</span></span>
<span class="line"><span style="color:#A6ACCD;">                // console.log(count)</span></span>
<span class="line"><span style="color:#A6ACCD;">                for(var flushIndex = 0; flushIndex &lt; queue.length; flushIndex++) {</span></span>
<span class="line"><span style="color:#A6ACCD;">                    let job = queue[flushIndex]</span></span>
<span class="line"><span style="color:#A6ACCD;">                    job();</span></span>
<span class="line"><span style="color:#A6ACCD;">                }</span></span>
<span class="line"><span style="color:#A6ACCD;">            } finally {</span></span>
<span class="line"><span style="color:#A6ACCD;">                queue.length = 0;</span></span>
<span class="line"><span style="color:#A6ACCD;">            }</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span></span>
<span class="line"><span style="color:#A6ACCD;">        }</span></span>
<span class="line"><span style="color:#A6ACCD;">        /**</span></span>
<span class="line"><span style="color:#A6ACCD;">            多次修改值更新一次视图        </span></span>
<span class="line"><span style="color:#A6ACCD;">        */</span></span>
<span class="line"><span style="color:#A6ACCD;">        function queseJob(job) {</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span></span>
<span class="line"><span style="color:#A6ACCD;">            if(!queue.length || !queue.includes(job)) {</span></span>
<span class="line"><span style="color:#A6ACCD;">                queue.push(job)</span></span>
<span class="line"><span style="color:#A6ACCD;">                currentFlushPromise = resolvedPromise.then(flushJobs)</span></span>
<span class="line"><span style="color:#A6ACCD;">            }</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">            </span></span>
<span class="line"><span style="color:#A6ACCD;">            // setTimeout(() =&gt; {</span></span>
<span class="line"><span style="color:#A6ACCD;">            //     flushJobs</span></span>
<span class="line"><span style="color:#A6ACCD;">            // })</span></span>
<span class="line"><span style="color:#A6ACCD;">        }</span></span>
<span class="line"><span style="color:#A6ACCD;">    &lt;/script&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">    &lt;script&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">        var form = {</span></span>
<span class="line"><span style="color:#A6ACCD;">            name: &#39;wzh&#39;,</span></span>
<span class="line"><span style="color:#A6ACCD;">            age: &#39;15&#39;,</span></span>
<span class="line"><span style="color:#A6ACCD;">            count: { </span></span>
<span class="line"><span style="color:#A6ACCD;">                a: 0</span></span>
<span class="line"><span style="color:#A6ACCD;">             }</span></span>
<span class="line"><span style="color:#A6ACCD;">        }</span></span>
<span class="line"><span style="color:#A6ACCD;">        var data = reactive(form)</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span></span>
<span class="line"><span style="color:#A6ACCD;">        var updateComponent = function () {</span></span>
<span class="line"><span style="color:#A6ACCD;">            var dom = document.querySelector(&#39;#app&#39;)</span></span>
<span class="line"><span style="color:#A6ACCD;">            var render = \`</span></span>
<span class="line"><span style="color:#A6ACCD;">            &lt;p&gt;\${data.name}&lt;/p&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">            &lt;p&gt;\${data.age}&lt;/p&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">            &lt;h1&gt;count: \${data.count.a}&lt;/h1&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">            &lt;h1&gt;count2: \${data.count2 ? data.count2 : &#39;&#39;}&lt;/h1&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">            \`</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">            dom.innerHTML = render;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">            return dom;</span></span>
<span class="line"><span style="color:#A6ACCD;">        }</span></span>
<span class="line"><span style="color:#A6ACCD;">        var update = () =&gt; {</span></span>
<span class="line"><span style="color:#A6ACCD;">            effect.run();</span></span>
<span class="line"><span style="color:#A6ACCD;">        }</span></span>
<span class="line"><span style="color:#A6ACCD;">        var effect = new ReactiveEffect(updateComponent, () =&gt; queseJob(update))</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">        update()</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">        setTimeout(() =&gt; {</span></span>
<span class="line"><span style="color:#A6ACCD;">            data.count2 = &#39;未定义&#39;</span></span>
<span class="line"><span style="color:#A6ACCD;">            data.count.a = 1</span></span>
<span class="line"><span style="color:#A6ACCD;">        }, 1000);</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">        // setTimeout(() =&gt; {</span></span>
<span class="line"><span style="color:#A6ACCD;">        //     data.count2 = &#39;未定义2&#39;</span></span>
<span class="line"><span style="color:#A6ACCD;">        //     data.count.a = 2</span></span>
<span class="line"><span style="color:#A6ACCD;">        // }, 3000);</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">        setInterval(() =&gt; {</span></span>
<span class="line"><span style="color:#A6ACCD;">            data.count.a++</span></span>
<span class="line"><span style="color:#A6ACCD;">        }, 3000)</span></span>
<span class="line"><span style="color:#A6ACCD;">    &lt;/script&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">&lt;/body&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">&lt;/html&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div>`,5),o=[e];function t(c,A,C,r,i,y){return a(),n("div",null,o)}const d=s(p,[["render",t]]);export{u as __pageData,d as default};
