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