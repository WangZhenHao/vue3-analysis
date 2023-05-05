# watch案例

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


            setInterval(() => {
              test.value.name = 1
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
> watch做了什么, 如何触发回调函数的执行？

1：test变量定义ref类型的值，通过value取值，赋值; `packages\reactivity\src\ref.ts`

2: 执行watch方法`packages\runtime-core\src\apiWatch.ts`, 执行test.value和传入回调函数

2-1: test.value会触发`get value`方法， 执行`trackRefValue(this)` 该方法也是一个收集依赖方法
     确保修改value的值的时候，可以触发依赖的执行
```js
export function trackRefValue(ref: RefBase<any>) {
  if (shouldTrack && activeEffect) {
    ref = toRaw(ref)
    if (__DEV__) {
      trackEffects(ref.dep || (ref.dep = createDep()), {
        target: ref,
        type: TrackOpTypes.GET,
        key: 'value'
      })
    } else {
      trackEffects(ref.dep || (ref.dep = createDep()))
    }
  }
}
```

应为activeEffect为空，所有不执行依赖的收集

3：执行`return doWatch(source as any, cb, options)` 

   - 由于test.value是一个reactive对象，所以赋值给getter，并且把deep设置为true

   - 由于deep为true，也就是深度监听，所以用traverse对getter再做一层封装`packages\runtime-core\src\apiWatch.ts`
  
```js
else if (isReactive(source)) {
    getter = () => source
    deep = true
} 

// getter();
if (cb && deep) {
  const baseGetter = getter
  getter = () => traverse(baseGetter())
}
```

4: 定义依赖函数， `const effect = new ReactiveEffect(getter, scheduler)`

  - `scheduler = () => queueJob(job)`是异步执行的，为了都次触发set，只会执行一次

5：接着就执行 `oldValue = effect.run()`

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
- 把当前的依赖，赋值到全局依赖中, 开始执行`this.fn()`, 该函数就是getter函数

```js
this.parent = activeEffect
activeEffect = this
shouldTrack = true
```

5-1：由于有traverse函数，所以就会遍历test.value对象

执行判断
```js
if (!isObject(value) || (value as any)[ReactiveFlags.SKIP]) {
    return value
}
```
- 触发get操作符`packages\reactivity\src\baseHandlers.ts`, test.value.__v_skip 收集到activeEffect

- 举行递归遍历, 这个用于触发了in操作符，所以执行了ownKeys操作符
```js
for (const key in value) {
  traverse((value as any)[key], seen)
}


function ownKeys(target: object): (string | symbol)[] {
  track(target, TrackOpTypes.ITERATE, isArray(target) ? 'length' : ITERATE_KEY)
  return Reflect.ownKeys(target)
}
```

- test.value.Symbol(iterate) 收集到activeEffect ，这个Symbol(iterate)属性用重要，后面新加的键值会用到这个


6：执行到setTimeout，给空对象赋值

## watch不生效的场景
