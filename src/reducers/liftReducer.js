import * as liftActions from '../actions/liftActions';
import * as reducerActions from '../actions/reducerActions';
import doorStateEnum from '../enums/doorStateEnum';
import sensorStateEnum from '../enums/sensorStateEnum';

const defaultState = Object.freeze({
  currentFloor: 0,
  maximumFloor: 10,
  passengersCount: 0,
  doorState: doorStateEnum.CLOSED,
  sensorState: sensorStateEnum.OFF,
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
    case reducerActions.RESET: {
      return defaultState;
    }
    default:
      return state;
  }
}
