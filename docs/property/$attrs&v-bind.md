# $attrs 解读




```js
(function anonymous(
) {
const _Vue = Vue
const { createVNode: _createVNode, createElementVNode: _createElementVNode } = _Vue

const _hoisted_1 = /*#__PURE__*/_createElementVNode("div", { class: "class-test" }, "444", -1 /* HOISTED */)

return function render(_ctx, _cache) {
  with (_ctx) {
    const { resolveComponent: _resolveComponent, mergeProps: _mergeProps, createVNode: _createVNode, createElementVNode: _createElementVNode, normalizeProps: _normalizeProps, guardReactiveProps: _guardReactiveProps, Fragment: _Fragment, openBlock: _openBlock, createElementBlock: _createElementBlock } = _Vue

    const _component_test = _resolveComponent("test")

    return (_openBlock(), _createElementBlock(_Fragment, null, [
      _createVNode(_component_test, _mergeProps(dateMap, { class: "class-test" }), null, 16 /* FULL_PROPS */),
      _createElementVNode("div", _mergeProps(dateMap, { class: "class-test" }), "222", 16 /* FULL_PROPS */),
      _createElementVNode("div", _normalizeProps(_guardReactiveProps(dateMap)), "333", 16 /* FULL_PROPS */),
      _hoisted_1
    ], 64 /* STABLE_FRAGMENT */))
  }
}
})
```

### 相关代码
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="../../dist/vue.global.js"></script>
</head>
<body>
    <div id="app">
        <test v-bind="dateMap" class="class-test">
        </test>
        <div v-bind="dateMap" class="class-test">222</div>
        <div v-bind="dateMap">333</div>
        <div class="class-test">444</div>
    </div>
    </div>
    <script>
        var { createApp  } = Vue;

        var app = createApp({
            data() {
                return {
                    dateMap: {
                        style: {
                            color: 'red',
                        },
                        date: 1,
                        tips: '111212'
                    }
                }
            },
        })

        app.component('test', {
            props: {
                tips: {
                    type: String
                }
            },
            template: `
                <div>
                   <h1>11</h1>
                </div>
            `,
            mounted() {
                console.log(this.$attrs)
            }
        })

        app.mount('#app')
    </script>
</body>
</html>
```



