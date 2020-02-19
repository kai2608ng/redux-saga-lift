import { delay, fork, put, select, take } from 'redux-saga/effects';

import * as errorActions from '../actions/errorActions';
import * as liftActions from '../actions/liftActions';
import insideButtonsEnum from '../enums/insideButtonsEnum';
import outsideButtonsEnum from '../enums/outsideButtonsEnum';

function* getStartingFloor() {
  const maximumFloor = yield select(state => state.lift.maximumFloor);
  /* There is 50 percent chance passenger will be coming from the ground floor. */
  if (Math.random() > 0.5) {
    return 0;
  }

  /* Or in equal chance from any other floor. */
  return Math.round(Math.random() * (maximumFloor - 1)) + 1;
}

function* getDestinationFloor({ startingFloor }) {
  const maximumFloor = yield select(state => state.lift.maximumFloor);
  /* Passengers from higher floors are always going to the ground floor. */
  if (startingFloor > 0) {
    return 0;
  }

  /* Passengers from the ground floor are always going to any other floor. */
  return Math.round(Math.random() * (maximumFloor - 1)) + 1;
}

function* pressUpDownButton({ startingFloor }) {
  /* Passengers from the fround floor move up, passengers from other floors move down. */
  if (startingFloor === 0) {
    yield put(liftActions.buttonPress({
      button: outsideButtonsEnum.UP,
      data: startingFloor,
    }));
  } else {
    yield put(liftActions.buttonPress({
      button: outsideButtonsEnum.DOWN,
      data: startingFloor,
    }));
  }
}

function* awaitLift({ startingFloor }) {
  yield take(liftActions.OPEN_DOOR);
  const currentFloor = yield select(state => state.lift.currentFloor);
  if (currentFloor !== startingFloor) {
    yield awaitLift({ startingFloor });
  }
}

function* enterLift() {
  /* Take between 0 and 5 seconds to start entering. */
  yield delay(Math.round(Math.random() * 5 * 1000));
  /* Block sensor. */
  yield put(liftActions.doorSensorOn());
  /* Take between 0 and 2 seconds to finish entering. */
  yield delay(Math.round(Math.random() * 2 * 1000));
  /* Unblock sensor. */
  yield put(liftActions.doorSensorOff());
}

function* pressFloorButton({ destinationFloor }) {
  /* Take between 0 and 1 seconds to press the button. */
  yield delay(Math.round(Math.random() * 1 * 1000));
  /* Press the button. */
  yield put(liftActions.buttonPress({
    button: insideButtonsEnum.FLOOR_BUTTON,
    data: destinationFloor,
  }));
}

function* processPassenger() {
  /* Assign floor to a passenger. */
  const startingFloor = yield getStartingFloor();
  const destinationFloor = yield getDestinationFloor({ startingFloor });
  /* Passenger presses button. */
  yield pressUpDownButton({ startingFloor });
  /* Passenger awaits a lift. */
  yield awaitLift({ startingFloor });
  /* Passenger enters lift. */
  yield enterLift();
  /* Passenger presses floor button. */
  yield pressFloorButton({ destinationFloor });
}

function* pollPassengers() {
  console.log('Polling passengers');
  yield fork(function* () {
    while (true) {
      /* A passenger will request a lift every 0 to 30 seconds. */
      yield delay(Math.round(Math.random() * 30 * 1000));
      yield fork(processPassenger);
    }
  });
}

export default function* simulatorSaga() {
  /* This saga checks for any issues with the lift. */
  yield pollPassengers();
}
