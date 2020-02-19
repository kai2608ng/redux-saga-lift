import { put, select, takeEvery } from 'redux-saga/effects';

import * as errorActions from '../actions/errorActions';
import * as liftActions from '../actions/liftActions';
import doorStateEnum from '../enums/doorStateEnum';
import sensorStateEnum from '../enums/sensorStateEnum';

function* checkDoorsOpen() {
  const doorState = yield select(state => state.lift.doorState);
  if (doorState !== doorStateEnum.CLOSED) {
    yield put(errorActions.setError({
      error: 'Lift tried moving with doors open.',
    }));
  }
}

function* checkTopFloor() {
  const currentFloor = yield select(state => state.lift.currentFloor);
  const maximumFloor = yield select(state => state.lift.maximumFloor);
  if (currentFloor > maximumFloor) {
    yield put(errorActions.setError({
      error: 'Lift hit the ceiling causing.',
    }));
  }
}

function* checkBottomFloor() {
  const currentFloor = yield select(state => state.lift.currentFloor);
  const minimumFloor = 0;
  if (currentFloor < minimumFloor) {
    yield put(errorActions.setError({
      error: 'Lift tried moving below the ground floor.',
    }));
  }
}

function* checkSensor() {
  const sensorState = yield select(state => state.lift.sensorState);
  if (sensorState === sensorStateEnum.ON) {
    yield put(errorActions.setError({
      error: 'Lift tried closing its doors while passengers were moving through. Dangerous!',
    }));
  }
}

function* handleMoveUp() {
  yield checkDoorsOpen();
  yield checkTopFloor();
}

function* handleMoveDown() {
  yield checkDoorsOpen();
  yield checkBottomFloor();
}

function* handleCloseDoor() {
  yield checkSensor();
}

export default function* testSaga() {
  /* This saga checks for any issues with the lift. */
  yield takeEvery(liftActions.MOVE_UP, handleMoveUp);
  yield takeEvery(liftActions.MOVE_DOWN, handleMoveDown);
  yield takeEvery(liftActions.CLOSE_DOOR, handleCloseDoor);
}
