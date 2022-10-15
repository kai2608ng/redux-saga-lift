import {
	all,
	call,
	delay,
	put,
	select,
	take,
	takeEvery,
	takeLeading,
} from 'redux-saga/effects';
import buttonsEnum from '../enums/buttonsEnum';
import * as liftActions from '../actions/liftActions';
import doorStateEnum from '../enums/doorStateEnum';
import movingDirectionEnum from '../enums/movingDirectionEnum';

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

	// Search the next floor to go
	yield call(handleNextFloor);
}

function* handleNextFloor() {
	const liftOngoingFloor = yield select((state) => state.lift.liftOngoingFloor);
	const liftPendingFloor = yield select((state) => state.lift.liftPendingFloor);
	const movingDirection = yield select((state) => state.lift.movingDirection);

	if (!liftOngoingFloor.length) {
		if (!liftPendingFloor.length) {
			yield put(
				liftActions.setDirection({ direction: movingDirectionEnum.NOT_MOVING })
			);
			return;
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

// Check the call floor should be in the pending queue or ongoing queue
function* checkCallFloor({ callFloor }) {
	const currentFloor = yield select((state) => state.lift.currentFloor);
	const movingDirection = yield select((state) => state.lift.movingDirection);

	switch (movingDirection) {
		case movingDirectionEnum.UP: {
			// Only assign those floor that are higher than current floor
			if (currentFloor < callFloor)
				yield put(liftActions.callLift({ callFloor }));
			else if (currentFloor > callFloor)
				yield put(liftActions.pendingLift({ pendingFloor: callFloor }));

			break;
		}
		case movingDirectionEnum.DOWN: {
			// Only assign those floor that are lower than current floor
			if (currentFloor > callFloor) {
				yield put(liftActions.callLift({ callFloor }));
			} else if (currentFloor < callFloor)
				yield put(liftActions.pendingLift({ pendingFloor: callFloor }));

			break;
		}
		case movingDirectionEnum.NOT_MOVING:
			{
				if (currentFloor < callFloor)
					yield put(
						liftActions.setDirection({ direction: movingDirectionEnum.UP })
					);
				else if (currentFloor > callFloor)
					yield put(
						liftActions.setDirection({ direction: movingDirectionEnum.DOWN })
					);
				yield put(liftActions.callLift({ callFloor }));
				yield call(handleMove);
				break;
			}

			return;
	}
}

function* handleCall(passengerFloor) {
	// Assign the current floor of the passenger to the lift
	yield call(checkCallFloor, { callFloor: passengerFloor });
}

function* handleCallRequest(passengerRequestFloor) {
	// Assign the requested floor to the lift
	yield call(checkCallFloor, { callFloor: passengerRequestFloor });
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

function* handleButtonPress(action) {
	switch (action.button) {
		// passenger press button on any floor other than ground floor
		case buttonsEnum.CALL_DOWN: {
			yield call(handleCall, action.data);
			break;
		}
		// passenger press button on ground floor
		case buttonsEnum.CALL_UP: {
			yield call(handleCall, action.data);
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

function* watchLiftMove() {
	yield takeEvery(liftActions.MOVE_UP, handleMove);
	yield takeEvery(liftActions.MOVE_DOWN, handleMove);
}

export default function* liftSaga() {
	yield all([buttonPress(), watchLiftMove()]);
}
