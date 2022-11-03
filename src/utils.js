import movingDirectionEnum from "./enums/movingDirectionEnum";
import buttonsEnum from "./enums/buttonsEnum";

function searchFloor(pendingQueue, currentFloor, movingDirection) {
  let left = 0;
  let right = pendingQueue.length - 1;
  let mid;

  // Search for the first floor that is lower than current floor
  if (movingDirection === movingDirectionEnum.UP) {
    while (left !== right) {
      mid = Math.floor((left + right) / 2);
      if (pendingQueue[mid] >= currentFloor) left = mid + 1;
      else right = mid;
    }
  }

  // Search for the first floor that is higher than current floor
  if (movingDirection === movingDirectionEnum.DOWN) {
    while (left !== right) {
      mid = Math.floor((left + right) / 2);
      if (pendingQueue[mid] <= currentFloor) left = mid + 1;
      else right = mid;
    }
  }

  return left;
}

export function setLift(state, button, floor) {
  let floorPressed = [...state.floorPressed];
  let onGoingQueue = [...state.onGoingQueue];
  let pendingQueue = [...state.pendingQueue];
  let { currentFloor, movingDirection } = state;

  if (movingDirection === movingDirectionEnum.NOT_MOVING) {
    floorPressed[floor] = button;
    onGoingQueue.push(floor);
    movingDirection = currentFloor < floor ? movingDirectionEnum.UP : movingDirectionEnum.DOWN
    return {movingDirection, floorPressed, onGoingQueue, pendingQueue}
  }

  if (movingDirection === movingDirectionEnum.UP) {
    if (floorPressed[floor] === null) {
      floorPressed[floor] = button;

      if (currentFloor < floor) {
        onGoingQueue.push(floor);
        // Ascending Order
        onGoingQueue.sort((a, b) => {return a > b ? 1 : a < b ? -1 : 0});

        for (let i = onGoingQueue.length - 2; i >= 0; i--) {
          // Remove all CALL_DOWN that are lower than the highest floor
          if (floorPressed[onGoingQueue[i]] === buttonsEnum.CALL_DOWN) {
            pendingQueue.push(onGoingQueue[i]);
            onGoingQueue.splice(i, 1);
          }
        }
      } else {
        pendingQueue.push(floor);
      }
    }
    // Overwrites CALL_DOWN with REQUEST_FLOOR
    if (
      button === buttonsEnum.REQUEST_FLOOR &&
      floorPressed[floor] === buttonsEnum.CALL_DOWN
    ) {
      floorPressed[floor] = button;
    }

    return { movingDirection, floorPressed, onGoingQueue, pendingQueue };
  }

  if (movingDirection === movingDirectionEnum.DOWN) {
    if (floorPressed[floor] === null) {
      floorPressed[floor] = button;

      if (currentFloor > floor) {
        onGoingQueue.push(floor);
      } else {
        pendingQueue.push(floor);
      }
      // Descending Order
      onGoingQueue.sort((a, b) => {
        return a > b ? -1 : a < b ? 1 : 0;
      });
    }
    
    return { movingDirection, floorPressed, onGoingQueue, pendingQueue };
  }
}

export function pendingToOngoing(state) {
  let onGoingQueue = [];
  let pendingQueue = [...state.pendingQueue];
  let floorPressed = [...state.floorPressed]
  let { movingDirection, currentFloor } = state;
  
  if (movingDirection === movingDirectionEnum.UP) {
    // Descending Order
    pendingQueue.sort((a, b) => {
      return a > b ? -1 : a < b ? 1 : 0;
    });
    // Get the split point for ongoing and pending
    const index = searchFloor(pendingQueue, currentFloor, movingDirection);
    onGoingQueue = pendingQueue.slice(index);
    pendingQueue = pendingQueue.slice(0, index);
    // Switch to moving downwards
    movingDirection = movingDirectionEnum.DOWN
    return { movingDirection, onGoingQueue, pendingQueue };
  }

  if (movingDirection === movingDirectionEnum.DOWN) {
    // Ascending Order
    pendingQueue.sort((a, b) => {return a > b ? 1 : a < b ? -1 : 0});
    // Get the split point for ongoing and pending
    const index = searchFloor(pendingQueue, currentFloor, movingDirection);
    onGoingQueue = pendingQueue.slice(index);
    pendingQueue = pendingQueue.slice(0, index);

    for (let i = onGoingQueue.length - 2; i >= 0; i--) {
      // Remove all CALL_DOWN that are lower than the highest floor
      if (floorPressed[onGoingQueue[i]] === buttonsEnum.CALL_DOWN) {
        pendingQueue.push(onGoingQueue[i]);
        onGoingQueue.splice(i, 1);
      }
    }
    // Switch to moving upwards
    movingDirection = movingDirectionEnum.UP
    return { movingDirection, onGoingQueue, pendingQueue };
  }
}

export function deleteLift(state) {
  let floorPressed = [...state.floorPressed]
  let onGoingQueue = [...state.onGoingQueue]
  // Reset the button of the reached floor
  // and remove that floor from the queue
  floorPressed[onGoingQueue.shift()] = null
  return {floorPressed, onGoingQueue};
}
