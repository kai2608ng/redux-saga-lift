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
import sensorStateEnum from "../enums/sensorStateEnum";
import movingDirectionEnum from "../enums/movingDirectionEnum";

function* setLock() {
  const lock = yield select((state) => state.lift.lock);

  if (!lock) {
    yield put(liftActions.setLock());
    yield call(handleMove);
  }
}

function* setUnlock() {
  const lock = yield select((state) => state.lift.lock);

  if (lock) {
    yield put(liftActions.setUnlock());
    yield put(liftActions.setButtonPress({ buttonPress: "" }));
    yield put(
      liftActions.moveStop({
        movingDirection: movingDirectionEnum.NOT_MOVING,
      })
    );
  }
}

function* liftMoveUp() {
  const doorState = yield select((state) => state.lift.doorState);
  const movingDirection = yield select((state) => state.lift.movingDirection);

  if (doorState === doorStateEnum.CLOSED) {
    yield delay(500);
    yield put(liftActions.moveUp({ movingDirection: movingDirectionEnum.UP }));
    return;
  }

  if (
    movingDirection === movingDirectionEnum.PENDING_MOVING_UP ||
    movingDirection === movingDirectionEnum.PENDING_MOVING_DOWN
  )
    return;

  yield put(
    liftActions.movePending({
      movingDirection: movingDirectionEnum.PENDING_MOVING_UP,
    })
  );
  yield take(liftActions.CLOSE_DOOR);
  yield call(liftMoveUp);
}

function* liftMoveDown() {
  const doorState = yield select((state) => state.lift.doorState);
  const movingDirection = yield select((state) => state.lift.movingDirection);

  if (doorState === doorStateEnum.CLOSED) {
    yield delay(500);
    yield put(
      liftActions.moveDown({ movingDirection: movingDirectionEnum.DOWN })
    );
    return;
  }

  if (
    movingDirection === movingDirectionEnum.PENDING_MOVING_DOWN ||
    movingDirection === movingDirectionEnum.PENDING_MOVING_UP
  )
    return;

  yield put(
    liftActions.movePending({
      movingDirection: movingDirectionEnum.PENDING_MOVING_DOWN,
    })
  );
  yield take(liftActions.CLOSE_DOOR);
  yield call(liftMoveDown);
}

function* trackSensorStateOff(delayTime) {
  // delay for opening the door
  yield delay(delayTime);

  const sensorState = yield select((state) => state.lift.sensorState);

  if (sensorState !== sensorStateEnum.OFF) {
    yield call(trackSensorStateOff, 1500);
  }
}

function* handleDoor() {
  let liftOngoingFloor = yield select((state) => state.lift.liftOngoingFloor);
  let moveDisabled = false;
  const liftPendingFloor = yield select((state) => state.lift.liftPendingFloor);
  const doorState = yield select((state) => state.lift.doorState);

  if (doorState !== doorStateEnum.OPEN) yield put(liftActions.openDoor());

  // Check is the pending queue has item
  if (!liftOngoingFloor.length) {
    if (!liftPendingFloor.length) {
      yield call(setUnlock);
      moveDisabled = true;
    }
    // Set the pending queue to ongoing queue
    else yield put(liftActions.pendingToOngoing());
  }

  yield take(liftActions.DOOR_SENSOR_ON);
  // Block to track sensor off
  yield call(trackSensorStateOff, 2000);

  yield put(liftActions.closeDoor());

  // Updated from pending to ongoing
  liftOngoingFloor = yield select((state) => state.lift.liftOngoingFloor);
  if (liftOngoingFloor.length && !moveDisabled)
    // Move the lift
    yield call(handleMove);
}

function* liftReached() {
  // Remove the floor that calls the lift
  yield put(liftActions.removeCall());

  // Open close the door
  // Search the next floor to go
  yield call(handleDoor);
}

function* handleMove() {
  // Get the current floor of the lift
  const liftCurrentFloor = yield select((state) => state.lift.currentFloor);
  // Get the floor that is closest to the lift
  const liftOngoingFloor = yield select((state) => state.lift.liftOngoingFloor);
  console.log("liftOngoingFloor.length: ", liftOngoingFloor.length);
  const { callFloor } = liftOngoingFloor[0];
  // Move down if current floor higher than ongoing floor
  if (liftCurrentFloor > callFloor) {
    yield call(liftMoveDown);
  }
  // Move up if current floor lower than ongoing floor
  if (liftCurrentFloor < callFloor) {
    yield call(liftMoveUp);
  }
  // Reached the ongoing floor
  if (liftCurrentFloor === callFloor) {
    yield call(liftReached);
  }
}

// Press Up button at Ground Floor
function* handleCallUp({ passengerFloor, buttonPress }) {
  const currentMovingDirection = yield select(
    (state) => state.lift.movingDirection
  );
  const doorState = yield select((state) => state.lift.doorState);
  const currentFloor = yield select((state) => state.lift.currentFloor);
  const currentButtonPress = yield select((state) => state.lift.buttonPress);

  // Do not assign if lift reached to the passenger and the door is opened
  if (doorState === doorStateEnum.OPEN && passengerFloor === currentFloor)
    return;

  if (
    currentMovingDirection === movingDirectionEnum.NOT_MOVING &&
    currentButtonPress !== buttonsEnum.REQUEST_FLOOR
  ) {
    yield put(liftActions.setButtonPress({ buttonPress }));
    yield put(liftActions.callLift({ callFloor: passengerFloor, buttonPress }));
    // To enable only a single lift movement
    yield call(setLock);
    return;
  }

  yield put(
    liftActions.pendingLift({ pendingFloor: passengerFloor, buttonPress })
  );

  // Since passenger will wait for the lift reach to them
  // If they failed to enter
  // They will press the button again
}

// Press Down button at any floor other than ground floor
function* handleCallDown({ passengerFloor, buttonPress }) {
  const currentMovingDirection = yield select(
    (state) => state.lift.movingDirection
  );
  const doorState = yield select((state) => state.lift.doorState);
  const currentFloor = yield select((state) => state.lift.currentFloor);

  // Do not assign if lift reached to the passenger and the door is opened
  if (currentFloor === passengerFloor && doorState === doorStateEnum.OPEN)
    return;

  if (currentMovingDirection === movingDirectionEnum.NOT_MOVING) {
    yield put(liftActions.setButtonPress({ buttonPress }));
    yield put(liftActions.callLift({ callFloor: passengerFloor, buttonPress }));
    // To enable only a single lift movement
    yield call(setLock);
    return;
  }

  if (
    currentMovingDirection === movingDirectionEnum.UP ||
    currentMovingDirection === movingDirectionEnum.PENDING_MOVING_UP
  ) {
    // Assign those floor that are higher than the current floor of the lift
    if (currentFloor < passengerFloor) {
      yield put(
        liftActions.callLift({ callFloor: passengerFloor, buttonPress })
      );
      return;
    }
  }

  if (
    currentMovingDirection === movingDirectionEnum.DOWN ||
    currentMovingDirection === movingDirectionEnum.PENDING_MOVING_DOWN
  ) {
    // Assign those floor that are lower than the current floor of the lift
    if (currentFloor > passengerFloor) {
      // call down has higher priority when moving down
      yield put(liftActions.setButtonPress({ buttonPress }));
      yield put(
        liftActions.callLift({ callFloor: passengerFloor, buttonPress })
      );
      return;
    }
  }

  yield put(
    liftActions.pendingLift({ pendingFloor: passengerFloor, buttonPress })
  );

  // Since passenger will wait for the lift reach to them
  // If they failed to enter
  // They will press the button again
}

// Within the lift
function* handleCallRequest({ passengerRequestFloor, buttonPress }) {
  const currentButtonPress = yield select((state) => state.lift.buttonPress);
  const currentMovingDirection = yield select(
    (state) => state.lift.movingDirection
  );
  const currentFloor = yield select((state) => state.lift.currentFloor);
  const doorState = yield select((state) => state.lift.doorState);

  // Do not assign if lift reached to the passenger and the door is opened
  if (
    currentFloor === passengerRequestFloor &&
    doorState === doorStateEnum.OPEN
  )
    return;

  if (currentMovingDirection === movingDirectionEnum.NOT_MOVING) {
    yield put(liftActions.setButtonPress({ buttonPress }));
    yield put(
      liftActions.callLift({ callFloor: passengerRequestFloor, buttonPress })
    );
    // To enable only a single lift movement
    yield call(setLock);
    return;
  }

  if (currentMovingDirection === movingDirectionEnum.UP) {
    if (currentButtonPress === buttonsEnum.REQUEST_FLOOR) {
      // Assign higher floor to lift when moving upwards
      if (passengerRequestFloor > currentFloor) {
        yield put(
          liftActions.callLift({
            callFloor: passengerRequestFloor,
            buttonPress,
          })
        );
        return;
      }
    }

    if (currentButtonPress === buttonsEnum.CALL_DOWN) {
      // request has higher priority than call down
      yield put(liftActions.setButtonPress({ buttonPress }));
      yield put(
        liftActions.callLift({ callFloor: passengerRequestFloor, buttonPress })
      );
      return;
    }
  }

  if (currentMovingDirection === movingDirectionEnum.DOWN) {
    // Assign lower floor to lift when moving downwards
    if (currentFloor > passengerRequestFloor) {
      yield put(
        liftActions.callLift({ callFloor: passengerRequestFloor, buttonPress })
      );
      return;
    }
  }

  if (currentMovingDirection === movingDirectionEnum.PENDING_MOVING_UP) {
    yield put(liftActions.setButtonPress({ buttonPress }));
    yield put(
      liftActions.callLift({ callFloor: passengerRequestFloor, buttonPress })
    );
    return;
  }

  if (currentMovingDirection === movingDirectionEnum.PENDING_MOVING_DOWN) {
    if (currentFloor > passengerRequestFloor) {
      yield put(
        liftActions.callLift({ callFloor: passengerRequestFloor, buttonPress })
      );
      return;
    }
  }

  yield put(
    liftActions.pendingLift({
      pendingFloor: passengerRequestFloor,
      buttonPress,
    })
  );
  // Since passenger will wait for the lift to reach the floor they requested
  // If they failed to exit
  // They will press the button again
}

function* handleButtonPress(action) {
  const buttonPress = action.button;
  switch (buttonPress) {
    // passenger press button on any floor other than ground floor
    case buttonsEnum.CALL_DOWN: {
      const passengerFloor = action.data;
      yield call(handleCallDown, { passengerFloor, buttonPress });
      return;
    }
    // passenger press button on ground floor
    case buttonsEnum.CALL_UP: {
      const passengerFloor = action.data;
      yield call(handleCallUp, { passengerFloor, buttonPress });
      return;
    }
    // passenger press button within the lift
    case buttonsEnum.REQUEST_FLOOR: {
      const passengerRequestFloor = action.data;
      yield call(handleCallRequest, { passengerRequestFloor, buttonPress });
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
