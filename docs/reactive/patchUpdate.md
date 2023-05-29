# 如何更新vnode,重新patch

1. 在第一次生成vnode的时候，触发get，令属性收集到包含`componentUpdateFn`函数的`ReactiveEffect`实例

因此在触发set的时候，就会执行`ReactiveEffect`中的`componentUpdateFn`函数

1-1. 执行`componentUpdateFn`函数，用于`instance.isMounted`为true，所以执行另一个else分支

- 执行render函数生成新的vnode，命名为nextTree

- 取出上一次的vnode，命名为prevTree

- 最新的vnode赋值给`instance.subTree`

- 执行`patch`, 传入`prevTree`， `nextTree`

```js
const componentUpdateFn = () => {
      if (!instance.isMounted) {
        
      } else {
        let { next, bu, u, parent, vnode } = instance
        if (next) {
          next.el = vnode.el
          updateComponentPreRender(instance, next, optimized)
        } else {
          next = vnode
        }

        
        const nextTree = renderComponentRoot(instance)
        if (__DEV__) {
          endMeasure(instance, `render`)
        }
        const prevTree = instance.subTree
        instance.subTree = nextTree

        patch(
          prevTree,
          nextTree,
          // parent may have changed if it's in a teleport
          hostParentNode(prevTree.el!)!,
          // anchor may have changed if it's in a fragment
          getNextHostNode(prevTree),
          instance,
          parentSuspense,
          isSVG
        )
        
      }
    }
```

2. 执行patch函数
prevTree                        上一次的vnode
nextTree                        最新的vnode
hostParentNode(prevTree.el!)!   #app元素
getNextHostNode(prevTree)       null
instance                        vue实例

```js
patch(
  prevTree,
  nextTree,
  // parent may have changed if it's in a teleport
  hostParentNode(prevTree.el!)!,
  // anchor may have changed if it's in a fragment
  getNextHostNode(prevTree),
  instance,
  parentSuspense,
  isSVG
)
```

2-1. 拿到`nextTree`的type为`Symbol(Fragment)`, 所以执行`processFragment`
```js
processFragment(
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
```

2-2. n1参数有值，不是第一次渲染，所以执行else模块，n1.dynamicChildren有值，所以执行`patchBlockChildren`
```js
if (
  patchFlag > 0 &&
  patchFlag & PatchFlags.STABLE_FRAGMENT &&
  dynamicChildren &&
  // #2715 the previous fragment could've been a BAILed one as a result
  // of renderSlot() with no valid children
  n1.dynamicChildren
) {
  // a stable fragment (template root or <template v-for>) doesn't need to
  // patch children order, but it may contain dynamicChildren.
  patchBlockChildren(
    n1.dynamicChildren,
    dynamicChildren,
    container,
    parentComponent,
    parentSuspense,
    isSVG,
    slotScopeIds
  )
```

2-3. `patchBlockChildren`遍历n2.dynamicChildren数组，然后执行`patch`
oldVNode           上一个vnode的值
newVNode           最新的vnode
container          #app元素
parentComponent    vue实例
parentSuspense     null

```js
for (let i = 0; i < newChildren.length; i++) {
  const oldVNode = oldChildren[i]
  const newVNode = newChildren[i]
  // Determine the container (parent element) for the patch.
  const container =
    // oldVNode may be an errored async setup() component inside Suspense
    // which will not have a mounted element
    oldVNode.el &&
    // - In the case of a Fragment, we need to provide the actual parent
    // of the Fragment itself so it can move its children.
    (oldVNode.type === Fragment ||
      // - In the case of different nodes, there is going to be a replacement
      // which also requires the correct parent container
      !isSameVNodeType(oldVNode, newVNode) ||
      // - In the case of a component, it could contain anything.
      oldVNode.shapeFlag & (ShapeFlags.COMPONENT | ShapeFlags.TELEPORT))
      ? hostParentNode(oldVNode.el)!
        fallbackContainer
  patch(
    oldVNode,
    newVNode,
    container,
    null,
    parentComponent,
    parentSuspense,
    isSVG,
    slotScopeIds,
    true
  )
}
```
2-4. 在`patch`函数中获取n2的type为`div`, `shapeFlag`为`9`,所以执行`processElement`
n1   旧的vnode
n2   最新的vnode
```js
processElement(
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
```
2-5. 因为n1有值，所以执行`patchElement`
```js
patchElement(
    n1,
    n2,
    parentComponent,
    parentSuspense,
    isSVG,
    slotScopeIds,
    optimized
  )
```

2-6. patchElement函数中赋值`const el = (n2.el = n1.el!)`

经过一些列的判断，最终执行执行到
```js
 if (patchFlag & PatchFlags.TEXT) {
  if (n1.children !== n2.children) {
    hostSetElementText(el, n2.children as string)
  }
}
```
最终实现了节点内容用修改

## 总结
Vue的属性值改变了，就会触发到set操作符，应为get操作符收集到了`componentUpdateFn`函数的`ReactiveEffect`实例
所以，有重新执行`componentUpdateFn`函数，执行render函数生成新的vnode
遍历他们的`dynamicChildren`数组，执行`patch`函数,传入的参数是旧vnode的`dynamicChildren`值，新vnode的`dynamicChildren`值
经过旧vnode和新vnode的内容，即`children`值是否一样，从而执行dom的更新

## 列表渲染遇到数组变少的场景

```html
<script>  
  
</script>
```

1. 当数组的长度变短的时候，触发vnode更新

2. 通过判断旧vnode的`dynamicChildren`，执行`patchBlockChildren`
container   #app元素
```js
patchBlockChildren(
  n1.dynamicChildren,
  dynamicChildren,
  container,
  parentComponent,
  parentSuspense,
  isSVG,
  slotScopeIds
)
```

2-1. 拿到dynamicChildren的children数组，执行`patchChildren`函数

没有设置key，所以执行`patchUnkeyedChildren`，新列表和旧列表一一对比

2-2. 对比新vnode的长度和旧vnode的长度，取最小的值

```js
const patchUnkeyedChildren = (
    c1: VNode[],
    c2: VNodeArrayChildren,
    container: RendererElement,
    anchor: RendererNode | null,
    parentComponent: ComponentInternalInstance | null,
    parentSuspense: SuspenseBoundary | null,
    isSVG: boolean,
    slotScopeIds: string[] | null,
    optimized: boolean
  ) => {
    const oldLength = c1.length
    const newLength = c2.length
    const commonLength = Math.min(oldLength, newLength)
    let i
    for (i = 0; i < commonLength; i++) {
      const nextChild = (c2[i] = optimized
        ? cloneIfMounted(c2[i] as VNode)
        : normalizeVNode(c2[i]))
      patch(
        c1[i],
        nextChild,
        container,
        null,
        parentComponent,
        parentSuspense,
const { createApp } = Vue;
  
  var app = createApp({
    data() {
      return {
        list: [
          '1',
          '2',
          '3',
        ]
      }
    },
    mounted() {
      setTimeout(() => {
        this.list = ['tes', 'a'];
      }, 5000)
    }
  })
  app.mount('#app')        isSVG,
        slotScopeIds,
        optimized
      )
    }
    if (oldLength > newLength) {
      // remove old
      unmountChildren(
        c1,
        parentComponent,
        parentSuspense,
        true,
        false,
        commonLength
      )
    } else {
      // mount new
      mountChildren(
        c2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        isSVG,
        slotScopeIds,
        optimized,
        commonLength
      )
    }
  }
```
- 遍历执行patch，让新vnode的值，全部替换旧vnode的值

- 判断旧vnode和新vnode的长度判断，得出是需要删除dom

- 执行`unmountChildren`
c1               旧vnode列表
parentComponent  vue实例

commonLength     最新vnode的长度，表示从数组的第几个开始删除
```js
unmountChildren(
  c1,
  parentComponent,
  parentSuspense,
  true,
  false,
  commonLength
)
```

2-3. 遍历旧vnode数组，执行`unmount`，初始位置是新vnode的数量
```js
const unmountChildren: UnmountChildrenFn = (
    children,
    parentComponent,
    parentSuspense,
    doRemove = false,
    optimized = false,
    start = 0
  ) => {
    for (let i = start; i < children.length; i++) {
      unmount(children[i], parentComponent, parentSuspense, doRemove, optimized)
    }
  }
```

2-4. 最终执行到`remove(vnode)`,用于vnode.el是有值，而且就是需要删除的元素节点
packages\runtime-dom\src\nodeOps.ts
```js
remove: child => {
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
}
```

## 总结
在列表渲染中，如果遇到数组长度变短了，会先把`新vnode的内容`全部替换`旧vnode的内容`
然后再把多余的旧vnode的元素节点，一个一个移除掉

## 列表渲染遇到数组变长的场景

```html
<script>  
    const { createApp } = Vue;
    
    var app = createApp({
      data() {
        return {
          list: [
            '1',
          ]
        }
      },
      mounted() {
        setTimeout(() => {
          this.list = ['tes', 'a'];
        }, 5000)
      }
    })
    app.mount('#app')
  </script>
```

1. 依旧是拿到dynamicChildren的children数组，执行`patchChildren`函数

没有设置key，所以执行`patchUnkeyedChildren`，新列表和旧列表一一对比

- 对比新vnode的长度和旧vnode的长度，取最小的值

- 遍历执行patch，让新vnode的值，全部替换旧vnode的值

- 判断旧vnode和新vnode的长度判断，得出是需要新增dom

- 执行`mountChildren`
c2           新列表vnode
container  

```js
  mountChildren(
    c2,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    isSVG,
    slotScopeIds,
    optimized,
    commonLength
  )
```
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
    <div class="test" style="font-size: 14px;">
       <div>{{msg}}</div>
    </div>
    <div>stasut</div>
  </div>
  <script>  
    const { createApp } = Vue;
    
    var app = createApp({
      data() {
        return {
          msg: 'vue'
        }
      },
      mounted() {
        setTimeout(() => {
          this.msg = 1'
        })
      }
    })
    app.mount('#app')
  </script>
</body>
</html>
```
