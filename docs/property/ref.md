# ref方法如何收集依赖，如何触发视图的更新？

1. ref方法是在packages\reactivity\src\ref.ts定义，执行`createRef(value, false)`

2. 注意第二个参数是__v_isShallow = false，标识`this._value = __v_isShallow ? value : toReactive(value)`
   - 也就是说ref执行的构造函数，传的值需要执行响应式

3. ref定义了get，和set操作符，

4. 执行完之后，通过value取值，渲染目标的时候，就会取值value,顺便收集改渲染函数作为依赖

```js
get value() {
    // debugger
    trackRefValue(this)
    return this._value
  }
```


4-1. 在执行value的值进行替换的时候 ，也就是触发set操作符, 会重新执行`toReactive(newVal)`,重新定义值的响应式属性
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