import * as liftActions from '../actions/liftActions';
import * as reducerActions from '../actions/reducerActions';
import doorStateEnum from '../enums/doorStateEnum';
import sensorStateEnum from '../enums/sensorStateEnum';
import * as utils from '../utils';

const defaultState = Object.freeze({
	currentFloor: 0,
	maximumFloor: 10,
	passengersCount: 0,
	doorState: doorStateEnum.CLOSED,
	sensorState: sensorStateEnum.OFF,
	passengersRequestFloor: [],
	passengersFloor: [],
	movingDirection: '',
});

export default function liftReducer(state = defaultState, action) {
	switch (action.type) {
		case liftActions.MOVE_UP: {
			return Object.freeze({
				...state,
				currentFloor: state.currentFloor + 1,
			});
		}
		case liftActions.MOVE_DOWN: {
			return Object.freeze({
				...state,
				currentFloor: state.currentFloor - 1,
			});
		}
		case liftActions.CLOSE_DOOR: {
			return Object.freeze({
				...state,
				doorState: doorStateEnum.CLOSED,
			});
		}
		case liftActions.OPEN_DOOR: {
			return Object.freeze({
				...state,
				doorState: doorStateEnum.OPEN,
			});
		}
		case liftActions.DOOR_SENSOR_OFF: {
			return Object.freeze({
				...state,
				sensorState: sensorStateEnum.OFF,
			});
		}
		case liftActions.DOOR_SENSOR_ON: {
			return Object.freeze({
				...state,
				sensorState: sensorStateEnum.ON,
			});
		}
		case liftActions.INCREMENT_PASSENGERS: {
			return Object.freeze({
				...state,
				passengersCount: state.passengersCount + 1,
			});
		}
		case liftActions.DECREMENT_PASSENGERS: {
			return Object.freeze({
				...state,
				passengersCount: state.passengersCount - 1,
			});
		}
		case liftActions.PASSENGER_CALL_LIFT: {
			const passengerFloor = action.passengerFloor;
			return Object.freeze({
				...state,
				passengersFloor: utils.sortClosestPassenger(state, passengerFloor),
			});
		}
		case liftActions.REQUEST_CALL_LIFT: {
			const requestFloor = action.requestFloor;
			return Object.freeze({
				...state,
				passengersRequestFloor: utils.sortClosestRequestFloor(
					state,
					requestFloor
				),
			});
		}
		case liftActions.REMOVE_CALL: {
			return Object.freeze({
				...state,
				passengersFloor: utils.removeReachedCall(state),
			});
		}
		case liftActions.SET_DIRECTION: {
			return Object.freeze({
				...state,
				movingDirection: action.direction,
			});
		}
		case reducerActions.RESET: {
			return defaultState;
		}
		default:
			return state;
	}
}
