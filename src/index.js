import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';

import App from './App';
import rootReducer from './reducers';
import rootSaga from './sagas';
import * as serviceWorker from './serviceWorker';

import './index.css';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  rootReducer,
  {},
  compose(
    applyMiddleware(
      sagaMiddleware,
    ),
  ),
);

sagaMiddleware.run(rootSaga);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
