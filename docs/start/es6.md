# es6 特性 Proxy, Set, Map

## Map
Map 对象是键值对的集合。

Map 中的一个键只能出现一次；它在 Map 的集合中是独一无二的。Map 对象按键值对迭代——一个 for...of 循环在每次迭代后会返回一个形式为 [key，value] 的数组。迭代按插入顺序进行，即键值对按 set() 方法首次插入到集合中的顺序（也就是说，当调用 set() 时，map 中没有具有相同值的键）进行迭代。

https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map

```
const contacts = new Map()
contacts.set('Jessie', {phone: "213-555-1234", address: "123 N 1st Ave"})
contacts.has('Jessie') // true
contacts.get('Hilary') // undefined
contacts.set('Hilary', {phone: "617-555-4321", address: "321 S 2nd St"})
contacts.get('Jessie') // {phone: "213-555-1234", address: "123 N 1st Ave"}
contacts.delete('Raymond') // false
contacts.delete('Jessie') // true
console.log(contacts.size) // 1
```

## WeakMap

WeakMap 对象是一组键/值对的集合，其中的键是弱引用的。其键必须是对象，而值可以是任意的, WeakMap 的 key 只能是 Object 类型。 原始数据类型 是不能作为 key 的（比如 Symbol）。

https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap

```
const wm1 = new WeakMap(),
wm2 = new WeakMap(),
wm3 = new WeakMap();
const o1 = {},
    o2 = function() {},
    o3 = window;
wm1.set(o1, 37);
wm1.set(o2, 'azerty');
wm2.set(o1, o2); // value 可以是任意值，包括一个对象或一个函数
wm2.set(o3, undefined);
wm2.set(wm1, wm2); // 键和值可以是任意对象，甚至另外一个 WeakMap 对象
wm1.get(o2); // "azerty"
wm2.get(o2); // undefined，wm2 中没有 o2 这个键
wm2.get(o3); // undefined，值就是 undefined
wm1.has(o2); // true
wm2.has(o2); // false
wm2.has(o3); // true (即使值是 undefined)
wm3.set(o1, 37);
wm3.get(o1); // 37
wm1.has(o1); // true
wm1.delete(o1);
wm1.has(o1); // false
```

## Set

Set 对象允许你存储任何类型的唯一值，无论是原始值或者是对象引用。类似数组

因为 Set 中的值总是唯一的，所以需要判断两个值是否相等。在 ECMAScript 规范的早期版本中，这不是基于和===操作符中使用的算法相同的算法。具体来说，对于 Set，+0（+0 严格相等于 -0）和 -0 是不同的值。然而，在 ECMAScript 2015 规范中这点已被更改。有关详细信息，请参阅浏览器兼容性表中的“Key equality for -0 and 0”。
另外，NaN 和 undefined 都可以被存储在 Set 中，NaN 之间被视为相同的值（NaN 被认为是相同的，尽管 NaN !== NaN）。

https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set

```
let mySet = new Set();

mySet.add(1); // Set [ 1 ]
mySet.add(5); // Set [ 1, 5 ]
mySet.add(5); // Set [ 1, 5 ]
mySet.add("some text"); // Set [ 1, 5, "some text" ]
let o = {a: 1, b: 2};
mySet.add(o);

mySet.add({a: 1, b: 2}); // o 指向的是不同的对象，所以没问题

mySet.has(1); // true
mySet.has(3); // false
mySet.has(5);              // true
mySet.has(Math.sqrt(25));  // true
mySet.has("Some Text".toLowerCase()); // true
mySet.has(o); // true

mySet.size; // 5

mySet.delete(5);  // true，从 set 中移除 5
mySet.has(5);     // false, 5 已经被移除

mySet.size; // 4，刚刚移除一个值

console.log(mySet);
```

## 相关代码

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <script>
    var obj = {
      a: 1,
      b: 2
    }
    var p = new Proxy(obj, {
      get(target, key, value) {
        console.log('触发get', target, key, value)

        return target[key]
      },
      set(target, key, value) {
        console.log('触发set', target, key, value)
        target[key] = value
      }
    })

    var a = p.a;
    p.c = 3
    var c = p.c
    // console.log(p)

    /* 声明响应函数cb */
    const effectStack = []
    function effect(cb){  // 对函数进行高阶封装  
      const rxEffect = function(){    
        // 1.捕获异常    
        // 2.fn出栈入栈    
        // 3.执行fn    
        try{      
          effectStack.push(rxEffect)      
          return cb()  
        } finally{
          effectStack.pop()
        }
        
      } 
       // 最初要执行一次,进行最初的依赖收集  
      rxEffect()

      return rxEffect
    }
    
    // effect(function() {
    //   return 1
    // })

    
    /**
     Set
    */

    function testSet() {

    }

    // testSet()

    /*
     WeakMap
    */
    function testWeakMap(target) {
      var targetMap = new WeakMap();
      var depsMap = new Map();
      targetMap.set(target, depsMap)

      console.log(targetMap, targetMap.get(target))
    }

    // testWeakMap({name: 'wzh', age: 12})

  </script>
</body>
</html>
```

