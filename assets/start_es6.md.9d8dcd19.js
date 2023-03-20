import{_ as s,c as a,o as n,N as l}from"./chunks/framework.7c29c9c7.js";const d=JSON.parse('{"title":"es6 特性 Proxy, Set, Map","description":"","frontmatter":{},"headers":[],"relativePath":"start/es6.md"}'),e={name:"start/es6.md"},p=l(`<h1 id="es6-特性-proxy-set-map" tabindex="-1">es6 特性 Proxy, Set, Map <a class="header-anchor" href="#es6-特性-proxy-set-map" aria-label="Permalink to &quot;es6 特性 Proxy, Set, Map&quot;">​</a></h1><h2 id="map" tabindex="-1">Map <a class="header-anchor" href="#map" aria-label="Permalink to &quot;Map&quot;">​</a></h2><p>Map 对象是键值对的集合。</p><p>Map 中的一个键只能出现一次；它在 Map 的集合中是独一无二的。Map 对象按键值对迭代——一个 for...of 循环在每次迭代后会返回一个形式为 [key，value] 的数组。迭代按插入顺序进行，即键值对按 set() 方法首次插入到集合中的顺序（也就是说，当调用 set() 时，map 中没有具有相同值的键）进行迭代。</p><p><a href="https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map" target="_blank" rel="noreferrer">https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map</a></p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">const contacts = new Map()</span></span>
<span class="line"><span style="color:#A6ACCD;">contacts.set(&#39;Jessie&#39;, {phone: &quot;213-555-1234&quot;, address: &quot;123 N 1st Ave&quot;})</span></span>
<span class="line"><span style="color:#A6ACCD;">contacts.has(&#39;Jessie&#39;) // true</span></span>
<span class="line"><span style="color:#A6ACCD;">contacts.get(&#39;Hilary&#39;) // undefined</span></span>
<span class="line"><span style="color:#A6ACCD;">contacts.set(&#39;Hilary&#39;, {phone: &quot;617-555-4321&quot;, address: &quot;321 S 2nd St&quot;})</span></span>
<span class="line"><span style="color:#A6ACCD;">contacts.get(&#39;Jessie&#39;) // {phone: &quot;213-555-1234&quot;, address: &quot;123 N 1st Ave&quot;}</span></span>
<span class="line"><span style="color:#A6ACCD;">contacts.delete(&#39;Raymond&#39;) // false</span></span>
<span class="line"><span style="color:#A6ACCD;">contacts.delete(&#39;Jessie&#39;) // true</span></span>
<span class="line"><span style="color:#A6ACCD;">console.log(contacts.size) // 1</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h2 id="weakmap" tabindex="-1">WeakMap <a class="header-anchor" href="#weakmap" aria-label="Permalink to &quot;WeakMap&quot;">​</a></h2><p>WeakMap 对象是一组键/值对的集合，其中的键是弱引用的。其键必须是对象，而值可以是任意的, WeakMap 的 key 只能是 Object 类型。 原始数据类型 是不能作为 key 的（比如 Symbol）。</p><p><a href="https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap" target="_blank" rel="noreferrer">https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap</a></p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">const wm1 = new WeakMap(),</span></span>
<span class="line"><span style="color:#A6ACCD;">wm2 = new WeakMap(),</span></span>
<span class="line"><span style="color:#A6ACCD;">wm3 = new WeakMap();</span></span>
<span class="line"><span style="color:#A6ACCD;">const o1 = {},</span></span>
<span class="line"><span style="color:#A6ACCD;">    o2 = function() {},</span></span>
<span class="line"><span style="color:#A6ACCD;">    o3 = window;</span></span>
<span class="line"><span style="color:#A6ACCD;">wm1.set(o1, 37);</span></span>
<span class="line"><span style="color:#A6ACCD;">wm1.set(o2, &#39;azerty&#39;);</span></span>
<span class="line"><span style="color:#A6ACCD;">wm2.set(o1, o2); // value 可以是任意值，包括一个对象或一个函数</span></span>
<span class="line"><span style="color:#A6ACCD;">wm2.set(o3, undefined);</span></span>
<span class="line"><span style="color:#A6ACCD;">wm2.set(wm1, wm2); // 键和值可以是任意对象，甚至另外一个 WeakMap 对象</span></span>
<span class="line"><span style="color:#A6ACCD;">wm1.get(o2); // &quot;azerty&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">wm2.get(o2); // undefined，wm2 中没有 o2 这个键</span></span>
<span class="line"><span style="color:#A6ACCD;">wm2.get(o3); // undefined，值就是 undefined</span></span>
<span class="line"><span style="color:#A6ACCD;">wm1.has(o2); // true</span></span>
<span class="line"><span style="color:#A6ACCD;">wm2.has(o2); // false</span></span>
<span class="line"><span style="color:#A6ACCD;">wm2.has(o3); // true (即使值是 undefined)</span></span>
<span class="line"><span style="color:#A6ACCD;">wm3.set(o1, 37);</span></span>
<span class="line"><span style="color:#A6ACCD;">wm3.get(o1); // 37</span></span>
<span class="line"><span style="color:#A6ACCD;">wm1.has(o1); // true</span></span>
<span class="line"><span style="color:#A6ACCD;">wm1.delete(o1);</span></span>
<span class="line"><span style="color:#A6ACCD;">wm1.has(o1); // false</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h2 id="set" tabindex="-1">Set <a class="header-anchor" href="#set" aria-label="Permalink to &quot;Set&quot;">​</a></h2><p>Set 对象允许你存储任何类型的唯一值，无论是原始值或者是对象引用。类似数组</p><p>因为 Set 中的值总是唯一的，所以需要判断两个值是否相等。在 ECMAScript 规范的早期版本中，这不是基于和===操作符中使用的算法相同的算法。具体来说，对于 Set，+0（+0 严格相等于 -0）和 -0 是不同的值。然而，在 ECMAScript 2015 规范中这点已被更改。有关详细信息，请参阅浏览器兼容性表中的“Key equality for -0 and 0”。 另外，NaN 和 undefined 都可以被存储在 Set 中，NaN 之间被视为相同的值（NaN 被认为是相同的，尽管 NaN !== NaN）。</p><p><a href="https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set" target="_blank" rel="noreferrer">https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set</a></p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">let mySet = new Set();</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">mySet.add(1); // Set [ 1 ]</span></span>
<span class="line"><span style="color:#A6ACCD;">mySet.add(5); // Set [ 1, 5 ]</span></span>
<span class="line"><span style="color:#A6ACCD;">mySet.add(5); // Set [ 1, 5 ]</span></span>
<span class="line"><span style="color:#A6ACCD;">mySet.add(&quot;some text&quot;); // Set [ 1, 5, &quot;some text&quot; ]</span></span>
<span class="line"><span style="color:#A6ACCD;">let o = {a: 1, b: 2};</span></span>
<span class="line"><span style="color:#A6ACCD;">mySet.add(o);</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">mySet.add({a: 1, b: 2}); // o 指向的是不同的对象，所以没问题</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">mySet.has(1); // true</span></span>
<span class="line"><span style="color:#A6ACCD;">mySet.has(3); // false</span></span>
<span class="line"><span style="color:#A6ACCD;">mySet.has(5);              // true</span></span>
<span class="line"><span style="color:#A6ACCD;">mySet.has(Math.sqrt(25));  // true</span></span>
<span class="line"><span style="color:#A6ACCD;">mySet.has(&quot;Some Text&quot;.toLowerCase()); // true</span></span>
<span class="line"><span style="color:#A6ACCD;">mySet.has(o); // true</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">mySet.size; // 5</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">mySet.delete(5);  // true，从 set 中移除 5</span></span>
<span class="line"><span style="color:#A6ACCD;">mySet.has(5);     // false, 5 已经被移除</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">mySet.size; // 4，刚刚移除一个值</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">console.log(mySet);</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h2 id="相关代码" tabindex="-1">相关代码 <a class="header-anchor" href="#相关代码" aria-label="Permalink to &quot;相关代码&quot;">​</a></h2><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">&lt;!DOCTYPE html&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">&lt;html lang=&quot;en&quot;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">&lt;head&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">  &lt;meta charset=&quot;UTF-8&quot;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">  &lt;meta name=&quot;viewport&quot; content=&quot;width=device-width, initial-scale=1.0&quot;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">  &lt;title&gt;Document&lt;/title&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">&lt;/head&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">&lt;body&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">  &lt;script&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">    var obj = {</span></span>
<span class="line"><span style="color:#A6ACCD;">      a: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">      b: 2</span></span>
<span class="line"><span style="color:#A6ACCD;">    }</span></span>
<span class="line"><span style="color:#A6ACCD;">    var p = new Proxy(obj, {</span></span>
<span class="line"><span style="color:#A6ACCD;">      get(target, key, value) {</span></span>
<span class="line"><span style="color:#A6ACCD;">        console.log(&#39;触发get&#39;, target, key, value)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">        return target[key]</span></span>
<span class="line"><span style="color:#A6ACCD;">      },</span></span>
<span class="line"><span style="color:#A6ACCD;">      set(target, key, value) {</span></span>
<span class="line"><span style="color:#A6ACCD;">        console.log(&#39;触发set&#39;, target, key, value)</span></span>
<span class="line"><span style="color:#A6ACCD;">        target[key] = value</span></span>
<span class="line"><span style="color:#A6ACCD;">      }</span></span>
<span class="line"><span style="color:#A6ACCD;">    })</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">    var a = p.a;</span></span>
<span class="line"><span style="color:#A6ACCD;">    p.c = 3</span></span>
<span class="line"><span style="color:#A6ACCD;">    var c = p.c</span></span>
<span class="line"><span style="color:#A6ACCD;">    // console.log(p)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">    /* 声明响应函数cb */</span></span>
<span class="line"><span style="color:#A6ACCD;">    const effectStack = []</span></span>
<span class="line"><span style="color:#A6ACCD;">    function effect(cb){  // 对函数进行高阶封装  </span></span>
<span class="line"><span style="color:#A6ACCD;">      const rxEffect = function(){    </span></span>
<span class="line"><span style="color:#A6ACCD;">        // 1.捕获异常    </span></span>
<span class="line"><span style="color:#A6ACCD;">        // 2.fn出栈入栈    </span></span>
<span class="line"><span style="color:#A6ACCD;">        // 3.执行fn    </span></span>
<span class="line"><span style="color:#A6ACCD;">        try{      </span></span>
<span class="line"><span style="color:#A6ACCD;">          effectStack.push(rxEffect)      </span></span>
<span class="line"><span style="color:#A6ACCD;">          return cb()  </span></span>
<span class="line"><span style="color:#A6ACCD;">        } finally{</span></span>
<span class="line"><span style="color:#A6ACCD;">          effectStack.pop()</span></span>
<span class="line"><span style="color:#A6ACCD;">        }</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span></span>
<span class="line"><span style="color:#A6ACCD;">      } </span></span>
<span class="line"><span style="color:#A6ACCD;">       // 最初要执行一次,进行最初的依赖收集  </span></span>
<span class="line"><span style="color:#A6ACCD;">      rxEffect()</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">      return rxEffect</span></span>
<span class="line"><span style="color:#A6ACCD;">    }</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span></span>
<span class="line"><span style="color:#A6ACCD;">    // effect(function() {</span></span>
<span class="line"><span style="color:#A6ACCD;">    //   return 1</span></span>
<span class="line"><span style="color:#A6ACCD;">    // })</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">    </span></span>
<span class="line"><span style="color:#A6ACCD;">    /**</span></span>
<span class="line"><span style="color:#A6ACCD;">     Set</span></span>
<span class="line"><span style="color:#A6ACCD;">    */</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">    function testSet() {</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">    }</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">    // testSet()</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">    /*</span></span>
<span class="line"><span style="color:#A6ACCD;">     WeakMap</span></span>
<span class="line"><span style="color:#A6ACCD;">    */</span></span>
<span class="line"><span style="color:#A6ACCD;">    function testWeakMap(target) {</span></span>
<span class="line"><span style="color:#A6ACCD;">      var targetMap = new WeakMap();</span></span>
<span class="line"><span style="color:#A6ACCD;">      var depsMap = new Map();</span></span>
<span class="line"><span style="color:#A6ACCD;">      targetMap.set(target, depsMap)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">      console.log(targetMap, targetMap.get(target))</span></span>
<span class="line"><span style="color:#A6ACCD;">    }</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">    // testWeakMap({name: &#39;wzh&#39;, age: 12})</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">  &lt;/script&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">&lt;/body&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">&lt;/html&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div>`,17),t=[p];function o(c,r,C,A,i,y){return n(),a("div",null,t)}const u=s(e,[["render",o]]);export{d as __pageData,u as default};
