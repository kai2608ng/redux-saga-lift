export const BUTTON_PRESS = '@lift/BUTTON_PRESS';

export const MOVE_UP = '@lift/MOVE_UP';
export const MOVE_DOWN = '@lift/MOVE_DOWN';
export const SET_DIRECTION = '@lift/SET_DIRECTION';

export const CLOSE_DOOR = '@lift/CLOSE_DOOR';
export const OPEN_DOOR = '@lift/OPEN_DOOR';

export const DOOR_SENSOR_OFF = '@lift/DOOR_SENSOR_OFF';
export const DOOR_SENSOR_ON = '@lift/DOOR_SENSOR_ON';

export const INCREMENT_PASSENGERS = '@lift/INCREMENT_PASSENGERS';
export const DECREMENT_PASSENGERS = '@lift/DECREMENT_PASSENGERS';

export const PASSENGER_CALL_LIFT = '@lift/PASSENGER_CALL_LIFT';
export const REQUEST_CALL_LIFT = '@lift/REQUEST_CALL_LIFT';

export const REMOVE_CALL = '@lift/REMOVE_CALL';
export const REMOVE_REQUEST = '@lift/REMOVE_REQUEST';

export const removeCall = () => ({
	type: REMOVE_CALL,
});

export const removeRequest = () => ({
	type: REMOVE_REQUEST,
});

export const passengerCallLift = ({ passengerFloor }) => ({
	type: PASSENGER_CALL_LIFT,
	passengerFloor,
});

export const requestCallLift = ({ requestFloor }) => ({
	type: REQUEST_CALL_LIFT,
	requestFloor,
});

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

export const setDirection = ({ direction }) => ({
	type: SET_DIRECTION,
	direction,
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
