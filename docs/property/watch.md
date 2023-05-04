# watch解读

## 在组合式api如何使用watch呢？

1. `watch`方法是在`packages\runtime-core\src\apiWatch.ts`里面，主要是`doWatch`函数执行

2. `dowatch`对监听值的写法进行好几种分别处理

```js
let getter: () => any
if (isRef(source)) {
    getter = () => source.value
    forceTrigger = isShallow(source)
  } else if (isReactive(source)) {
    getter = () => source
    deep = true
  } else if (isArray(source)) {
    isMultiSource = true
    forceTrigger = source.some(s => isReactive(s) || isShallow(s))
    getter = () =>
      source.map(s => {
        if (isRef(s)) {
          return s.value
        } else if (isReactive(s)) {
          return traverse(s)
        } else if (isFunction(s)) {
          return callWithErrorHandling(s, instance, ErrorCodes.WATCH_GETTER)
        } else {
          __DEV__ && warnInvalidSource(s)
        }
      })
  } else if (isFunction(source)) {
    if (cb) {
      // getter with cb
      getter = () =>
        callWithErrorHandling(source, instance, ErrorCodes.WATCH_GETTER)
    } else {
      // no cb -> simple effect
      getter = () => {
        if (instance && instance.isUnmounted) {
          return
        }
        if (cleanup) {
          cleanup()
        }
        return callWithAsyncErrorHandling(
          source,
          instance,
          ErrorCodes.WATCH_CALLBACK,
          [onCleanup]
        )
      }
    }
  } else {
    getter = NOOP
    __DEV__ && warnInvalidSource(source)
  }
```

2-1. 对传入值souce值的处理

- 如果传入是一个ref类型的值，赋值`getter = () => source.value`，这种写法有一个特点就是不会立马触发
ref对象的`get value() {}`方法

- 如果传入一个reactive类型的之后，赋值`getter = () => source`, 特点是，`deep变成true`, 自动设置深度监听

- 如果是一个数组类型（看起来挺复杂的，有空再解读吧^_^）

- 如果是是一个函数, 并且有回调函数，赋值`getter = () => callWithErrorHandling(source, instance, ErrorCodes.WATCH_GETTER)`

- 上述几种情况都不存在，赋值`getter = NOOP`, 赋值一个空函数


3：如果有回到函数和deep为true，就会对getter再次进行封装一层

```js
if (cb && deep) {
    const baseGetter = getter
    getter = () => traverse(baseGetter())
}

// 递归遍历对象，触发get操作符，收集watch依赖
export function traverse(value: unknown, seen?: Set<unknown>) {
  if (!isObject(value) || (value as any)[ReactiveFlags.SKIP]) {
    return value
  }
  seen = seen || new Set()
  if (seen.has(value)) {
    return value
  }
  seen.add(value)
  if (isRef(value)) {
    traverse(value.value, seen)
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], seen)
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v: any) => {
      traverse(v, seen)
    })
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse((value as any)[key], seen)
    }
  }
  return value
}

```
它就是递归获取对象值，让每一个属性都可以收集watch依赖，也就是可以执行生成递归的核心步骤

4：定义job函数，该函数会传入scheduler里面，作为异步队列执行的函数

5：new一个依赖函数`const effect = new ReactiveEffect(getter, scheduler)`
   `getter`就是触发对象get的函数，`scheduler`就是异步执行的任务队列，多次触发get，确保只是执行一次

6：执行`effect.run()`
```js
if (cb) {
  if (immediate) {
    job()
  } else {
    oldValue = effect.run()
  }
} else if (flush === 'post') {
  queuePostRenderEffect(
    effect.run.bind(effect),
    instance && instance.suspense
  )
} else {
  effect.run()
}
```

- 如果定义了immediate为true，会执行回调函数
```js
callWithAsyncErrorHandling(cb, instance, ErrorCodes.WATCH_CALLBACK, [
  newValue,
  // pass undefined as the old value when it's changed for the first time
  oldValue === INITIAL_WATCHER_VALUE
    ? undefined
    : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE
    ? []
    : oldValue,
  onCleanup
])
```

6-1： 执行`effect.run()`,这个收集依赖的核心函数, 实际上执行ReactiveEffect构造函数的`effect`方法

```js
run() {
    // debugger
    if (!this.active) {
      return this.fn()
    }
    let parent: ReactiveEffect | undefined = activeEffect
    let lastShouldTrack = shouldTrack
    while (parent) {
      if (parent === this) {
        return
      }
      parent = parent.parent
    }
    try {
      this.parent = activeEffect
      activeEffect = this
      shouldTrack = true

      trackOpBit = 1 << ++effectTrackDepth

      if (effectTrackDepth <= maxMarkerBits) {
        initDepMarkers(this)
      } else {
        cleanupEffect(this)
      }
      return this.fn()
    } finally {
      if (effectTrackDepth <= maxMarkerBits) {
        finalizeDepMarkers(this)
      }

      trackOpBit = 1 << --effectTrackDepth

      activeEffect = this.parent
      shouldTrack = lastShouldTrack
      this.parent = undefined

      if (this.deferStop) {
        this.stop()
      }
    }
}
```
- `this.fn()` 就是开始定义的`getter`函数，用于触发对象的get操作符，搜集当前的`new ReactiveEffect`依赖

7：最后返回`unwatch`方法,可以用于停止执行当前watch的触发

```js
const unwatch = () => {
    effect.stop()
    if (instance && instance.scope) {
      remove(instance.scope.effects!, effect)
    }
  }

  if (__SSR__ && ssrCleanup) ssrCleanup.push(unwatch)
  return unwatch
```

## watch的不同写法

```js
var { ref, watch, reactive } = Vue

var test = ref({});
var react = reactive({})
// 写法一
watch(test, () => {})

// 写法二
watch(test.value, () => {})

// 写法三
watch(() => test.value, () => {})

// 写法四
watch(react, () => {})
```

## 案例一

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
  </div>
  <script>  
    var { createApp, ref, watch  } = Vue;

    var app = createApp({
        setup() {
            var test = ref({});


            setTimeout(() => {
              test.value = { name: 1 }
            }, 3000)

            watch(test.value, () => {
              console.log(test.value)
            })

            return {
                test,
            }
        }
    })
    app.mount('#app')

  </script>
  <script>
  </script>
</body>
</html>
```
> watch做了什么？




## watch不生效的场景


## 相关代码

```html
<div id="app">
    <input v-model="test.name" />
</div>
<script>  
    var { createApp, ref, watch  } = Vue;

    var app = createApp({
        setup() {
            var test = ref({  });

            onMounted(() => {
              // debugger
              test.value = { name: 1 }
              
            })
            
            watch(test, () => {
              console.log(test)
            })
            return {
                test,
            }
        }
    })
    app.mount('#app')

  </script>
```