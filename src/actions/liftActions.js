export const BUTTON_PRESS = "@lift/BUTTON_PRESS";

export const MOVE_UP = "@lift/MOVE_UP";
export const MOVE_DOWN = "@lift/MOVE_DOWN";
export const MOVE_STOP = "@lift/MOVE_STOP";
export const MOVE_PENDING = "@lift/MOVE_PENDING";

export const CLOSE_DOOR = "@lift/CLOSE_DOOR";
export const OPEN_DOOR = "@lift/OPEN_DOOR";

export const DOOR_SENSOR_OFF = "@lift/DOOR_SENSOR_OFF";
export const DOOR_SENSOR_ON = "@lift/DOOR_SENSOR_ON";

export const INCREMENT_PASSENGERS = "@lift/INCREMENT_PASSENGERS";
export const DECREMENT_PASSENGERS = "@lift/DECREMENT_PASSENGERS";

export const CALL_LIFT = "@lift/CALL_LIFT";
export const PENDING_LIFT = "@lift/PENDING_LIFT";
export const PENDING_TO_ONGOING = "@lift/PENDING_TO_ONGOING";
export const SET_BUTTON_PRESS = "@lift/SET_BUTTON_PRESS";

export const REMOVE_CALL = "@lift/REMOVE_CALL";

export const SET_LOCK = "@lift/SET_LOCK";
export const SET_UNLOCK = "@lift/SET_UNLOCK";

export const setUnlock = () => ({
  type: SET_UNLOCK,
});

export const setLock = () => ({
  type: SET_LOCK,
});

export const removeCall = () => ({
  type: REMOVE_CALL,
});

export const callLift = ({ callFloor, buttonPress }) => ({
  type: CALL_LIFT,
  callFloor,
  buttonPress,
});

export const pendingLift = ({ pendingFloor, buttonPress }) => ({
  type: PENDING_LIFT,
  pendingFloor,
  buttonPress,
});

export const pendingToOngoing = () => ({
  type: PENDING_TO_ONGOING,
});

export const buttonPress = ({ button, data }) => ({
  type: BUTTON_PRESS,
  button,
  data,
});

export const moveUp = ({ movingDirection }) => ({
  type: MOVE_UP,
  movingDirection,
});

export const moveDown = ({ movingDirection }) => ({
  type: MOVE_DOWN,
  movingDirection,
});

export const moveStop = ({ movingDirection }) => ({
  type: MOVE_STOP,
  movingDirection,
});

export const movePending = ({ movingDirection }) => ({
  type: MOVE_PENDING,
  movingDirection,
});

export const setButtonPress = ({ buttonPress }) => ({
  type: SET_BUTTON_PRESS,
  buttonPress,
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
