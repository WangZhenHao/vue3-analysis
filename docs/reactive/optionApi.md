# Vue渲染流程

## optionApi执行流程

1. `packages\runtime-dom\src\index.ts` 中，传入参数`{data:xxx, methods:xx}`， 执行`const app = ensureRenderer().createApp(...args)。` `ensureRender()`方法返回`{ render, hydrate, createApp }`

2. `ensureRenderer()` 的返回值由`baseCreateRenderer()`方法产生，在packages\runtime-core\src\renderer.ts中

3. `ensureRenderer()`的`creteApp`，函数是packages\runtime-core\src\apiCreateApp.ts的createAppAPI方法

createAppAPI就是接收了`{data:xxx, methods:xx}`的原始参数，该函数返回一个对象

```js
{
    use: xxx,
    mixin: xxx,
    component: xxx,
    directive: xxx,
    mount: xxx
} 
这些就是很经常用到的方法了

```

4. `const app = ensureRenderer().createApp(...args)。`

`app.mount` 被重写，获取根节点，判断`app._compnent`是不是函数，有没有`render函数`，template属性有没有值。如果都是否，就把html内容赋值到`app._compnent.template = container.innerHTML`

4-1. 之后执行`createAppAPI.mount()方法`packages\runtime-core\src\apiCreateApp.ts，由于改方法缓存了rootComponent属性，所有可以直接引用该属性， 执行createVnode方法，执行`render(vnode, rootContainer, isSVG)`方法

该`render`方法是packages\runtime-core\src\renderer.ts的`baseCreateRenderer的render`方法的传参

4-2. 执行`render(vnode, rootContainer, isSVG)`函数， 执行关键函数`patch->processComponent->mountComponent->setupComponent`

 `setupComponent`方法在packages\runtime-core\src\component.ts

 生成了真正意义上的`render`函数. 

1) `Component.render = compile(template, finalCompilerOptions)`
template是写的html代码
`finalCompilerOptions`. 配置`delimiters，isCustomElement`等

2) 执行`applyOptions(instance)`->packages\runtime-core\src\component.ts
处理自定义的method，data,mounted生命周期等等，

- data定义成响应式属性`instance.data` = reactive(data)

- reactive在packages\reactivity\src\reactive.ts中

5. `mountComponent`函数中执行完`setupComponent`之后，接下来开始执行`setupRenderEffect`函数了

5-1. `setupComponent`执行`new ReactiveEffect(xxx)`, 把封装`componentUpdateFn`函数，里面就是包含数据更新，渲染的一个函数；如何执行`update()`

1)update实际执行ReactiveEffect的run方法，

2)run方法执行componentUpdateFn函数

2-1）run里面有一个细节，activeEffect = this, 就是把当前的new ReactiveEffect(packages\runtime-core\src\renderer.ts)
赋值到全局属性activeEffect中，主要是用于更新视图的依赖的收集

5-2. 执行`componentUpdateFn`(packages\runtime-core\src\renderer.ts)函数，执行`instance.subTree = renderComponentRoot(instance)`

```js
// renderComponentRoot方法执行执行render函数，生成虚拟vnode
      result = normalizeVNode(
        render!.call(
          proxyToUse,
          proxyToUse!,
          renderCache,
          props,
          setupState,
          data,
          ctx
        )
      )
// 这时候会触发get方法，对activeEffect进行收集
```
5-3. 生成vnode值，就会触发proxy的createGetter->get()方法(packages\reactivity\src\baseHandlers.ts)，执行`track()`方法收集依赖packages\reactivity\src\effect.ts

```js
export const targetMap = new WeakMap<any, KeyToDepMap>()

export function track(target: object, type: TrackOpTypes, key: unknown) {
  if (shouldTrack && activeEffect) {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if (!dep) {
      depsMap.set(key, (dep = createDep()))
    }

    const eventInfo = __DEV__
      ? { effect: activeEffect, target, type, key }
      : undefined

    trackEffects(dep, eventInfo)
    // console.log(key, targetMap)
  }
}
```

1) 只有生成vnode的时候用到了data定义的数据，就会触发一次 track函数

2）创建一个全局`WeakMap()`属性`targetMap`, `target`是对象，html模板的值
`target`作为`WeakMap`对象的键值，如果value没有值. 就创建一个Map()对象，并且设置一个Map对象
`targetMap.set(target, (depsMap = new Map()))`

3）`Map()`的值查询有没有`Set()`数组，如果没有. 就创建一个`Set()`对象,并且设置一个Set数组
`depsMap.set(key, (dep = createDep()))`
    
4）最后就是把更新视图的函数，设置到dep数组里面; dep数组可以判断是否是唯一

5-4. 拿到`vnode`之后，执行`patch`

6. 当有一个值改变的时候，就会触发`proxy的set`方法（packages\reactivity\src\baseHandlers.ts）

1）保存旧的值`oldValue`, 

2）然后判断当前设置的key在对象中是否已经存在`const hadKey=xxx`; 

3）如果`hadKey`是`false`, 执行`trigger`（packages\reactivity\src\effect.ts）方法，传入add标识

4）如果两个值不一样，执行`trigger`方法，传入set标识

最终执行更新视图函数`componentUpdateFn`

## 总结
执行`app = Vue.createApp(xxx)`,会进行初始化操作`ensureRenderer()`，闭包保存所有把vnode渲染为正式DOM的函数,并且把整个实例内容保存再`const context = createAppContext()`下面，把`xxx`参数保存在`context.app._component`下面

执行`app.mount('#app')`,这个就是渲染的整个过程。函数执行栈：mount->render->patch->processComponent->mountComponent->setupComponent

 - `setupComponent`就是处理date, methods，把html模板编译成可执行render函数(packages\runtime-core\src\component.ts)

  - 接着执行`setupRenderEffect`再函数里面，把render函数执行生成vnode
  同时然date属性收集`componentUpdateFn`函数，该函数就是生成vnode，把vnode参数传给`patch`函数渲染正式DOM

至此流程执行完毕

## 多次触发data的值，如何只更新一次视图

1. 定义`new ReactiveEffect`渲染函数的时候（packages\runtime-core\src\renderer.ts），有一个scheduler参数
```js
const effect = (instance.effect = new ReactiveEffect(
    componentUpdateFn,
    () => queueJob(update),
    instance.scope
))
```
1-2. scheduler函数会在data属性触发的时候执行，因为每次触发都会执行scheduler函数，所有都会同时执行queueJob函数(packages\runtime-core\src\scheduler.ts)

1-3: queueJob函数会判断queue数组里面的值，如果还是相同的scheduler函数，就不插入数据了

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
  <div id="app">
    <button @click="test">{{ form.msg }} - {{ form.text}}</button>
    <button>static</button>
  </div>
  <script>
    /**
    (function anonymous(
    ) {
    const _Vue = Vue

    return function render(_ctx, _cache) {
      with (_ctx) {
        const { toDisplayString: _toDisplayString, createVNode: _createVNode, openBlock: _openBlock, createBlock: _createBlock } = _Vue

        return (_openBlock(), _createBlock("button", { onClick: test }, _toDisplayString(form.msg) + " - " + _toDisplayString(form.text), 9 , ["onClick"]))
      }
    }
    })
    
  */
    const { createApp } = Vue;

    var app = createApp({
      data() {
        return {
          form: {
            msg: 'hello vue',
          }
        }
      },
      mounted() {
        setTimeout(() => {
          this.form.text = 'add-text';
        }, 3000)
      },
      methods: {
        test() {
          alert(1)
        }
      }
    })
    console.log(app)
    app.mount('#app')
  </script>
</body>
</html>
```