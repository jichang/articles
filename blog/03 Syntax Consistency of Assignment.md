Assignment is a fundamental operation, consistency is an essential requirement for programming language syntax, but surprisingly, there are some languages which don't provide consistent syntax for assignemnt.

For example, in JavaScript, most of time, when you want to do assignment, you need to use **_"="_** operator.

```
let str = "a"
let num = 0

let fun = function () {
  console.log("hello, world")
};
```

but there's one exception. When you want to create an object, somehow you need to use **_":"_** to assign value to property.

```
let a = {
  field: 1  // why ":" instead of "="
};
```

But in F#/Haskell and other ML family languges, **_"="_** is used for property assignment in records

```
let a = { filed = 1 }
```
