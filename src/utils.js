import movingDirectionEnum from "./enums/movingDirectionEnum";
import buttonsEnum from "./enums/buttonsEnum";

export function setLift(state, button, floor) {
  let floorPressed = [...state.floorPressed];
  let onGoingQueue = [...state.onGoingQueue];
  let pendingQueue = [...state.pendingQueue];
  const { currentFloor, movingDirection } = state;

  if (movingDirection === movingDirectionEnum.NOT_MOVING) {
    floorPressed[floor] = button;
    onGoingQueue.push(floor);
  }

  if (movingDirection === movingDirectionEnum.UP) {
    if (floorPressed[floor] === null) {
      floorPressed[floor] = button;

      if (currentFloor < floor) {
        // Overwrites CALL_DOWN with REQUEST_FLOOR
        if (
          button === buttonsEnum.REQUEST_FLOOR &&
          floorPressed[floor] === buttonsEnum.CALL_DOWN
        ) {
          floorPressed[floor] = button;
        }

        onGoingQueue.push(floor);
        onGoingQueue.sort();

        for (let i = onGoingQueue.length - 2; i >= 0; i--) {
          // Remove all CALL_DOWN that are lower than the highest floor
          if (floorPressed[i] === buttonsEnum.CALL_DOWN) {
            onGoingQueue.splice(i, 1);
            pendingQueue.push(i);
          }
        }
      } else {
        pendingQueue.push(floor);
      }
    }
  }

  if (movingDirection === movingDirectionEnum.DOWN) {
    if (floorPressed[floor] === null) {
      floorPressed[floor] = button;

      if (currentFloor > floor) {
        onGoingQueue.push(floor);
      } else {
        pendingQueue.push(floor);
      }

      onGoingQueue.sort((a, b) => {
        return a > b ? -1 : a < b ? 1 : 0;
      });
    }
  }

  return { onGoingQueue, pendingQueue };
}

function searchFloor(pendingQueue, currentFloor, movingDirection) {
  let left = 0;
  let right = pendingQueue.length - 1;
  let mid;

  if (movingDirection === movingDirectionEnum.UP) {
    while (left !== right) {
      mid = Math.floor((left + right) / 2);
      if (pendingQueue[mid] >= currentFloor) left = mid + 1;
      else right = mid;
    }
  }

  if (movingDirection === movingDirectionEnum.DOWN) {
    while (left !== right) {
      mid = Math.floor((left + right) / 2);
      if (pendingQueue[mid] <= currentFloor) left = mid + 1;
      else right = mid;
    }
  }

  return left;
}

export function pendingToOngoing(state) {
  let onGoingQueue = [];
  let pendingQueue = [...state.pendingQueue];
  const { movingDirection, currentFloor } = state;

  if (movingDirection === movingDirectionEnum.UP) {
    pendingQueue.sort((a, b) => {
      return a > b ? -1 : a < b ? 1 : 0;
    });
    const index = searchFloor(pendingQueue, currentFloor, movingDirection);

    onGoingQueue = pendingQueue.slice(index);
    pendingQueue = pendingQueue.slice(0, index);
  }

  if (movingDirection === movingDirectionEnum.DOWN) {
    pendingQueue.sort();
    const index = searchFloor(pendingQueue, currentFloor, movingDirection);

    onGoingQueue = pendingQueue.slice(0, index);
    pendingQueue = pendingQueue.slice(index);
  }

  return { onGoingQueue, pendingQueue };
}

export function removeLift(state) {
  return [...state.onGoingQueue].slice(1);
}
