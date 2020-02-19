import {
  delay,
  fork,
  put,
  race,
  select,
  take,
} from 'redux-saga/effects';

import * as liftActions from '../actions/liftActions';
import buttonsEnum from '../enums/buttonsEnum';

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
      button: buttonsEnum.CALL_UP,
      data: startingFloor,
    }));
  } else {
    yield put(liftActions.buttonPress({
      button: buttonsEnum.CALL_DOWN,
      data: startingFloor,
    }));
  }
}

function* pressFloorButton({ destinationFloor }) {
  /* Take between 0 and 1 seconds to press the button. */
  yield delay(Math.round(Math.random() * 1 * 1000));
  /* Press the button. */
  yield put(liftActions.buttonPress({
    button: buttonsEnum.REQUEST_FLOOR,
    data: destinationFloor,
  }));
}

function* awaitLift({ floor }) {
  yield take(liftActions.OPEN_DOOR);
  const currentFloor = yield select(state => state.lift.currentFloor);
  if (currentFloor !== floor) {
    yield awaitLift({ floor });
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

  return true;
}

function* exitLift() {
  /* Take between 0 and 3 seconds to start exiting. */
  yield delay(Math.round(Math.random() * 5 * 1000));
  /* Block sensor. */
  yield put(liftActions.doorSensorOn());
  /* Take between 0 and 2 seconds to finish exiting. */
  yield delay(Math.round(Math.random() * 2 * 1000));
  /* Unblock sensor. */
  yield put(liftActions.doorSensorOff());

  return true;
}

function* processPassengerOutside({ startingFloor }) {
  /* Passenger awaits a lift on their starting floors. */
  yield awaitLift({ floor: startingFloor });

  /* Passenger enters lift if the door stays open long enough. */
  const enterLiftResult = yield race({
    success: enterLift,
    failure: take(liftActions.CLOSE_DOOR),
  });

  if (enterLiftResult.failure) {
    yield processPassengerOutside({ startingFloor });
  }
}

function* processPassengerInside({ destinationFloor }) {
  /* Passenger awaits lift reaching their destination floors. */
  yield awaitLift({ floor: destinationFloor });

  /* Passenger exits lift if the door stays open long enough. */
  const exitLiftResult = yield race({
    success: exitLift,
    failure: take(liftActions.CLOSE_DOOR),
  });

  if (exitLiftResult.failure) {
    yield processPassengerOutside({ destinationFloor });
  }
}

function* addPassenger() {
  /* Assign floor to a passenger. */
  const startingFloor = yield getStartingFloor();
  const destinationFloor = yield getDestinationFloor({ startingFloor });
  /* Increment passenger count. */
  yield put(liftActions.incrementPassengers());
  /* Passenger presses button. */
  yield pressUpDownButton({ startingFloor });
  /* Passengers waits and enters the lift. */
  yield processPassengerOutside({ startingFloor });
  /* Passenger presses floor button. */
  yield pressFloorButton({ destinationFloor });
  /* Passenger waits and leaves the lift. */
  yield processPassengerInside({ destinationFloor });
  /* Decrement passenger count. */
  yield put(liftActions.incrementPassengers());
}

function* pollPassengers() {
  console.log('Polling passengers');
  yield fork(function* () {
    while (true) {
      /* A passenger will request a lift every 0 to 30 seconds. */
      yield delay(Math.round(Math.random() * 30 * 1000));
      yield fork(addPassenger);
    }
  });
}

export default function* simulatorSaga() {
  console.log('Simulator saga');
  /* This saga checks for any issues with the lift. */
  yield pollPassengers();
}
