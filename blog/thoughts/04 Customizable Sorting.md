Recently, I met a small but interesting problem, it deserves a short article.

The problem is that we are building a vertical page and there are several sections in this page, like

```javascript
*************
| section A |
*************
| section B |
*************
| section C |
*************
| section D |
*************
 ...
```

We use _FlatList_ to render this page, in case you never write React Native before or don't know what's FlatList, I will a naive loop to represent the rendering process

```javascript
let sections = [
  "section A",
  "section B",
  "section C",
  "section D"
  // ...
];

render() {
  let components = sections.map(section => {
    let data = getData(section);

    // renderComponent will create component based on section and data
    return renderComponent(section, data);
  })

  return <View>{components}</View>
}
```

Then we got a requirement, sections need different order based on user's current country. The best solution might be setup a CMS-like system and let PM or operations to manually change the orders. In our code, we can just call one api and get the order of sections. the code is pretty much the same, except _sections_ is not hardcoded any more.

But if we just want to solve this by modifiing current code, basically we have too ways

1. use different orders for different country. By this way, we need to _copy_ the order of all sections for every country and change the order by need. For further changes, we only need to change the data in our code and we don't need to touch the logic. Even if we don't want to show some sections, we just need to remove the corresponding line.

```javascript
let orders = {
  countryA: [
    "section A",
    "section B",
    "section C",
    "section D"
    // ...
  ],
  countryB: [
    "section D",
    "section C",
    "section A",
    "section B"
    // ...
  ]
  // ...
};
let currentCountry = 'countryA';

render() {
  let sections = orders[currentCountry];

  let components = sections.map(section => {
    let data = getData(section);

    // renderComponent will create component based on section and data
    return renderComponent(section, data);
  })

  return <View>{components}</View>
}
```

Pros: simple, elegant, easy to debug and change.

Cons: when more countries and sections are added, this code will become longer, tedious and hard to maintain, especially when we have a lot of sections and only a few of them need different order based on country.

2. create default sorting order with interval and change the order by country.

```javascript
let sections = [
  "section A",
  "section B",
  "section C",
  "section D"
  // ...
];

let sectionsCount = sections.length;

// Here we don't use 0, 1, 2, 3 ... as orders, if you use continuous integers, once
// you want to move the last one to the second one, you might need to change a lot of code
let defaultOrders = {
  "section A": sectionsCount * 1,
  "section B": sectionsCount * 2,
  "section C": sectionsCount * 3,
  "section D": sectionsCount * 4,
  // ...
}

let orders = {
  ...defautOrders
};

if (currentCountry === "countryB") {
  orders["section D"] = defaultOrders["sectionsA"] - 2;
  orders["section C"] = defaultOrders["sectionsA"] - 1;
}

render() {
  let components = sections.sort((a, b) => {
    return orders[a] - orders[b];
  }).map(section => {
    let data = getData(section);

    // renderComponent will create component based on section and data
    return renderComponent(section, data);
  })

  return <View>{components}</View>
}
```

Pros: less duplicated code and esay to scale

Cons: more triky and more complex code.
