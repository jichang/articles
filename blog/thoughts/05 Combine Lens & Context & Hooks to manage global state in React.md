Complete Code: [issue5](https://github.com/JacobChang/articles/tree/master/code/issue5)

Recently I was working on a personal projects with React. Since it's not a big projects, I decide to get rid of any state management library.

For component level, it's simple, we can just use Hooks to solve this, like useState, useReducer. But how to manage a global state in a React app ? Luckily, we have Context. so we can just manage state in top level component with useReducer, and leverage Context to pass those data to child component.

```TypeScript
export interface IProfile {
  name: string;
  age: number;
  country: string;
}

export interface IUser {
  id: number;
  profile: IProfile
}

export interface IStore {
  user: IUser;
}

export const initialStore: IStore = {
  user: {
    id: 0,
    profile: {
      name: 'initial user name',
      age: 0,
      country: 'anywhere'
    }
  },
}

export type Action = (store: IStore) => IStore; // explain later

export interface IStoreContext {
  store: IStore,
  dispatch: (action: Action) => void;
}

export const initialContext: IStoreContext = {
  store: initialStore,
  dispatch: () => {
    throw new Error('this initial function should never be called')
  }
}

export const StoreContext = React.createContext<IStoreContext>(initialContext);

// explain later
export function reducer(store: IStore, setter: Action) {
  return setter(store);
}

```

```TypeScript
import React from 'React';

import { reducer, initialStore, StoreContext } from './Context/StoreContext';

export function App() {
    <StoreContext.Provider value={{ store, dispatch }}>
      <div className="App">
        <header className="App-header">
          <StoreContext.Consumer>
            {({ store, dispatch }) => {
              return (
                <div>
                  <p>{JSON.stringify(store)}</p>
                </div>
              )
            }}
          </StoreContext.Consumer>
        </header>
      </div>
    </StoreContext.Provider>
}
```

It looks good so far, we have solve the global state management with Context & Hooks. but there's several problem bother me a lot. Normally, when we use reducer, we intend to define a lot of action and update store use a big switch statement.

```TypeScript
export interface IUpdateUserName {
  kind: 'updateUserName'
  payload: {
    username: string
  }
}

type Action = UpdateUserName

export function reducer(store: IStore, action: Action) {
  switch(action.kind) {
    case 'updateUserName':
        return {
            ...store,
            user: {
                ...store.user,
               profile: {
                   ...store.user.profile,
                   username: action.payload.username
               }
            }
        };
    break;
  }
}


// Then we can dispatch action in component like this
dispatch({
  action: 'updateUserName',
  payload: {
    username: 'new user name'
  }
})

```

Consider the code above, it's really not a joy to update nested property in state, even though spread operator has save us a lot of work and type checking can make sure we don't update the wrong field, but can we make it better ?

Then I really why not use Lens and just dispatch a setter ? This is why at first, the action type is defined as

```TypeScript
export type Action = (store: IStore) => IStore
```

If you don't familiar with Lens, you can consider it as a combination of getter and setter function. Getter is used to read value and Setter is used to update value. Here's a simple version of Lens

```TypeScript
export interface ILens<A, B> {
    get: (a: A) => B;
    set: (b: B) => (a: A) => A;
}

// construct a Lens from property name
// get will be a function to read property object object
// set will be a function to set value of object
export function lens<A, P extends keyof A>(prop: P): ILens<A, A[P]> {
    return {
        get: (a: A) => {
            return a[prop];
        },
        set: (propValue: A[P]) => {
            return (a: A) => {
                return {
                    ...a,
                    [prop]: propValue,
                }
            }
        }
    }
}

// compose can combine a fuction to form another Lens
//  it's useful when we want to read/write nested value
export const compose = <A, B, C>(lensAB: ILens<A, B>) => {
    return (lensBC: ILens<B, C>): ILens<A, C> => {
        return {
            get: (a: A) => {
                return lensBC.get(lensAB.get(a))
            },
            set: (c: C) => {
                return (a: A) => {
                    const b = lensAB.get(a);
                    const updatedB = lensBC.set(c)(b)
                    return lensAB.set(updatedB)(a)
                }
            }
        }
    }
}
```

Next, we can define some lens for IStore property and see how to dispatch lens to update username

```TypeScript
export const storeUserLens = lens<IStore, 'user'>('user');
export const userProfileLens = lens<IUser, 'profile'>('profile')
export const profileNameLens = lens<IProfile, 'name'>('name');

export const storeUserProfileLens =
  compose<IStore, IUser, IProfile>(storeUserLens)(userProfileLens)

export const storeUserProfileNameLens =
  compose<IStore, IProfile, string>(storeUserProfileLens)(profileNameLens)



// In component, we can use getter to retrive nested value and dispatch a setter to update user name
          <StoreContext.Consumer>
            {({ store, dispatch }) => {
              return (
                <div>
                  <p>{storeUserProfileNameLens.get(store)}</p>
                  <button type="button" onClick={evt => {
                    dispatch(storeUserProfileNameLens.set('new user name'));
                  }}>Update name</button>
                </div>
              )
            }}
          </StoreContext.Consumer>

```

Note, this lens definition is not very well formed, it you want to use Lens in your project, you can try [monocle-ts](https://github.com/gcanti/monocle-ts)
