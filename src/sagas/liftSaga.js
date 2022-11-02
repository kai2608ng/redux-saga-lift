import {
  delay,
  put,
  select,
  take,
  takeEvery,
  takeLeading,
  call,
  all,
} from "redux-saga/effects";
import * as liftActions from "../actions/liftActions";
import doorStateEnum from "../enums/doorStateEnum";
import * as selectors from "./selectors";

function* handleButtonPress(action) {
  const { button, data } = action;
  // Set lift queue
  yield put(liftActions.setLift(button, data));
  // Call the lift to move
  yield put(liftActions.getLift());
}

function* watchButtonPress() {
  yield takeEvery(liftActions.BUTTON_PRESS, handleButtonPress);
}

function* liftMoveUp() {
  const doorState = yield select(selectors.getDoorState);

  // If door is closed then move the lift
  if (doorState === doorStateEnum.CLOSED) {
    yield delay(500);
    yield put(liftActions.moveUp());
    return;
  }
  // wait for the door to close
  yield take(liftActions.CLOSE_DOOR);
  yield liftMoveUp();
}

function* liftMoveDown() {
  const doorState = yield select(selectors.getDoorState);

  // If door is closed then move the lift
  if (doorState === doorStateEnum.CLOSED) {
    yield delay(500);
    yield put(liftActions.moveDown());
    return;
  }
  // wait for the door to close
  yield take(liftActions.CLOSE_DOOR);
  yield liftMoveDown();
}

function* liftReached() {
  // Open the door
  yield put(liftActions.openDoor());
  // Open the door for 5 seconds
  yield delay(5000);
  // Close the door
  yield put(liftActions.closeDoor());
}

function* handleNext() {
  // Call the lift to handle next floor
  yield put(liftActions.getLift());
}

function* handleMove() {
  const currentFloor = yield select(selectors.getCurrentFloor);
  const targetFloor = yield select(selectors.getTargetFloor);
  const movingDirection = yield select(selectors.getMovingDirection);

  if (currentFloor < targetFloor) yield call(liftMoveUp);

  if (currentFloor > targetFloor) yield call(liftMoveDown);

  if (currentFloor === targetFloor) {
    yield call(liftReached);
    yield call(handleNext);
  }

  return;
}

function* watchLiftMove() {
  // Handle the first request that wants to move the lift
  yield takeLeading(liftActions.GET_LIFT, handleMove);
  yield takeEvery([liftActions.MOVE_DOWN, liftActions.MOVE_UP], handleMove);
}

export default function* liftSaga() {
  /* TODO: Program your saga for lift control here. 🙂 */
  yield all([watchButtonPress(), watchLiftMove()]);
}
