# render函数

>template模板经过编译会变成render函数，函数执行，就是生成vnode

## 疑问

>Vue编译的render函数为什么要用下划线`_`定义变量呢？

1. with语句，改变了作用域 在取值的时候，会触发Proxy.has操作符
   如果返回true，就会执行`Proxy.get`, 如果返回false, 就不执行`Proxy.get`

2. 所有Vue定义了`_`开头变量, 或者全局白名单，来跳过那些不需要执行`Proxy.get`

3. Vue实例定义了Proxy, 在执行`render`函数的时候，触发get的时候，根据不同的参加取值

packages\runtime-core\src\componentPublicInstance.ts
```js
const GLOBALS_WHITE_LISTED =
  'Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,' +
  'decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,' +
  'Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt'

export const isGloballyWhitelisted = /*#__PURE__*/ makeMap(GLOBALS_WHITE_LISTED)

export const RuntimeCompiledPublicInstanceProxyHandlers = /*#__PURE__*/ extend(
  {},
  PublicInstanceProxyHandlers,
  {
    get(target: ComponentRenderContext, key: string) {
      // fast path for unscopables when using `with` block
      if ((key as any) === Symbol.unscopables) {
        return
      }
      return PublicInstanceProxyHandlers.get!(target, key, target)
    },
    has(_: ComponentRenderContext, key: string) {
      const has = key[0] !== '_' && !isGloballyWhitelisted(key)
      if (__DEV__ && !has && PublicInstanceProxyHandlers.has!(_, key)) {
        warn(
          `Property ${JSON.stringify(
            key
          )} should not start with _ which is a reserved prefix for Vue internals.`
        )
      }
      return has
    }
  }
)
```

> 自定义的render函数，有什么区别？

1. 执行`setupComponent(instance)`packages\runtime-core\src\renderer.ts，里面处理了`data响应式,methods,props`等，处理`render函数`

2.  因为没有_rc标识，不执行`installWithProxy`方法
```js
export function registerRuntimeCompiler(_compile: any) {
  // debugger
  compile = _compile
  installWithProxy = i => {
    if (i.render!._rc) {
      i.withProxy = new Proxy(i.ctx, RuntimeCompiledPublicInstanceProxyHandlers)
    }
  }
}
```

3. 在执行`render`之前，`withProxy`为空， 所以取值`instance.proxy = markRaw(new Proxy(instance.ctx, PublicInstanceProxyHandlers))`packages\runtime-core\src\component.ts, 在生成vnode的时候，取值会执行`PublicInstanceProxyHandlers.get`方法

```js
const proxyToUse = withProxy || proxy
```



## 手写render

```js
const { createApp, h } = Vue;
    
var app = createApp({
    data() {
    return {
        form: {
           msg: 'hello vue',
        }
    }
    },
    render() {
       return h('h1', form.msg)
    },
    methods: {
    
    }
})

app.mount('#app')
```
## 总结：

Vue编译生成的render函数和自定义的render函数，对变量的取值，有一些微小的不同，
Vue编译的render函数，
- 使用with语句
- 过滤下划线变量，过滤关键字‘Infinity,undefined,NaN,isFinite,isNaN,parseFloat...’
- 定义Proxy使用`RuntimeCompiledPublicInstanceProxyHandlers`中的操作符

自定义render函数
- 定义Proxy使用`PublicInstanceProxyHandlers`中的操作符


## 相关代码
```html
// html模板
<div id="app">
    <ul>
        <li v-for="(item, index) in list">{{ item.name }}</li>
        <li>{{ list[0].name }}-dynamic</li>
        <li>static</li>
    </ul>
<button>static</button>
</div>
```
```js
// Vue生成的render函数
(function anonymous(
) {
const _Vue = Vue
const { createElementVNode: _createElementVNode } = _Vue

const _hoisted_1 = /*#__PURE__*/_createElementVNode("li", null, "static", -1 /* HOISTED */)
const _hoisted_2 = /*#__PURE__*/_createElementVNode("button", null, "static", -1 /* HOISTED */)

return function render(_ctx, _cache) {
  with (_ctx) {
    const { renderList: _renderList, Fragment: _Fragment, openBlock: _openBlock, createElementBlock: _createElementBlock, toDisplayString: _toDisplayString, createElementVNode: _createElementVNode } = _Vue

    return (_openBlock(), _createElementBlock(_Fragment, null, [
      _createElementVNode("ul", null, [
        (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(list, (item, index) => {
          return (_openBlock(), _createElementBlock("li", null, _toDisplayString(item.name), 1 /* TEXT */))
        }), 256 /* UNKEYED_FRAGMENT */)),
        _createElementVNode("li", null, _toDisplayString(list[0].name) + "-dynamic", 1 /* TEXT */),
        _hoisted_1
      ]),
      _hoisted_2
    ], 64 /* STABLE_FRAGMENT */))
  }
}
})
```

## 相关代码 
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/has

Proxy.has拦截
这个钩子可以拦截下面这些操作：

- 属性查询：`foo in proxy`

- 继承属性查询：`foo in Object.create(proxy)`

- with 检查: `with(proxy) { (foo); }`

- `Reflect.has()`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <script>
    var obj = {
      a: 1,
      b: 2
    }
    var p = new Proxy(obj, {
      get(target, key, value) {
        debugger
        if ((key) === Symbol.unscopables) {
          return
        }
        
        return target[key]
      },
      set(target, key, value) {
        // console.log('触发set', target, key, value)
        target[key] = value
      },
      has(target, key) {
        let has = key[0] !== '_'
        debugger
        return has
      }
    })

    // var a = p.a;
    // p.c = 3
    // var c = p.c
    
    const render = function(ctx) {
      const _con = console
      with(ctx) {
        _con.log(a)
      }
    }
    render.call(p, p)
  </script>
</body>
</html>  
```