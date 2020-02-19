import { all } from 'redux-saga/effects';

import liftSaga from './liftSaga';
import simulatorSaga from './simulatorSaga';
import testSaga from './testSaga';

export default function* rootSaga() {
  yield all([
    liftSaga(),
    simulatorSaga(),
    testSaga(),
  ]);
}
