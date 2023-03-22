# 组合式函数

个人认为是为了代码更加清晰，在使用的时候，是需要关注return那几个参数就可以了，内部处理逻辑由内部完成

## 执行流程

1. `createApp`函数是在packages\runtime-dom\src\index.ts中定义，
但是`createApp({xxx})`,传入参数的处理是在packages\runtime-core\src\apiCreateApp.ts中的createAppAPI函数
把参数存到`_component`里面，返回对象`{ mount, use, directive, component, mixin,unmount, .... }`

2. 初始化达到app对象之后，重写`app.mount`方法

3. 开始执行`app.mount('#app')`, 这个里面做了好多东西，细细拆分

3-1. 执行mount的方法，里面执行一个重要方法`render(vnode, rootContainer, isSVG)`

3-1-1. render函数是在packages\runtime-core\src\renderer.ts定义，该文件就是渲染函数的汇总，回到render函数的执行
在这个流程中主要是执行`patch(container._vnode || null, vnode, container, null, null, null, isSVG)`
```js
--->processComponent(
    n1,
    n2,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    isSVG,
    slotScopeIds,
    optimized
)
--->mountComponent(
    n2,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    isSVG,
    optimized
)
--->setupRenderEffect(
    instance,
    initialVNode,
    container,
    anchor,
    parentSuspense,
    isSVG,
    optimized
)
```

3-1-2. mountComponent 函数执行了一个非常重要的函数：`setupComponent(instance)` (packages\runtime-core\src\component.ts)
  - 1) 执行`setupStatefulComponent(instance, isSSR)`，判断有没有设置setup属性

  - 1-1）如果有setup属性，就执行setup属性，返回给setupResult变量
    ```js
    const setupResult = callWithErrorHandling(
        setup,
        instance,
        ErrorCodes.SETUP_FUNCTION,
        [__DEV__ ? shallowReadonly(instance.props) : instance.props, setupContext]
    )
    ```
   - 1-2) 执行 `instance.setupState = proxyRefs(setupResult)`。把返回的值插入到Vue实例里面，方便提取，为后面执行render函数，生成虚拟vnode，取值做铺垫

   - 2）然后执行finishComponentSetup->`finishComponentSetup(instance, isSSR)`

   - 2-1）finishComponentSetup做了一个非常重要的事情，就是添加了代理proxy
      `i.withProxy = new Proxy(i.ctx， RuntimeCompiledPublicInstanceProxyHandlers)`->packages\runtime-core\src\component.ts
    
  - 2-2）withProxy属性就有了所有访问`i.ctx`内容的能力，在执行render函数的时候
                 可以取到setup返回的值

3-1-3. `setupRenderEffect`函数做了一下非常重要的工作，
    定义了componentUpdateFn，该函数就是渲染函数，new ReactiveEffect的参数。
    之后每次的数据修改触发set，都会执行componentUpdateFn -> packages\runtime-core\src\renderer.ts  

3-1-4. componentUpdateFn 函数中
```js
  render!.call(
    proxyToUse,
    proxyToUse!,
    renderCache,
    props,
    setupState,
    data,
    ctx
    ) -> packages\runtime-core\src\componentRenderUtils.ts 
```
proxyToUse就是withProxy,取值的时候，会触发get方法   

4. 因为在setup里面属性添加了proxy，在生成vnode的时候，会触发get方法，然后就可以收集渲染函数了，在set的时候，就会触发渲染函数，实现更新

## 总结

compistionApi感觉就是为了代码更好维护，暴露出关键的数据，和方法，不需要关注组件里面做了什么。使得组件直接耦合清晰，方便维护

## 疑问

> 为什么ref定义的变量，如`cosnt test = ref(false)` 在函数setup里面用修改值需要引用value属性，而在模板使用值的时候，不需要引用value属性呢？

1. ref函数是在packages\reactivity\src\ref.ts产生，执行类`createRef`会返回一个新对象
传入的值作为参数，赋值到`this._value = __v_isShallow ? value : toReactive(value)`
  - 类createRef定义了`get value()` {}函数，this.value就是返回this._value

  - 调用取值的时候调用get value() {}方法，会触发渲染函数依赖的收集

  - set value() {}方法,会在设置值的时候，会触发渲染函数的执行

2. setup在Vue初始化的时候，会执行，在handleSetupResult函数里面，执行了一个非常重要函数`instance.setupState = proxyRefs(setupResult)`
    函数proxyRefs->packages\reactivity\src\ref.ts

2-1). 也就是定义proxy,定义了set，get函数，其中起get函数会的返回是执行unref(xxx)
            即：`get: (target, key, receiver) => unref(Reflect.get(target, key, receiver))`

unref函数如果是定义了ref对象，就会返回ref.value, 也就是为什么在模板那里不需要用value属性获取的最终原因，get操作符已经内部的处理

## 相关代码

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="../../dist/vue.global.js"></script>
</head>
<body>
    <div id="demo">
        <!-- <p>{{ detail.title }}</p> -->
        <p>{{ test.count }}</p>
        <button @click="showAlert">点击按钮</button>
    </div>
    

    <script>
        
        var { createApp, ref, reactive, onMounted  } = Vue;

        var app = createApp({
            setup() {
                var state = reactive({ title: '测试', test: 1 })
                var test = ref({ count: 1 });

                var showAlert = function() {
                    alert(1)
                }
                onMounted(() => {
                    console.log(test)
                })

                setInterval(() => {
                    // state.test++
                    test.value.count++
                }, 3000)

                return {
                    // detail: state,
                    test,
                    showAlert
                }
            }
        })
        app.mount('#demo')
    </script>
</body>
</html>
```