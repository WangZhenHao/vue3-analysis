## 问题
> 没有在data定义属性，但是在新增一个属性的时候，是如何更新视图的呢？例如：data中的form没有定义text属性，但是修改form.text的时候，却可以更新视图(看相关代码)


1. 处理data的数据在`finishComponentSetup函数`里面（packages\runtime-core\src\componentOptions.ts），主要是对data使用了new Proxy()封装`instance.data = reactive(data)`

```js
 // support for 2.x options
  if (__FEATURE_OPTIONS_API__ && !(__COMPAT__ && skipOptions)) {
    setCurrentInstance(instance)
    pauseTracking()
    applyOptions(instance)
    resetTracking()
    unsetCurrentInstance()
  }
```
- 执行`applyOptions(instance)`, 这时候data里面定义的值，有个get和set属性

2. 开始执行render函数生成vnode，在这个过程中就会触发get方法，处理如下：
    `packages\reactivity\src\baseHandlers.ts-> createGetter(isReadonly = false, shallow = false)`

2-1. 当取值form.msg 的时候，执行track(target, TrackOpTypes.GET, key)

2-2. 定义const targetMap = new WeakMap()全局变量

- 判断{msg: 'hello vue'},也就是form对象有没有new Map()对象，如果没有创建一个

- `targetMap.set(target, (depsMap = new Map()))`，target就是`{msg: 'hello vue'}`

- depsMap类似对象，存储key作为键值命

- 判断`let dep = depsMap.get(key)` 中的dep有没有值，如果没有创建一个`dep = new Set()`

- 添加依赖`dep.add(activeEffect!)` ReactiveEffect2为渲染函数

-  dep类似数组，存储渲染函数

这时候会得到一个类似的对象
```js
targetMap = {
    {msg: 'hello vue'}: {
       msg: [ReactiveEffect2]
    }
}
```

2-3. 当取值form.text的时候，执行track(target, TrackOpTypes.GET, key)

- `targetMap.set(target, (depsMap = new Map()))`，target就是`{msg: 'hello vue'}`
- 由于depsMap已经有了，所以不需要重新创建，取值`let dep = depsMap.get(key)`，这里的key也就是text
- 判断dep有没有，这里发现不存在，于是创建一个`dep = new Set()`
- 添加依赖`dep.add(activeEffect!)`

这时候会得到一个类似的对象
```js
targetMap = {
    {msg: 'hello vue'}: {
    msg: [ReactiveEffect2],
    text: [ReactiveEffect2]
    }
}
```

3. 修改text的是`this.form.text = 'add-text'`,这个过程中会触发set方法，处理如下：
packages\reactivity\src\baseHandlers.ts-> `createSetter(shallow = false)`

3-0. 判断text是否存在form里面，保存布尔值变量hadKey

3-1. 执行`const result = Reflect.set(target, key, value, receiver)`对form对象设新的键值，form这时候变成了

```js
form: { 
    msg:"hello vue",
    text: "add-text"
}
```
3-2. hadkey为false,执行 `trigger(target, TriggerOpTypes.ADD, key, value)`

3-3. 由于依赖收集对象targetMap是弱引用，这时候
```js
targetMap = {
{msg: 'hello vue', text: 'change'}: {
    msg: [ReactiveEffect2],
    text: [ReactiveEffect2]
}
}
```

`const depsMap = targetMap.get(target)` depsMap有值，赋值到`deps.push(depsMap.get(key))`

deps里面，key有text， deps这时候就是[ReactiveEffect2]了

3-4. 执行`triggerEffects(createDep(effects))`，循环遍历，执行`triggerEffect(effect, debuggerEventExtraInfo)`
- 判断渲染函数有没有scheduler，这个函数是一个异步函数，因为每次触发都会执行scheduler函数，所有都会同时执行queueJob函数(packages\runtime-core\src\scheduler.ts)

- queueJob函数会判断queue数组里面的值，如果还是相同的scheduler函数，就不插入数据了
是的只是更新一次渲染函数，是的性能更加好

3-5. 最后出发触发render函数，生成新的vnode, 渲染真实DOM

## 和Vue2的区别
1: Object.defineProperty 无法检测属性的新增

2：Vue2需要对数组方法进行重写

3：依赖收集的方式不一样
  - Vu3是全局变量通过WeakMap, Map, Set来收集
  - Vue2定义Dep对象, 通过闭包收集依赖
  
```js
// Vue2 响应式实现
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep()
  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }
  
  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal)
      dep.notify()
    }
  })
}

```

```js
// Vue3响应式原理-依赖收集
export const targetMap = new WeakMap<any, KeyToDepMap>()

function createGetter(isReadonly = false, shallow = false) {
  return function get(target: Target, key: string | symbol, receiver: object) {
    // debugger
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (key === ReactiveFlags.IS_SHALLOW) {
      return shallow
    } else if (
      key === ReactiveFlags.RAW &&
      receiver ===
        (isReadonly
          ? shallow
            ? shallowReadonlyMap
            : readonlyMap
          : shallow
          ? shallowReactiveMap
          : reactiveMap
        ).get(target)
    ) {
      return target
    }

    const targetIsArray = isArray(target)

    if (!isReadonly) {
      if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
        return Reflect.get(arrayInstrumentations, key, receiver)
      }
      if (key === 'hasOwnProperty') {
        return hasOwnProperty
      }
    }

    const res = Reflect.get(target, key, receiver)

    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res
    }

    if (!isReadonly) {
      track(target, TrackOpTypes.GET, key)
    }

    if (shallow) {
      return res
    }

    if (isRef(res)) {
      // ref unwrapping - skip unwrap for Array + integer key.
      return targetIsArray && isIntegerKey(key) ? res : res.value
    }

    if (isObject(res)) {
      // Convert returned value into a proxy as well. we do the isObject check
      // here to avoid invalid value warning. Also need to lazy access readonly
      // and reactive here to avoid circular dependency.
      return isReadonly ? readonly(res) : reactive(res)
    }

    return res
  }
}

export function track(target: object, type: TrackOpTypes, key: unknown) {
  // debugger
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

## 总结

能够做到上面的更新视图效果，new Proxy起到了第一层作用，

第二层就是WeakMap, Map, Set这三个特性，起到了关键作用，用来搜集每一个属性的渲染函数

再触发的时候，通过WeakMap, Map, Set去查询该值的渲染函数，从而执行视图的更新

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

## 相关代码-Map,WeakMap,Set

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
        var form = { msg: 'hllo vue' }

        const targetMap = new WeakMap()

        let depsMap = targetMap.get(form)
        if(!depsMap) {
            targetMap.set(form, (depsMap = new Map()));
        }
        
        let dep = depsMap.get('msg')
        if (!dep) {
          depsMap.set('msg', (dep = new Set()))
          dep.add(function ReactiveEffect() {})

        //   depsMap.set('text', (dep = new Set()))
        //   dep.add(function ReactiveEffect() {})
        }

        console.log(targetMap.get(form));

        setTimeout(() => {
            form.text = 'change'
            // 尽管form已经变了，但是targetMap.get() 依旧可以拿到值
            console.log(targetMap.get(form))
        }, 1000)
    </script>
</body>
</html>
```





