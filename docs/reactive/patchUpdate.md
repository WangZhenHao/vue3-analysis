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
