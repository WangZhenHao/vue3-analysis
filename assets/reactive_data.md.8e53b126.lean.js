import{_ as e,c as n,o as l,N as a,x as s,a as t}from"./chunks/framework.7c29c9c7.js";const _=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"reactive/data.md"}'),p={name:"reactive/data.md"},o=a("",7),c=s("ul",null,[s("li",null,[s("p",null,"判断{msg: 'hello vue'},也就是form对象有没有new Map()对象，如果没有创建一个")]),s("li",{"msg:":"",hello:"",vue:""},[s("p",null,"targetMap.set(target, (depsMap = new Map()))，target就是")]),s("li",null,[s("p",null,"depsMaps类似对象，存储key作为键值命")]),s("li",null,[s("p",null,"判断let dep = depsMap.get(key) 中的dep有没有值，如果没有创建一个dep = new Set()")]),s("li",null,[s("p",null,[t("添加依赖dep.add(activeEffect!) "),s("code",null,"ReactiveEffect2为渲染函数")])]),s("li",null,[s("p",null,"dep类似数组，存储渲染函数")])],-1),r=a("",3),i=s("ul",null,[s("li",{"msg:":"",hello:"",vue:""},"targetMap.set(target, (depsMap = new Map()))，target就是"),s("li",null,"由于depsMaps已经有了，所以不需要重新创建，取值let dep = depsMap.get(key)，这里的key也就是text"),s("li",null,"判断dep有没有，这里发现不存在，于是创建一个dep = new Set()"),s("li",null,"添加依赖dep.add(activeEffect!)")],-1),C=a("",20),A=[o,c,r,i,C];function d(u,g,y,D,h,m){return l(),n("div",null,A)}const v=e(p,[["render",d]]);export{_ as __pageData,v as default};
