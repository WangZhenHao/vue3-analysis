# watch的实现原理

## 在组合式api如何使用watch呢？

1. `watch`方法是在`packages\runtime-core\src\apiWatch.ts`里面，主要是`doWatch`函数执行

2. watch监听有好几种写法，每种写法都需要注意其中的内部处理

### 2-1：监听ref类型

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