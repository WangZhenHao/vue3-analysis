# ref方法如何收集依赖，如何触发视图的更新？

1. ref方法是在packages\reactivity\src\ref.ts定义，执行`createRef(value, false)`

2. 注意第二个参数是__v_isShallow = false，标识`this._value = __v_isShallow ? value : toReactive(value)`
   - 也就是说ref执行的构造函数，传的值需要执行响应式

2-1: `toReactive`会对value进行判断，如果是一个对象，就会执行`reactive`, 执行响应式操作，设置get,set
```js
export const toReactive = <T extends unknown>(value: T): T =>
  isObject(value) ? reactive(value) : value
```


3. ref定义了`get value`，和`set value`操作符，

4. 执行完之后，通过value取值，渲染目标的时候，就会取值value,顺便收集改渲染函数作为依赖

```js
get value() {
    // debugger
    trackRefValue(this)
    return this._value
  }
```


5. 在执行value的值进行替换的时候 ，也就是触发set操作符, 会重新执行`toReactive(newVal)`,重新定义值的响应式属性->`packages\reactivity\src\reactive.ts`
    然后执行`triggerRefValue(this, newVal)`,从而触发视图的更新

```js
set value(newVal) {
    const useDirectValue =
      this.__v_isShallow || isShallow(newVal) || isReadonly(newVal)
      // debugger
    newVal = useDirectValue ? newVal : toRaw(newVal)
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = useDirectValue ? newVal : toReactive(newVal)
      triggerRefValue(this, newVal)
    }
  }
```

5-1. 在设置value的值的时候，就会重新定义响应式熟悉，触发依赖更新，重新收集新的对象的依赖收集


## 总结
ref的属性有一个内部也是执行reactive方法，只用的时候，通过value取值`xx.value`，通过vulue设值`xx.value=xx`。这样子的好处就是
直接赋值value，可以重新定义对象的响应式属性，而且也会触发依赖更新，重新收集新对象的依赖

## 相关代码
```js
var { ref, reactive } = Vue

var test1 = ref({})
var test2 = reactive({})

test1.value = { name: 1 }
test2 = { name: 2 }

// test1回触发依赖更新，test2不会触发依赖更新
```