import { all } from 'redux-saga/effects';

import liftSaga from './liftSaga';

export default function* rootSaga() {
  yield all([
    liftSaga(),
  ]);
}
