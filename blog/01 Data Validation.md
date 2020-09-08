As a FE programmer, You, might like me, spend a lot of time on error handling every day. And most of these errors are caused by invalid data, like incorrect function paramters, illegal user input, incomplete api response, malware data attacks. You might write a lot of defensive code here and there to handle those errors. But is there a better way to solve this kind of problem ?

Basically, there are 2 kinds of data validation, each of them has their own solutions for finding and handling errors.

1. **_internal data validation_**

Internal data are created and consumed in the same system, maybe it's defined for internal usage or created from validated input. For this kind of data, because you have full control of the data, you should be able to handle this problem safely.

There are 2 common ways for internal data validation: types and tests. On the internet, a lot of people argue about which is necessary for robust programing, tests or types ? In my opinion, both of them are necessary and there two methods can help you developing great and robust program.

**Types: Make Illegal States Unrepresentable**

"Make Illegal States Unrepresentable" is a famous phrase from Yaron Minsky in 2011. The idea of this phrase is that instread of handling data errors, you shouldn't be able to write illegal data at first place. When I started FE development several years ago, it always bothers me that people use string lateral as function arguments. Like

```javascript
$.fullPage({
  // ...
  easing: "easeInOutCubic",
  easingcss3: "ease",
  // ...
});
```

Until I learned JavaScript and realized that it doesn't have enum and types, you can only use magic numbers and strings to describe options. The consequence of this is that library users need to spend mins even hours on debugging until they find out it's a typo error. On the other hand, responsible library writers need to write a lot of checking code, like below

```javascript
function fullPage() {
  // ...
  if (easing !== "easeInOutCubic") {
    // Normally, JS library will not throw exception, because it might
    // crash user's applciation if they don't catch exceptions, so
    // they intend to log some warning message and use some defaut config to continue
    // In my option, it's worse for debugging and investigating
    throw Error("invalid ease option");
  }
  // ...
}
```

It's the price we paid for dynaimc typed language. That's why JS programmers feel good when writing small libaries, but when working on big projects, they will lose their confidence.

Fortunately, we have TypeScript/Flow nowadays. In there languages, they support string lateral types and union types. It can significantly improve the safety and maintainibility of code base.

```typescript
type Direction = "up" | "down" | "left" | "right";

function turn(direction: Direction) {
  switch (direction) {
    case "up":
      break;
    // ...
  }
}
```

And if you are working on some new projects and you don't mind learning new languages, I sugguest you try some transpiled-to-javascrpt stack, like [Fable](https://fable.io), [Elm](https://elm-lang.org) or [Reason](https://reasonml.github.io/).

```fsharp
// this is a demo written with Elmish(https://elmish.github.io/elmish/index.html)
type Model =
    { x : int }

type Msg =
    | Increment
    | Decrement

open Elmish

let init () =
    { x = 0 }, Cmd.ofMsg Increment

let update msg model =
    match msg with
    | Increment when model.x < 3 ->
        { model with x = model.x + 1 }, Cmd.ofMsg Increment

    | Increment ->
        { model with x = model.x + 1 }, Cmd.ofMsg Decrement

    | Decrement when model.x > 0 ->
        { model with x = model.x - 1 }, Cmd.ofMsg Decrement

    | Decrement ->
        { model with x = model.x - 1 }, Cmd.ofMsg Increment

Program.mkProgram init update (fun model _ -> printf "%A\n" model)
|> Program.run
```

I highly recommended [SAFE stack](https://safe-stack.github.io/) if you are interested. It's a unversal web framework. You can write your application in the same language **[F#](https://fsharp.org)**. All your frontend and backend will be written in F#, it's easy to share your domain model between BE and FE. F# is good, it has great but not too complicated type system. The whole stack runs on .Net Core, it's cross platform and you can use a lot of great tech from Microsoft and Community.

**Tests: Make Illegal Logic Unexecutable**

People using strong typed language always say "Once it compiles, it works". Unfortunately, this is not true. Even though, types can eliminate some kinds fo bugs, it can not eliminate all bugs. Great type system can make sure several bad thing will never happer, like you don't get a number if you want a string, you can not use a unknown property or the null referece problem. But business logic or algorithm error can not be solved by type system, thought it helps a lot.

In this case, you need tests. To be honest, I don't write a lot of tests, I'm lazy and most of my daily work has QA team, and again I'm really lazy. But if you ask me, I do have some suggestions for this

a. run tests automatically
b. use types to make sure that all cases are handled, like options property...
c. write unit tests for critical module/function, no need to pursue 100% code coverage. I suggest you learn about property based testing, in my opioion, reproducable random tests is more reliable than manually defined test.
d. write integration tests for important business process.

2. **_external data validation_**

Once you make internal system safe, you can deal with the cruel world now.

For this part, if you are using static typed languages, most of time you will be fine. Because the type system will require you validate data before you get data from outside world. Basically, you need to remember 2 things

a. using proper validation when doing serialization/deserialization

Please remeber, allocate a memory chunk for data then use some magic type conversion to get what you want is totally wrong way for deserialization, vice verse.

b. don't use raw pointer conversion (This for C/C++ programmers).

If you are using dynamic typed languages, the suggestion is simple: just make you code runs like a static typed language. For example, you might used to write code like this

```typescript
interface User {
  id: number;
  name: string;
  age?: number;
  email: string;
}

let user: User = await callApiOrUseUserInput();
// ....
```

The assumption here is that call api or user input will always return valid data which match the requirement of interface User. But this is not always true, like backend has incompatible change, user input invalid data. So to make sure there bad things will not effect the behavior of program, you need to validate data before using.

```typescript
interface User {
  id: number;
  name: string;
  age?: number;
  email: string;
}

let data: any = await callApiOrUseUserInput();
// In function validate, youu need to check data match the interface User,
// like id, name, email has the right type and value.
// For age, you need to make sure it either doesn't exist or it's a number.
let result: User | Error = validate(data);
// You need to handle error implicitly
```

For error handling of invalid data from outside world, I will suggest the philosophy of Erlang: Let it crash. Because PM/Operators/Users might not think it's a error, they might raise a ticket or they will continue their process, which will make the debugging and reproduce steps much more difficult. Of cource, it you are working on FE, we can't just let app crash, it will heart user experience. In this case, we can setup some global handler to show popup or error message, but never ever let the program run with default config silently. It will be a nightmare.
