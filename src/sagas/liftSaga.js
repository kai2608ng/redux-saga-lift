import {
  all,
  call,
  delay,
  put,
  select,
  take,
  takeEvery,
} from "redux-saga/effects";
import buttonsEnum from "../enums/buttonsEnum";
import * as liftActions from "../actions/liftActions";
import doorStateEnum from "../enums/doorStateEnum";
import movingDirectionEnum from "../enums/movingDirectionEnum";
import sensorStateEnum from "../enums/sensorStateEnum";

function* liftMoveUp() {
  const doorState = yield select((state) => state.lift.doorState);

  if (doorState === doorStateEnum.CLOSED) {
    yield delay(500);
    yield put(liftActions.moveUp());
  }
}

function* liftMoveDown() {
  const doorState = yield select((state) => state.lift.doorState);

  if (doorState === doorStateEnum.CLOSED) {
    yield delay(500);
    yield put(liftActions.moveDown());
  }
}

function* trackSensorStateOff() {
  // delay for opening the door
  yield delay(2000);

  const sensorState = yield select((state) => state.lift.sensorState);

  if (sensorState !== sensorStateEnum.OFF) {
    yield call(trackSensorStateOff);
  }
}

function* handleDoor() {
  const doorState = yield select((state) => state.lift.doorState);

  if (doorState !== doorStateEnum.OPEN) yield put(liftActions.openDoor());

  yield take(liftActions.DOOR_SENSOR_ON);
  // Block to track sensor off
  yield call(trackSensorStateOff);

  yield put(liftActions.closeDoor());
}

function* liftReached() {
  // Remove the floor that calls the lift
  yield put(liftActions.removeCall());

  // Open Close the door
  yield call(handleDoor);

  // Search the next floor to go
  yield call(handleNextFloor);
}

function* handleNextFloor() {
  const liftOngoingFloor = yield select((state) => state.lift.liftOngoingFloor);
  const liftPendingFloor = yield select((state) => state.lift.liftPendingFloor);
  const movingDirection = yield select((state) => state.lift.movingDirection);

  if (!liftOngoingFloor.length) {
    if (!liftPendingFloor.length) {
      const lock = yield select((state) => state.lift.lock);
      // To enable only a single lift movement
      if (lock) {
        yield put(liftActions.setUnlock());
        yield put(
          liftActions.setDirection({
            direction: movingDirectionEnum.NOT_MOVING,
          })
        );
        return;
      }
    }
    // Set the pending queue to ongoing queue and reset pending queue
    yield put(liftActions.pendingToOngoing());
    // Reverse the direction
    yield movingDirection === movingDirectionEnum.UP
      ? put(liftActions.setDirection({ direction: movingDirectionEnum.DOWN }))
      : put(liftActions.setDirection({ direction: movingDirectionEnum.UP }));
  }

  // Move the lift
  yield call(handleMove);
}

function* handleMove() {
  // Get the current floor of the lift
  const liftCurrentFloor = yield select((state) => state.lift.currentFloor);
  // Get the floor that is closest to the lift
  const liftOngoingFloor = yield select(
    (state) => state.lift.liftOngoingFloor[0]
  );

  // Move down if current floor higher than ongoing floor
  if (liftCurrentFloor > liftOngoingFloor) {
    yield call(liftMoveDown);
  }
  // Move up if current floor lower than ongoing floor
  if (liftCurrentFloor < liftOngoingFloor) {
    yield call(liftMoveUp);
  }
  // Reached the ongoing floor
  if (liftCurrentFloor === liftOngoingFloor) {
    yield call(liftReached);
  }
}

// Press Up button at Ground Floor
function* handleCallUp(passengerFloor) {
  const currentDirection = yield select((state) => state.lift.movingDirection);

  if (currentDirection === movingDirectionEnum.NOT_MOVING) {
    // Let the lift know that UP button is pressed
    yield put(liftActions.setDirection({ direction: movingDirectionEnum.UP }));
    yield put(liftActions.callLift({ callFloor: passengerFloor }));
    // To enable only a single lift movement
    const lock = yield select((state) => state.lift.lock);
    if (!lock) {
      yield put(liftActions.setLock());
      yield call(handleMove);
    }
    return;
  }

  const currentFloor = yield select((state) => state.lift.currentFloor);
  const doorState = yield select((state) => state.lift.doorState);
  // Do not assign if lift reached to the passenger and the door is opened
  if (currentFloor !== passengerFloor || doorState === doorStateEnum.CLOSED)
    yield put(liftActions.pendingLift({ pendingFloor: passengerFloor }));

  // Since passenger will wait for the lift reach to them
  // If they failed to enter
  // They will press the button again
}

// Press Down button at any floor other than ground floor
function* handleCallDown(passengerFloor) {
  const currentDirection = yield select((state) => state.lift.movingDirection);

  if (currentDirection === movingDirectionEnum.NOT_MOVING) {
    // Let the lift know that the DOWN button is pressed
    yield put(
      liftActions.setDirection({ direction: movingDirectionEnum.DOWN })
    );
    yield put(liftActions.callLift({ callFloor: passengerFloor }));

    const lock = yield select((state) => state.lift.lock);
    // To enable only a single lift movement
    if (!lock) {
      yield put(liftActions.setLock());
      yield call(handleMove);
    }
  }

  if (currentDirection === movingDirectionEnum.UP) {
    const currentFloor = yield select((state) => state.lift.currentFloor);
    const doorState = yield select((state) => state.lift.doorState);
    // Do not assign if lift reached to the passenger and the door is opened
    if (currentFloor !== passengerFloor || doorState === doorStateEnum.CLOSED)
      yield put(liftActions.pendingLift({ pendingFloor: passengerFloor }));
  }

  if (currentDirection === movingDirectionEnum.DOWN) {
    const currentFloor = yield select((state) => state.lift.currentFloor);

    if (currentFloor <= passengerFloor) {
      const doorState = yield select((state) => state.lift.doorState);
      // Do not assign if lift reached to the passenger and the door is opened
      if (currentFloor !== passengerFloor || doorState === doorStateEnum.CLOSED)
        yield put(liftActions.pendingLift({ pendingFloor: passengerFloor }));
    } else yield put(liftActions.callLift({ callFloor: passengerFloor }));
  }

  // Since passenger will wait for the lift reach to them
  // If they failed to enter
  // They will press the button again
}

// Within the lift
function* handleCallRequest(passengerRequestFloor) {
  const currentDirection = yield select((state) => state.lift.movingDirection);

  if (currentDirection === movingDirectionEnum.NOT_MOVING) {
    yield put(liftActions.callLift({ callFloor: passengerRequestFloor }));

    const currentFloor = yield select((state) => state.lift.currentFloor);

    if (currentFloor < passengerRequestFloor)
      yield put(
        liftActions.setDirection({ direction: movingDirectionEnum.UP })
      );
    else if (currentFloor > passengerRequestFloor)
      yield put(
        liftActions.setDirection({ direction: movingDirectionEnum.DOWN })
      );
    // To enable only a single lift movement
    const lock = yield select((state) => state.lift.lock);
    if (!lock) {
      yield put(liftActions.setLock());
      yield call(handleMove);
    }
  }

  if (currentDirection === movingDirectionEnum.UP) {
    const currentFloor = yield select((state) => state.lift.currentFloor);
    // Assign higher floor to lift when moving upwards
    if (passengerRequestFloor > currentFloor)
      yield put(liftActions.callLift({ callFloor: passengerRequestFloor }));
    else {
      const doorState = yield select((state) => state.lift.doorState);
      // Do not assign if lift reached to the passenger and the door is opened
      if (
        currentFloor !== passengerRequestFloor ||
        doorState === doorStateEnum.CLOSED
      )
        yield put(
          liftActions.pendingLift({ pendingFloor: passengerRequestFloor })
        );
    }
  }

  if (currentDirection === movingDirectionEnum.DOWN) {
    const currentFloor = yield select((state) => state.lift.currentFloor);
    // Assign lower floor to lift when moving downwards
    if (currentFloor > passengerRequestFloor)
      yield put(liftActions.callLift({ callFloor: passengerRequestFloor }));
    else {
      const doorState = yield select((state) => state.lift.doorState);
      // Do not assign if lift reached to the passenger and the door is opened
      if (
        currentFloor !== passengerRequestFloor ||
        doorState === doorStateEnum.CLOSED
      )
        yield put(
          liftActions.pendingLift({ pendingFloor: passengerRequestFloor })
        );
    }
  }
  // Since passenger will wait for the lift to reach the floor they requested
  // If they failed to exit
  // They will press the button again
}

function* handleButtonPress(action) {
  switch (action.button) {
    // passenger press button on any floor other than ground floor
    case buttonsEnum.CALL_DOWN: {
      const passengerCurrentFloor = action.data;
      yield call(handleCallDown, passengerCurrentFloor);
      return;
    }
    // passenger press button on ground floor
    case buttonsEnum.CALL_UP: {
      const passengerCurrentFloor = action.data;
      yield call(handleCallUp, passengerCurrentFloor);
      return;
    }
    // passenger press button within the lift
    case buttonsEnum.REQUEST_FLOOR: {
      const passengerRequestFloor = action.data;
      yield call(handleCallRequest, passengerRequestFloor);
      return;
    }
    default:
      return;
  }
}

function* buttonPress() {
  yield takeEvery(liftActions.BUTTON_PRESS, handleButtonPress);
}

function* watchLiftMove() {
  yield takeEvery(liftActions.MOVE_UP, handleMove);
  yield takeEvery(liftActions.MOVE_DOWN, handleMove);
}

export default function* liftSaga() {
  yield all([buttonPress(), watchLiftMove()]);
}
