# computed解读

1: `computed`方法实在packages\reactivity\src\computed.ts实现的

2: 判断第一个传入的参数是不是一个函数，如果是一个函数，就把该函数赋值给`getter`变量

   否则去传入的get, set赋值给`getter`, `setter`
```js
const onlyGetter = isFunction(getterOrOptions)
  if (onlyGetter) {
    getter = getterOrOptions
    setter = __DEV__
      ? () => {
          console.warn('Write operation failed: computed value is readonly')
        }
      : NOOP
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
```

3：然后把`getter`, `setter`，传入给ComputedRefImpl构造函数，并且return出去

```js
const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter, isSSR)
return cRef as any
```

3-1: 初始化的时候，创建依赖函数`ReactiveEffect`, `getter`作为第一个参数

而且设置`__v_isRef`为true,标记和属性ref是同一个类型
```js
this.effect = new ReactiveEffect(getter, () => {
    if (!this._dirty) {
    this._dirty = true
    triggerRefValue(this)
    }
})
this.effect.computed = this
this.effect.active = this._cacheable = !isSSR
this[ReactiveFlags.IS_READONLY] = isReadonly
```

3-2: `ComputedRefImpl`,主要是定义了定义了两个方法`get value`, `set Value`方法

- 当取值的时候，就会触发`get value`方法，也就是执行`getter`方法，获取值，
赋值给`self._value`, 然后返出去

```js
get value() {
    // the computed ref may get wrapped by other proxies e.g. readonly() #3376
    const self = toRaw(this)
    trackRefValue(self)
    if (self._dirty || !self._cacheable) {
      self._dirty = false
      self._value = self.effect.run()!
    }
    return self._value
  }
```

- 执行set操作的时候，会执行setter方法
```js
set value(newValue: T) {
    this._setter(newValue)
}
```

## 总结

computed是属于ref类型，取值的时候，通过`value`属性取值，

如果写入了html模板，如：
```html
<div>{{ cmTest }}</div>
<script>  
    var { createApp, ref, computed  } = Vue;

    var app = createApp({
        setup() {
            var test = ref({ name: 1})
            var cmTest = computed(() =>  {
                var res = test.value.name + 'cm'
                return res
            } );
            return {
                cmTest
            }
        }
    })
    app.mount('#app')

  </script>
```
- 当渲染html模板的时候，触发到compute的`get value`,收集到了渲染render函数的依赖

- 执行`get value`的时候，触发`self._value = self.effect.run()!`, 执行getter
  触发`ref（test.value.name）`的get操作符，收集到了computed创建的`self.effect依赖`

如果响应式属性触发了set

- 就会执行`computed`创建的依赖，`new ReactiveEffect.scheduler`函数

- scheduler触发`triggerRefValue(this)`, 用于computed对象收集到的是渲染render函数的依赖
  视图需要重新更新，因此会执行computed.value, 即`get value`, 实现视图更新，取到最新的computed值
```js
this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
        triggerRefValue(this)
      }
})
```

总的来说，compouted和watch最核心的实现都是依靠`ReactiveEffect`构造函数， 收集这个构造函数的作为依赖

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
    <p>{{ cmTest }}</p>
  </div>
  <script>  
    var { createApp, ref, computed  } = Vue;

    var app = createApp({
        setup() {
            var test = ref({ name: 1})
            var cmTest = computed(() =>  {
              debugger
                var res = test.value.name + 'cm'
                return res
            } );

            setTimeout(() => {
              debugger
                test.value.name++
            }, 6000)
            return {
                cmTest
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