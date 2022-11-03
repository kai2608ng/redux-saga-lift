import * as liftActions from "../actions/liftActions";
import * as reducerActions from "../actions/reducerActions";
import doorStateEnum from "../enums/doorStateEnum";
import sensorStateEnum from "../enums/sensorStateEnum";
import movingDirectionEnum from "../enums/movingDirectionEnum";
import * as utils from "../utils";

let floorPressed = [];

for (let i = 0; i <= 10; i++) floorPressed.push(null);

const defaultState = Object.freeze({
  currentFloor: 0,
  maximumFloor: 10,
  passengersCount: 0,
  doorState: doorStateEnum.CLOSED,
  sensorState: sensorStateEnum.OFF,
  movingDirection: movingDirectionEnum.NOT_MOVING,
  onGoingQueue: [],
  pendingQueue: [],
  floorPressed,
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
    case liftActions.SET_LIFT: {
      const { button, data } = action;
      const { movingDirection, floorPressed, onGoingQueue, pendingQueue } = utils.setLift(state, button, data);
      return Object.freeze({
        ...state,
        movingDirection,
        floorPressed,
        onGoingQueue,
        pendingQueue,
      });
    }
    case liftActions.DEL_LIFT: {
      const {floorPressed, onGoingQueue} = utils.deleteLift(state)
      return Object.freeze({
        ...state,
        floorPressed,
        onGoingQueue,
      })
    }
    case liftActions.SET_DIRECTION: {
      const {movingDirection} = action
      return Object.freeze({
        ...state,
        movingDirection
      })
    }
    case liftActions.PENDING_TO_ONGOING: {
      const {movingDirection, onGoingQueue, pendingQueue} = utils.pendingToOngoing(state)
      return Object.freeze({
        ...state,
        movingDirection,
        onGoingQueue,
        pendingQueue
      })
    }
    case reducerActions.RESET: {
      return defaultState;
    }
    default:
      return state;
  }
}
