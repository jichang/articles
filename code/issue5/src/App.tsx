import React, { useReducer } from 'react';
import logo from './logo.svg';
import './App.css';
import { reducer, initialStore, StoreContext, storeUserProfileNameLens } from './Context/StoreContext';

function App() {
  const [store, dispatch] = useReducer(reducer, initialStore);

  return (
    <StoreContext.Provider value={{ store, dispatch }}>
      <div className="App">
        <header className="App-header">
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
        </header>
      </div>
    </StoreContext.Provider>
  );
}

export default App;
