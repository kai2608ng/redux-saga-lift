export const BUTTON_PRESS = "@lift/BUTTON_PRESS";

export const MOVE_UP = "@lift/MOVE_UP";
export const MOVE_DOWN = "@lift/MOVE_DOWN";

export const CLOSE_DOOR = "@lift/CLOSE_DOOR";
export const OPEN_DOOR = "@lift/OPEN_DOOR";

export const DOOR_SENSOR_OFF = "@lift/DOOR_SENSOR_OFF";
export const DOOR_SENSOR_ON = "@lift/DOOR_SENSOR_ON";

export const INCREMENT_PASSENGERS = "@lift/INCREMENT_PASSENGERS";
export const DECREMENT_PASSENGERS = "@lift/DECREMENT_PASSENGERS";

export const SET_LIFT = "@lift/SET_LIFT";
export const GET_LIFT = "@lift/GET_LIFT";
export const DEL_LIFT = "@lift/DEL_LIFT"

export const SET_DIRECTION = "@lift/SET_DIRECTION"

export const PENDING_TO_ONGOING = "@lift/PENDING_TO_ONGOING"

export const setLift = (button, data) => ({
  type: SET_LIFT,
  button,
  data,
});

export const getLift = () => ({
  type: GET_LIFT,
});

export const delLift = () => ({
  type: DEL_LIFT
})

export const setDirection = (movingDirection) => ({
  type: SET_DIRECTION,
  movingDirection
})

export const pendingToOngoing = () => ({
  type: PENDING_TO_ONGOING
})

export const buttonPress = ({ button, data }) => ({
  type: BUTTON_PRESS,
  button,
  data,
});

export const moveUp = () => ({
  type: MOVE_UP,
});

export const moveDown = () => ({
  type: MOVE_DOWN,
});

export const doorSensorOff = () => ({
  type: DOOR_SENSOR_OFF,
});

export const doorSensorOn = () => ({
  type: DOOR_SENSOR_ON,
});

export const closeDoor = () => ({
  type: CLOSE_DOOR,
});

export const openDoor = () => ({
  type: OPEN_DOOR,
});

export const incrementPassengers = () => ({
  type: INCREMENT_PASSENGERS,
});

export const decrementPassengers = () => ({
  type: DECREMENT_PASSENGERS,
});
