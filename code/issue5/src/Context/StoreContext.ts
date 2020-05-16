import React from 'react';
import { lens, compose } from '../Lens';

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

export type Action = (store: IStore) => IStore;

export interface IStoreContext {
  store: IStore,
  dispatch: (action: Action) => void;
}

export const initialContext: IStoreContext = {
  store: initialStore,
  dispatch: () => { }
}

export const StoreContext = React.createContext<IStoreContext>(initialContext);

export function reducer(store: IStore, setter: Action) {
  return setter(store);
}

export const storeUserLens = lens<IStore, 'user'>('user');
export const userProfileLens = lens<IUser, 'profile'>('profile')

export const profileNameLens = lens<IProfile, 'name'>('name');

export const storeUserProfileLens =
  compose<IStore, IUser, IProfile>(storeUserLens)(userProfileLens)

export const storeUserProfileNameLens =
  compose<IStore, IProfile, string>(storeUserProfileLens)(profileNameLens)

