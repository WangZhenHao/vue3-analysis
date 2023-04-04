# 如何产生vnode？

1. 执行`app.mount('#app')`,  在packages\runtime-core\src\apiCreateApp.ts 的createAppAPI函数，执行`.mount(xx)`,会执行到
 `render(vnode, rootContainer, isSVG)`, render就是生成vnode，并且渲染vnode成为正式dom的函数

2. render函数在packages\runtime-core\src\renderer.ts 里面，vnode和渲染就是在这个函数开始

2-1. 接着执行`patch(container._vnode || null, vnode, container, null, null, null, isSVG)`
 
 - 第一个参数是新vnode, 第二个参数是旧的vnode, 第三个参数是节点对象（类似`document.querySelector('#app')`）

 - 判断vnode类型`shapeFlag & ShapeFlags.ELEMENT`, 相同的值，判断为true执行：

 ```js
processComponent(
    n1,
    n2,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    isSVG,
    slotScopeIds,
    optimized
)-->
mountComponent(
    n2,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    isSVG,
    optimized
)
 ```
由于是第一次渲染，所以执行`mountComponent`方法

3. `mountCompoent`执行两个很重要方法
```js
if (!(__COMPAT__ && compatMountInstance)) {
    if (__DEV__) {
    startMeasure(instance, `init`)
    }
    setupComponent(instance)
    if (__DEV__) {
    endMeasure(instance, `init`)
    }
}

setupRenderEffect(
    instance,
    initialVNode,
    container,
    anchor,
    parentSuspense,
    isSVG,
    optimized
)
```

- `setupComponent(instatnce)`packages\runtime-core\src\component.ts处理data响应式,methods,props，setup等参数，也是render函数生成的地方
  `finishComponentSetup(instance, isSSR)`-> `Component.render = compile(template, finalCompilerOptions)`

- 其中`finishComponentSetup`函数,对ctx进行处理，是的实例在执行render函数的时候可以访问data, methods等等， RuntimeCompiledPublicInstanceProxyHandlers
  函数定一个了set,get,has方式，用于对变量的预处理
```js
if (installWithProxy) {
    installWithProxy(instance)
}

i.withProxy = new Proxy(i.ctx, RuntimeCompiledPublicInstanceProxyHandlers)
```

- `setupComponent`做好了所有的准备工作，接着就是执行`setupRenderEffect`

3-1. `setupRenderEffect`可以说生成渲染函数的函数，`ReactiveEffect`对象就是渲染函数，data对象的属性搜集依赖
也就是收集`effct`函数实例，接着执行`effct.run()`,生成vnode,渲染真实dom的工作开始

```js
const effect = (instance.effect = new ReactiveEffect(
    componentUpdateFn,
    () => queueJob(update),
    instance.scope // track it in component's effect scope
))
```

- `componentUpdateFn`函数，主要执行生成vnode, 渲染真实dom

```js
const subTree = (instance.subTree = renderComponentRoot(instance))
->
patch(
    null,
    subTree,
    container,
    anchor,
    instance,
    parentSuspense,
    isSVG
)
```

- `renderComponentRoot(instance)`生成的虚拟节点有children， dynamicChildren这两个重要参数


- 下划线`_`定义的变量有硬性要求
