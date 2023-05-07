# reactive解读

1：`reactive`方法是在packages\reactivity\src\reactive.ts 产生的
   核心函数是`createReactiveObject`
```js
export function reactive(target: object) {
  // if trying to observe a readonly proxy, return the readonly version.
  if (isReadonly(target)) {
    return target
  }
  
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  )
}
```

2: `createReactiveObject`接收五个参数,
```js
function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>
) {}
```

2-1：首先判断target是否是一个对象，如果不是，抛出警告，不执行往下流程，返回target内容
```js
if (!isObject(target)) {
    if (__DEV__) {
      console.warn(`value cannot be made reactive: ${String(target)}`)
    }
    return target
}
```

```js
if (!isObject(target)) {
    if (__DEV__) {
        console.warn(`value cannot be made reactive: ${String(target)}`)
    }
    return target
}
```
2-2: 判断传入对象是属于什么类型，如果不是`Object,Array,Map,Set,WeakMap,WeakSet`
会中断下面流程，返回target

```js
const targetType = getTargetType(target)
if (targetType === TargetType.INVALID) {
return target
}

function targetTypeMap(rawType: string) {
  switch (rawType) {
    case 'Object':
    case 'Array':
      return TargetType.COMMON
    case 'Map':
    case 'Set':
    case 'WeakMap':
    case 'WeakSet':
      return TargetType.COLLECTION
    default:
      return TargetType.INVALID
  }
}
```

2-3：接着就是执行new Proxy，定义响应式属性了
    
```js
const proxy = new Proxy(
  target,
  targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
)
proxyMap.set(target, proxy)
return proxy
```
- 判断target的类型是否M`Map,Set,WeakMap,WeakSet`, 如果是 使用`collectionHandlers`，否则
使用`baseHandlers`

- `collectionHandlers` 是对Map,Set,WeakMap,WeakSet类型进行处理
   该函数定义了`get,get size,has, add, set, delete, clear,forEach, keys, values, entrires, Symbol.iterator`
   
   里面就会涉及到依赖的收集和依赖执行的函数，可以看到Map,Set,WeakMap,WeakSet，处理的东西比简单的Object, Array简单很多
```js
export const mutableCollectionHandlers: ProxyHandler<CollectionTypes> = {
  get: /*#__PURE__*/ createInstrumentationGetter(false, false)
}

function createInstrumentationGetter(isReadonly: boolean, shallow: boolean) {
  const instrumentations = shallow
    ? isReadonly
      ? shallowReadonlyInstrumentations
      : shallowInstrumentations
    : isReadonly
    ? readonlyInstrumentations
    : mutableInstrumentations

  return (
    target: CollectionTypes,
    key: string | symbol,
    receiver: CollectionTypes
  ) => {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (key === ReactiveFlags.RAW) {
      return target
    }

    return Reflect.get(
      hasOwn(instrumentations, key) && key in target
        ? instrumentations
        : target,
      key,
      receiver
    )
  }
}

```
- `baseHandles` 定义了`get, set,has，deleteProperty，ownKeys`->packages\reactivity\src\baseHandlers.ts
  这个就是就是响应式的核心代码，是的对象取值，设值，都会走
  里面的方法
```js
export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
  deleteProperty,
  has,
  ownKeys
}
```

## reactive和ref的关系

- ref是一个构造函数，通过`get value`取值, `set value`设置值，内部实现的属性响应式是调用`reactive`方法

- ref的好处是可以设置基本类型`number, string, boolean`和对象
但是reactive只能设置对象作为一个响应式属性，如果是基本类型数据，不做处理

- ref通过可以赋值替换（既：test.value = xxx），因为这个是触发了`set value`方法，可以触发依赖更新
但是对`reactive的值赋值替换`，这不会触发依赖的更新，应为引用已经改变了，又没有重新定义set, get操作符
来收集依赖的机制
 
 ```js
 <div>{{ test }}</div>
 var { createApp, reactive  } = Vue;

 var test = reactive({name: 1})

// 不会触发更新了
test = { name: 2 }
 ```


## 总结

reactive是Vue3的一个非常核心功能，里面就是为属性设置Proxy，为属性添加`get,set`操作符
在触发`get`函数的时候, 对依赖进行收集，在触发`set`函数的时候,执行所收集的依赖
从而达到数据更新，DOM视图也可以更新，既数据响应式


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
    {{ test }}
  </div>
  <script>  
    var { createApp, reactive  } = Vue;

    var app = createApp({
        setup() {
            var test = reactive({name: 0});

            setInterval(() => {
              test.name++
            }, 3000)

            

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