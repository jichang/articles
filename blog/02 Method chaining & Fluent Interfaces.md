Method chaining/Fluent Interfaces is a very common programming pattern in OO programming languages. It's often used when you want to calling multiple functions or same function mutiple times on the same object.

In frontend, the most famous library using this pattern should be jQuery.

```javascript
$('some-dom-id')
  .css('background-color', 'blue')
  .data('purpose', 'test')
  .hide().
```

In backend, people usually use method chaining in these so-called builder pattern, like

```csharp
PeopleBuilder pb = new PeopleBuilder();
People p = pb.setName("John Doe")
    .setAge(10)
    .setSex("male")
    .build();
```

Even though it all looks similar, there might have some subtle differences between different languages when implementing this pattern.

Normally in OO languages, you need to return this/self in those chained functions

```javascript
class People {
  constructor() {
    this.name = "";
    this.age = 0;
    this.sex = "male";
  }

  setName(name) {
    this.name = name;
    return this;
  }

  setAge(age) {
    this.age = age;
    return this;
  }

  setSex(sex) {
    this.sex = sex;
    return this;
  }

  replaceName(newName) {
    let oldName = this.name;
    this.name = newName;

    return oldName;
  }
}

let people = new People();
people.setName("John Doe").setAge(10).setSex("male");
```

But this approach has one problem: you might not able to call functions that has return values, like function replaceName in the example above, as you can't return two values at the same time.

How to solve this problem ?

1. If you are using languagues like C# that has out or ref parameters, you can overcome this by using an extra parameter.

   ```csharp
   class People {
     //....
     People swapName(String newName, out String oldName) {
       oldName = this.name;
       this.name = newName;
       return this;
     }
   }
   ```

   _People always say XX doesn't need fancy features and it will make code less readable, but my opinion is that it's pretty good to have those features when you really need it and it's not those fancy feature makes code less readable, it's the way how you use it._

2. Some languages designers think it's an very essential programming pattern and it even deserves an operator, like Pony, it has a specifial operatro **.>** for this purpose.

   ```pony
   class People
     var name: String
     var age: U32

     new create(name': String, age': U32) =>
       name = name'
       age = age'

     fun ref setName(name': String) =>
       name = name'

     fun ref setAge(age': U32) =>
       age = age'

   actor Main
     new create(env: Env) =>
       let people = People("init", 10)
       people
         .>setName("nameA")
         .>setAge(10)
       env.out.print("Hello, world!")
   ```

   Basically, in Pony,

   `obj.>method()`

   is equal to

   ```
   (obj.method();obj)
   ```

   Pony is expression-based, so the value of above code is the value of last expression **obj**

   You can see that sometimes one build-in operator will save a log of work and make the code much more flexible, you don't even need to change the existing code.

   In those flexiable dynamically languages like JavaScript, you can build your own **.>** operator by functions. The naive way can be

   ```
   class People {
     // ....

     chain(fun, args) {
       fun.apply(this, args);

       return this;
     }
   }

   let people = new People();
   people
     .chain(people.setName, ["name"])
     .chain(people.setAge, [10]);
   ```
