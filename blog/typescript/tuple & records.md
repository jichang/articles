最近在做一个简单的功能，就是针对一个固定格式的日志，解析之后展示出来，例如

```typescript
// 格式为 时间戳.主体.行为
const log = "1599625133958.users.login";
```

则需要展示

```
Wed Sep 09 2020 12:18:53 用户登录
```

整个在云平台上应该比较常见，用户展示用户最近执行的操作。假设输入数据的格式总是正确的，那么我们可以使用如下方法来解析具体的日志：

```typescript
function parseLog(log: string): [number, string, string] {
  const [timestamp, obj, action] = log.split(".");
  return [parseInt(timestamp, 10), obj, action];
}

const log = "1599625133958.users.login";

// timestamp 为 number，obj 和 action 都是 string
const [timestamp, obj, action] = parseLog(log);
```

这里，我们使用了 Tuple `[number, string, string]` 来表示返回值类型。在多数语言里，Tuple 类型都会使用格式 `(number, string, string)` 来表示，但是 TypeScript 为了更接近 JavaScript 的语法，使用了`[]`。

例如，上面的代码如果用普通数组来做，写成：

```typescript
function parseLog(log: string): (number | string)[] {
  const [timestamp, obj, action] = log.split(".");
  return [parseInt(timestamp, 10), obj, action];
}

const log = "1599625133958.users.login";

// timestamp, obj 和 action 都是 string | number
const [timestamp, obj, action] = parseLog(log);
```

如果使用数组，因为不像 Tuple 那样可以确定指定位置的类型，timestamp、obj 和 action 类型都变成了 `string | number`，除了在函数内返回时校验严格程度下降，在使用返回值时，也要多一步做类型转换或者类型判定的操作，例如对于 timestamp，我们需要做一步确认其为 number 类型的操作。

但 Tuple 类型也不是没有问题，由于最早 tuple 中元素不支持命名，对于类型数量较多的情况，很容易出现一种不能确定某个位置的值到底什么意义的问题。例如

```typescipt
type Person = [string, number, /* 若干类型 */, string]
```

在 Tuple 元素多了之后，很容易知道第一个元素是 string 类型，但是却不知道这个值本身代表了什么，所以在 4.0 中，TypeScript 支持了对 Tuple 中元素进行命名。

```
type Person = [name: string, age: number, /* .... */, address: string]
```

我们一开始的代码可以改成

```typescript
function parseLog(
  log: string
): [timestamp: number, obj: string, action: string] {
  return log.split(".") as [number, string, string];
}

const log = "1599625133958.users.login";

const [timestamp, obj, action] = parseLog(log);
```

这段代码单独看是没有问题的，但是如果考虑使用者，还是有些不太好的地方，特别是当此函数是公开函数，虽然使用者可以知道各个位置具体的类型，但是对于这个匿名的 Tuple 返回值，实际上还是缺乏一点具体的认知，所以一般还是要加上具体的命名，就像上边的 Person 一样。

```typescript
type Log = [timestamp: number, obj: string, action: string];

function parseLog(log: string): Log {
  return log.split(".") as [number, string, string];
}

const log = "1599625133958.users.login";

const [timestamp, obj, action] = parseLog(log);
```

这就像是 F# 4.7 里加入了匿名的 Record，用于局部返回值类型，避免开发者要对很多中间值声明特定的类型，方便了不少，但是 Don Syme 曾经表示，这东西在做原型和局部函数返回值有用处，但是长远来看，所有匿名 Record 都会转成有具体名字的 Record，就像这里的 Log 一样。
