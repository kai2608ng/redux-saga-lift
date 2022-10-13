import {
	all,
	call,
	delay,
	put,
	select,
	take,
	takeEvery,
	takeLatest,
} from 'redux-saga/effects';
import buttonsEnum from '../enums/buttonsEnum';
import * as liftActions from '../actions/liftActions';
import doorStateEnum from '../enums/doorStateEnum';
import movingDirectionEnum from '../enums/movingDirectionEnum';

function* liftMoveUp() {
	yield take(liftActions.CLOSE_DOOR);
	yield delay(500);
	yield put(liftActions.moveUp());
}

function* liftMoveDown() {
	yield take(liftActions.CLOSE_DOOR);
	yield delay(500);
	yield put(liftActions.moveDown());
}

function* liftReached() {
	// Remove the floor that calls the lift
	yield put(liftActions.removeCall());

	const doorState = yield select((state) => state.lift.doorState);

	if (doorState !== doorStateEnum.OPEN) {
		yield put(liftActions.openDoor());
		yield take(liftActions.DOOR_SENSOR_ON);
		yield take(liftActions.DOOR_SENSOR_OFF);
		yield put(liftActions.closeDoor());
	}
}

function* handleCallDown(passengerFloor) {
	// Assign the current floor of the passenger to the lift
	yield put(liftActions.passengerCallLift({ passengerFloor }));
	// Move the lift to any floor other than ground floor
	yield call(handleMoveUp);
}

function* handleCallUp(passengerFloor) {
	// Assign the current floor of the passenger to the lift
	yield put(liftActions.passengerCallLift({ passengerFloor }));
	// Move the lift to the ground floor
	yield call(handleMoveDown);
}

function* handleCallRequest(passengerRequestFloor) {
	// Assign the requested floor to the lift
	yield put(
		liftActions.requestCallLift({ requestFloor: passengerRequestFloor })
	);

	// Move the lift to the requested floor
	yield call(handleRequestFloor);
}

function* handleMoveUp() {
	// Get the current floor of the lift
	const liftCurrentFloor = yield select((state) => state.lift.currentFloor);
	// Get the floor that is closest to the lift
	const passengerFloor = yield select((state) => state.lift.passengersFloor[0]);

	if (liftCurrentFloor > passengerFloor) {
		yield put(
			liftActions.setDirection({ direction: movingDirectionEnum.DOWN })
		);
		yield call(liftMoveDown);
	}

	if (liftCurrentFloor < passengerFloor) {
		yield put(liftActions.setDirection({ direction: movingDirectionEnum.UP }));
		yield call(liftMoveUp);
	}

	if (liftCurrentFloor === passengerFloor) yield call(liftReached);
}

function* handleMoveDown() {
	// Get the current floor of the lift
	const liftCurrentFloor = yield select((state) => state.lift.currentFloor);
	// Get the floor that is closest to the lift
	const passengerFloor = yield select((state) => state.lift.passengersFloor[0]);

	if (liftCurrentFloor > passengerFloor) {
		yield put(
			liftActions.setDirection({ direction: movingDirectionEnum.DOWN })
		);
		yield call(liftMoveDown);
	}

	if (liftCurrentFloor === passengerFloor) yield call(liftReached);
}

function* handleRequestFloor() {
	// Get the current floor of the lift
	const liftCurrentFloor = yield select((state) => state.lift.currentFloor);
	// Get the requested floor that is closest to the lift
	const requestFloor = yield select(
		(state) => state.lift.passengersRequestFloor[0]
	);

	if (liftCurrentFloor < requestFloor) yield call(liftMoveUp);

	if (liftCurrentFloor > requestFloor) yield call(liftMoveDown);

	if (liftCurrentFloor === requestFloor) yield call(liftReached);
}

function* handleButtonPress(action) {
	switch (action.button) {
		// passenger press button on any floor other than ground floor
		case buttonsEnum.CALL_DOWN: {
			yield call(handleCallDown, action.data);
			break;
		}
		// passenger press button on ground floor
		case buttonsEnum.CALL_UP: {
			yield call(handleCallUp, action.data);
			break;
		}
		// passenger press button within the lift
		case buttonsEnum.REQUEST_FLOOR: {
			yield call(handleCallRequest, action.data);
			break;
		}
	}
}

function* buttonPress() {
	yield takeEvery(liftActions.BUTTON_PRESS, handleButtonPress);
}

function* watchLiftMoveUp() {
	yield takeEvery(liftActions.MOVE_UP, handleMoveUp);
}

function* watchLiftMoveDown() {
	yield takeEvery(liftActions.MOVE_DOWN, handleMoveDown);
}

export default function* liftSaga() {
	yield all([buttonPress(), watchLiftMoveUp(), watchLiftMoveDown()]);
}
