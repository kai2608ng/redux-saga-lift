import * as liftActions from "../actions/liftActions";
import * as reducerActions from "../actions/reducerActions";
import doorStateEnum from "../enums/doorStateEnum";
import sensorStateEnum from "../enums/sensorStateEnum";
import movingDirectionEnum from "../enums/movingDirectionEnum";
import * as utils from "../utils";

const defaultState = Object.freeze({
  currentFloor: 0,
  maximumFloor: 10,
  passengersCount: 0,
  doorState: doorStateEnum.CLOSED,
  sensorState: sensorStateEnum.OFF,
  liftOngoingFloor: [],
  liftPendingFloor: [],
  movingDirection: movingDirectionEnum.NOT_MOVING,
  lock: false,
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
    case liftActions.CALL_LIFT: {
      const callFloor = action.callFloor;
      const { liftOngoingFloor, liftPendingFloor } = utils.sortOngoing(
        state,
        callFloor
      );
      return Object.freeze({
        ...state,
        liftOngoingFloor,
        liftPendingFloor,
      });
    }
    case liftActions.PENDING_LIFT: {
      const pendingFloor = action.pendingFloor;
      return Object.freeze({
        ...state,
        liftPendingFloor: utils.sortPending(state, pendingFloor),
      });
    }
    case liftActions.PENDING_TO_ONGOING: {
      return Object.freeze({
        ...state,
        liftOngoingFloor: [...state.liftPendingFloor],
        liftPendingFloor: [],
      });
    }
    case liftActions.REMOVE_CALL: {
      return Object.freeze({
        ...state,
        liftOngoingFloor: utils.removeReachedCall(state),
      });
    }
    case liftActions.SET_DIRECTION: {
      return Object.freeze({
        ...state,
        movingDirection: action.direction,
      });
    }
    case liftActions.SET_LOCK: {
      return Object.freeze({
        ...state,
        lock: true,
      });
    }
    case liftActions.SET_UNLOCK: {
      return Object.freeze({
        ...state,
        lock: false,
      });
    }
    case reducerActions.RESET: {
      return defaultState;
    }
    default:
      return state;
  }
}
