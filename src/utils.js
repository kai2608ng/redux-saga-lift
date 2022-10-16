import movingDirectionEnum from './enums/movingDirectionEnum';

export function sortOngoing(state, callFloor) {
	const liftOngoingFloor = [...state.liftOngoingFloor];
	const movingDirection = state.movingDirection;
	const ongoingFloorSet = new Set(liftOngoingFloor);

	if (!ongoingFloorSet.has(callFloor)) liftOngoingFloor.push(callFloor);

	if (movingDirection === movingDirectionEnum.DOWN) {
		// Descending Order
		liftOngoingFloor.sort().reverse();
	}

	if (movingDirection === movingDirectionEnum.UP)
		/// Ascending Order
		liftOngoingFloor.sort();

	return liftOngoingFloor;
}

export function sortPending(state, pendingFloor) {
	const liftPendingFloor = [...state.liftPendingFloor];
	const movingDirection = state.movingDirection;
	const pendingFloorSet = new Set(liftPendingFloor);

	if (!pendingFloorSet.has(pendingFloor)) liftPendingFloor.push(pendingFloor);

	if (movingDirection === movingDirectionEnum.DOWN) {
		// Ascending Order
		liftPendingFloor.sort();
	}

	if (movingDirection === movingDirectionEnum.UP) {
		// Descending Order
		liftPendingFloor.sort().reverse();
	}

	return liftPendingFloor;
}

export function removeReachedCall(state) {
	const liftOngoingFloor = [...state.liftOngoingFloor];
	liftOngoingFloor.shift();

	return liftOngoingFloor;
}
