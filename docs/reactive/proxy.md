# Proxy特性在Vue3的应用

## 简单实现Vue3响应式

通过Vue3源码的抽丝剥茧，整理一个简单的应用，通过修改对象属性，实现html页面的更新

## 实例代码
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >
    <title>Document</title>
</head>

<body>
    <div id="app"></div>
    <script>
        var effectActive = null;
        var targetMap = new WeakMap();

        var track = function (target, key) {
            var depsMap = targetMap.get(target);
            if (!depsMap) {
                depsMap = new Map();
                targetMap.set(target, depsMap)
            }

            var dep = depsMap.get(key)
            if (!dep) {
                dep = new Set();
                depsMap.set(key, dep)
            }

            if (!dep.has(effectActive)) {
                dep.add(effectActive)
            }

            // console.log(targetMap)
        }
        var trigger = function (target, type, key, value, oldValue) {
            var depsMap = targetMap.get(target);
            if (!depsMap) {
                return;
            }
            var deps = []
            
            if (key !== void 0) {
                deps.push(depsMap.get(key))
            }

            triggerEffects(deps[0])
            // if (deps.length === 1) {
            //     triggerEffects(deps[0])
            // } else {
            //     const effects = []
            //     for (const dep of deps) {
            //         if (dep) {
            //             effects.push(...dep)
            //         }
            //     }
            //     triggerEffects(new Set(effects))
            // }
        }
        var triggerEffects = function (deps) {
            const effects = Array.isArray(deps) ? deps : [...deps]

            for (const effect of effects) {
                if(effect.scheduler) {
                    effect.scheduler();
                } else {
                    effect.run();
                }
            }
        }

        var baseHandlers = {
            get(traget, key, receiver) {
                const res = Reflect.get(traget, key, receiver)
                track(traget, key)

                if(typeof res === 'object') {
                    return reactive(res)
                }

                return res;
            },
            set(target, key, value, reactiver) {
                var oldValue = target[key]

                const hadKey = Object.prototype.hasOwnProperty.call(target, key)
                const result = Reflect.set(target, key, value, reactiver)
                
                if (!hadKey) {
                    trigger(target, 'ADD', key, value)
                } else if (value !== oldValue) {
                    trigger(target, 'SET', key, value, oldValue)
                }

                return result
            }
        }
        var reactive = function (target) {
            var proxy = new Proxy(target, baseHandlers)

            return proxy
        }

        var ReactiveEffect = function (fn, scheduler) {
            this.fn = fn;
            this.scheduler = scheduler;
        }
        ReactiveEffect.prototype.run = function () {
            try {
                effectActive = this
                return this.fn();
            } finally {
            }
        }

        var queue = [];
        var currentFlushPromise = null;
        var resolvedPromise = Promise.resolve();
        var count = 0
        function flushJobs(seen) {
            try {
                // ++count
                // console.log(count)
                for(var flushIndex = 0; flushIndex < queue.length; flushIndex++) {
                    let job = queue[flushIndex]
                    job();
                }
            } finally {
                queue.length = 0;
            }
            
        }
        /**
            多次修改值更新一次视图        
        */
        function queseJob(job) {
            
            if(!queue.length || !queue.includes(job)) {
                queue.push(job)
                currentFlushPromise = resolvedPromise.then(flushJobs)
            }

            
            // setTimeout(() => {
            //     flushJobs
            // })
        }
    </script>
    <script>



        var form = {
            name: 'wzh',
            age: '15',
            count: { 
                a: 0
             }
        }
        var data = reactive(form)
        
        var updateComponent = function () {
            var dom = document.querySelector('#app')
            var render = `
            <p>${data.name}</p>
            <p>${data.age}</p>
            <h1>count: ${data.count.a}</h1>
            <h1>count2: ${data.count2 ? data.count2 : ''}</h1>
            `

            dom.innerHTML = render;

            return dom;
        }
        var update = () => {
            effect.run();
        }
        var effect = new ReactiveEffect(updateComponent, () => queseJob(update))

        update()

        setTimeout(() => {
            data.count2 = '未定义'
            data.count.a = 1
        }, 1000);

        // setTimeout(() => {
        //     data.count2 = '未定义2'
        //     data.count.a = 2
        // }, 3000);

        setInterval(() => {
            data.count.a++
        }, 3000)
    </script>
</body>

</html>
```