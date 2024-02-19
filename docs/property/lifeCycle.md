# 生命周期

1. 执行`finishComponentSetup`函数（packages\runtime-core\src\component.ts）， 生成render函数。

1-1. 生成render函数之后，开始执行`applyOptions(instance)`

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

2. `applyOptions`函数(packages\runtime-core\src\componentOptions.ts)，这个函数就是处理vue生命周期的

```js
export function applyOptions(instance: ComponentInternalInstance) {
    const options = resolveMergedOptions(instance)
    // call beforeCreate first before accessing other options since
  // the hook may mutate resolved options (#2791)
  if (options.beforeCreate) {
    callHook(options.beforeCreate, instance, LifecycleHooks.BEFORE_CREATE)
  }

  if (!isObject(data)) {
        __DEV__ && warn(`data() should return an object.`)
    } else {
        instance.data = reactive(data)
        if (__DEV__) {
        for (const key in data) {
            checkDuplicateProperties!(OptionTypes.DATA, key)
            // expose data on ctx during dev
            if (!isReservedPrefix(key[0])) {
            Object.defineProperty(ctx, key, {
                configurable: true,
                enumerable: true,
                get: () => data[key],
                set: NOOP
            })
            }
        }
        }
    }

  if (created) {
    callHook(created, instance, LifecycleHooks.CREATED)
  }

  function registerLifecycleHook(
    register: Function,
    hook?: Function | Function[]
  ) {
    if (isArray(hook)) {
      hook.forEach(_hook => register(_hook.bind(publicThis)))
    } else if (hook) {
      register((hook as Function).bind(publicThis))
    }
  }

  registerLifecycleHook(onBeforeMount, beforeMount)
  registerLifecycleHook(onMounted, mounted)
  registerLifecycleHook(onBeforeUpdate, beforeUpdate)
  registerLifecycleHook(onUpdated, updated)
  registerLifecycleHook(onActivated, activated)
  registerLifecycleHook(onDeactivated, deactivated)
  registerLifecycleHook(onErrorCaptured, errorCaptured)
  registerLifecycleHook(onRenderTracked, renderTracked)
  registerLifecycleHook(onRenderTriggered, renderTriggered)
  registerLifecycleHook(onBeforeUnmount, beforeUnmount)
  registerLifecycleHook(onUnmounted, unmounted)
  registerLifecycleHook(onServerPrefetch, serverPrefetch)

  if (__COMPAT__) {
    if (
      beforeDestroy &&
      softAssertCompatEnabled(DeprecationTypes.OPTIONS_BEFORE_DESTROY, instance)
    ) {
      registerLifecycleHook(onBeforeUnmount, beforeDestroy)
    }
    if (
      destroyed &&


      softAssertCompatEnabled(DeprecationTypes.OPTIONS_DESTROYED, instance)
    ) {
      registerLifecycleHook(onUnmounted, destroyed)
    }
  }
}
```

2-1. 最早是直接执行`options.beforeCreate`钩子,该钩子不可以访问data, methods的值

2-2.处理好data，methods之后，开始执行`options.created`钩子，这时候可以通过`this`访问data, methods的值

2-3. 收集其他定义的的钩子,如果有定义了上面的钩子，那就调用`injectHook`函数（packages\runtime-core\src\apiLifecycle.ts）
把定义生命钩子保存到数组中来，方便在适合的时机调用

```js 
export function injectHook(
  type: LifecycleHooks,
  hook: Function & { __weh?: Function },
  target: ComponentInternalInstance | null = currentInstance,
  prepend: boolean = false
): Function | undefined {
  if (target) {
    // debugger
    const hooks = target[type] || (target[type] = [])
    // cache the error handling wrapper for injected hooks so the same hook
    // can be properly deduped by the scheduler. "__weh" stands for "with error
    // handling".
    const wrappedHook =
      hook.__weh ||
      (hook.__weh = (...args: unknown[]) => {
        if (target.isUnmounted) {
          return
        }
        // disable tracking inside all lifecycle hooks
        // since they can potentially be called inside effects.
        pauseTracking()
        // Set currentInstance during hook invocation.
        // This assumes the hook does not synchronously trigger other hooks, which
        // can only be false when the user does something really funky.
        setCurrentInstance(target)
        const res = callWithAsyncErrorHandling(hook, target, type, args)
        unsetCurrentInstance()
        resetTracking()
        return res
      })
    if (prepend) {
      hooks.unshift(wrappedHook)
    } else {
      hooks.push(wrappedHook)
    }
    return wrappedHook
  } else if (__DEV__) {
    const apiName = toHandlerKey(ErrorTypeStrings[type].replace(/ hook$/, ''))
    warn(
      `${apiName} is called when there is no active component instance to be ` +
        `associated with. ` +
        `Lifecycle injection APIs can only be used during execution of setup().` +
        (__FEATURE_SUSPENSE__
          ? ` If you are using async setup(), make sure to register lifecycle ` +
            `hooks before the first await statement.`
          : ``)
    )
  }
}

export const createHook =
  <T extends Function = () => any>(lifecycle: LifecycleHooks) =>
  (hook: T, target: ComponentInternalInstance | null = currentInstance) =>
    // post-create lifecycle registrations are noops during SSR (except for serverPrefetch)
    (!isInSSRComponentSetup || lifecycle === LifecycleHooks.SERVER_PREFETCH) &&
    injectHook(lifecycle, (...args: unknown[]) => hook(...args), target)
```

3. 收集所有定义的钩子之后。执行`setupRenderEffect`函数
在该函数里面，就会执行在外面各种定义好的生命钩子

```js
// packages\runtime-core\src\renderer.ts

// beforeMount hook
if (bm) {
    invokeArrayFns(bm)
}
// mounted hook
if (m) {
    queuePostRenderEffect(m, parentSuspense)
}

// beforeUpdate hook
if (bu) {
    invokeArrayFns(bu)
}

// updated hook
if (u) {
    queuePostRenderEffect(u, parentSuspense)
}
```

4. 移除组件的时候，会执行`unmountComponent`(packages\runtime-core\src\renderer.ts)

就会执行定义好的删除钩子
```js
  const unmountComponent = (
    instance: ComponentInternalInstance,
    parentSuspense: SuspenseBoundary | null,
    doRemove?: boolean
  ) => {
    // beforeUnmount hook
    if (bum) {
        invokeArrayFns(bum)
    }

    // unmounted hook
    if (um) {
      queuePostRenderEffect(um, parentSuspense)
    }
  }

```

## 总结
生命周期是在生成render函数执行开始执行的。其中`beforeCreated`,`created`钩子直接执行，没有保存到instance里面
其他的生命钩子如：`beforeMount` , `mounted` , `updated`，首先会收集起来，保存到instance里面
在合适的时机调用

其中钩子`destroyed`, `deforeDestroyed`。在vue3中已经移除。
但是为了兼容vue2的写法，在模块`@vue/vue-compat`中还可以使用，这个库是为了可以吧迁移vue2到vue3

```js
if (__COMPAT__) {
    if (
      beforeDestroy &&
      softAssertCompatEnabled(DeprecationTypes.OPTIONS_BEFORE_DESTROY, instance)
    ) {
      registerLifecycleHook(onBeforeUnmount, beforeDestroy)
    }
    if (
      destroyed &&


      softAssertCompatEnabled(DeprecationTypes.OPTIONS_DESTROYED, instance)
    ) {
      registerLifecycleHook(onUnmounted, destroyed)
    }
}
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
        <button @click="changeed">获取数据</button>
        <test v-if="show"></test>
    </div>
    <script>
        const { createApp } = Vue;

        var app = createApp({
            data() {
                return {
                    show: true
                }
            },
            created() {
                // debugger
                console.log('createdt：生命周期')
            },
            // beforeMount() {
            //     debugger
            //     console.log('beforeMount：生命周期')
            // },
            // mounted() {
            //     debugger
            //     console.log('mounted: 生命周期')
            // },
            methods: {
                changeed() {
                    this.show = !this.show;
                }
            }
        });
        app.component('test', {
            template: '<h1>test</h1>',
            created() {
                console.log('created:test')
            },
            destroyed() {
                debugger
                console.log('destroyed')
            }
        })

        app.mount('#app');

        
        // onMounted(() => {
        //     console.log('挂载完毕')
        // })
    </script>
</body>
</html>
```