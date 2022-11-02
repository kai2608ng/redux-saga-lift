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
import movingDirectionEnum from "../enums/movingDirectionEnum";
import sensorStateEnum from "../enums/sensorStateEnum";
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

function* liftNext() {
  let onGoingQueue = yield select(selectors.getOngoingQueue)
  let pendingQueue = yield select(selectors.getPendingQueue)
  const movingDirection = yield select(selectors.getMovingDirection)

  // There's nothing left
  if(!onGoingQueue.length && !pendingQueue.length){
    yield put(liftActions.setDirection(movingDirectionEnum.NOT_MOVING))
    return
  }
    
  if(!onGoingQueue.length){
    // Set the pending queue to ongoing queue
    yield put(liftActions.pendingToOngoing())
    // Switch to moving downwards
    if(movingDirection === movingDirectionEnum.UP)
      yield put(liftActions.setDirection(movingDirectionEnum.DOWN))
    // Switch to moving upwards
    if(movingDirection === movingDirectionEnum.DOWN)
      yield put(liftActions.setDirection(movingDirectionEnum.UP))
  }
}

function* detectPassenger(){
  const sensorState = yield select(selectors.getSensorState)
  // Wait for the passenger to enter if he/she tries to enter or exit
  if(sensorState === sensorStateEnum.ON){
    yield take(liftActions.DOOR_SENSOR_OFF)
  }
}

function* liftReached() {
  // Remove the reached floor
  yield put(liftActions.delLift())
  // Open the door
  yield put(liftActions.openDoor());
  // Open the door for 5 seconds
  yield delay(5000)
  // Detect is there any passenger tries to enter or exit
  yield call(detectPassenger)
  // Close the door
  yield put(liftActions.closeDoor());
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

function* handleMove() {
  let currentFloor, targetFloor, movingDirection
  let isOnGoing = yield select(selectors.getIsOngoing)
  
  while(isOnGoing){
    currentFloor = yield select(selectors.getCurrentFloor);
    targetFloor = yield select(selectors.getTargetFloor);
    movingDirection = yield select(selectors.getMovingDirection)
    // MOVING UP
    if (currentFloor < targetFloor) {
      if(movingDirection === movingDirectionEnum.NOT_MOVING)
        yield put(liftActions.setDirection(movingDirectionEnum.UP))
      yield call(liftMoveUp);
      continue
    }
    // MOVING DOWN
    if (currentFloor > targetFloor) {
      if(movingDirection === movingDirectionEnum.NOT_MOVING)
        yield put(liftActions.setDirection(movingDirectionEnum.DOWN))
      yield call(liftMoveDown);
      continue
    }
    // REACHED DESTINATION
    if (currentFloor === targetFloor) {
      // Open and close the door
      yield call(liftReached);
      // Find the next action to do 
      yield call(liftNext);
    }
    // Track is it able to keep moving the lift
    isOnGoing = yield select(selectors.getIsOngoing)
  }
}

function* watchLiftMove() {
  // Handle the first request that wants to move the lift
  yield takeLeading(liftActions.GET_LIFT, handleMove);
}

export default function* liftSaga() {
  /* TODO: Program your saga for lift control here. 🙂 */
  yield all([watchButtonPress(), watchLiftMove()]);
}
