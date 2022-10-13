export function sortClosestPassenger(state, newPassengerFloor) {
	const passengersFloor = [...state.passengersFloor];
	const movingDirection = state.movingDirection;
	const floorSet = new Set(passengersFloor);

	if (floorSet.has(newPassengerFloor)) return state.passengersFloor;

	passengersFloor.push(newPassengerFloor);
	passengersFloor.sort();

	return passengersFloor;
}

export function sortClosestRequestFloor(state, newRequestFloor) {
	const passengersRequestFloor = [...state.passengersRequestFloor];
	const requestFloorSet = new Set(passengersRequestFloor);

	if (requestFloorSet.has(newRequestFloor)) return state.passengersRequestFloor;

	passengersRequestFloor.push(newRequestFloor);
	passengersRequestFloor.sort();

	return passengersRequestFloor;
}

export function removeReachedCall(state) {
	const passengersFloor = [...state.passengersFloor];
	passengersFloor.shift();

	return passengersFloor;
}
