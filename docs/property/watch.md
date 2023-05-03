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




## 相关代码

```

```