import buttonsEnum from "./enums/buttonsEnum";
import movingDirectionEnum from "./enums/movingDirectionEnum";

// Remove duplicated floor in the pending queue
function removeDuplicate(liftOngoingFloor, liftPendingFloor) {
  liftPendingFloor.forEach((floor, index) => {
    if (!checkNoDuplicate(liftOngoingFloor, floor))
      liftPendingFloor.splice(index, 1);
  });

  return liftPendingFloor;
}

// No repeated floor in ongoing queue and pending queue
function checkNoDuplicate(liftOngoingFloor, floorData, setToRequest = false) {
  let isNoDuplicate = true;

  let newLiftOngoingFloor = liftOngoingFloor.map((floor) => {
    if (floor.callFloor === floorData.callFloor) {
      isNoDuplicate = false;
      floor.buttonPress = setToRequest
        ? buttonsEnum.REQUEST_FLOOR
        : floor.buttonPress;
    }
    return floor;
  });

  return setToRequest ? { isNoDuplicate, newLiftOngoingFloor } : isNoDuplicate;
}

// Add to the ongoing queue
export function addToOngoing(state, callFloor, buttonPress) {
  let liftOngoingFloor = [...state.liftOngoingFloor];
  let liftPendingFloor = [...state.liftPendingFloor];
  const movingDirection = state.movingDirection;
  const currentButtonPress = state.buttonPress;
  const floorData = { callFloor, buttonPress };

  // When lift is not moving, CALL_UP can assign to the lift
  if (currentButtonPress === buttonsEnum.CALL_UP) {
    if (checkNoDuplicate(liftOngoingFloor, floorData))
      liftOngoingFloor.unshift(floorData);
  }

  if (currentButtonPress === buttonsEnum.CALL_DOWN) {
    if (movingDirection === movingDirectionEnum.NOT_MOVING)
      liftOngoingFloor.unshift(floorData);

    if (
      movingDirection === movingDirectionEnum.UP ||
      movingDirection === movingDirectionEnum.PENDING_MOVING_UP
    ) {
      if (checkNoDuplicate(liftOngoingFloor, floorData))
        liftOngoingFloor.unshift(floorData);

      liftOngoingFloor = liftOngoingFloor.filter((floor) => {
        // Only keep the highest CALL_DOWN floor
        if (floor.buttonPress === buttonsEnum.CALL_DOWN) {
          if (floor.callFloor < floorData.callFloor) {
            // Add those floor that are lower than the current floor
            // to the pending list and remove them in the ongoing queue
            liftPendingFloor.push(floor);
            return false;
          }
        }
        return true;
      });
    }

    if (
      movingDirection === movingDirectionEnum.DOWN ||
      movingDirection === movingDirectionEnum.PENDING_MOVING_DOWN
    ) {
      if (checkNoDuplicate(liftOngoingFloor, floorData))
        liftOngoingFloor.unshift(floorData);

      // Go down the floor with a descending order
      liftOngoingFloor.sort((a, b) => {
        return a.callFloor > b.callFloor
          ? -1
          : a.callFloor === b.callFloor
          ? 0
          : 1;
      });
    }
  }

  if (currentButtonPress === buttonsEnum.REQUEST_FLOOR) {
    const { isNoDuplicate, newLiftOngoingFloor } = checkNoDuplicate(
      liftOngoingFloor,
      floorData,
      true // Set CALL_DOWN floor to REQUEST_FLOOR
    );

    // Check duplicates
    if (isNoDuplicate) newLiftOngoingFloor.unshift(floorData);

    if (movingDirection === movingDirectionEnum.NOT_MOVING)
      liftOngoingFloor = newLiftOngoingFloor;

    if (
      movingDirection === movingDirectionEnum.UP ||
      movingDirection === movingDirectionEnum.PENDING_MOVING_UP
    ) {
      const requestFloor = newLiftOngoingFloor.filter(
        (floor) => floor.buttonPress === buttonsEnum.REQUEST_FLOOR
      );
      const callDownFloor = newLiftOngoingFloor.filter(
        (floor) => floor.buttonPress === buttonsEnum.CALL_DOWN
      );

      // ascending order
      requestFloor.sort((a, b) => {
        return a.callFloor > b.callFloor
          ? 1
          : a.callFloor === b.callFloor
          ? 0
          : -1;
      });

      if (callDownFloor.length) {
        const highestCallDownFloor = callDownFloor.reduce((a, b) => {
          if (a.callFloor > b.callFloor) {
            liftPendingFloor.push(b);
            return a;
          } else if (a.callFloor < b.callFloor) {
            liftPendingFloor.push(a);
            return b;
          }
        });

        // Handle request first then call_down when moving up
        requestFloor.push(highestCallDownFloor);
      }
      liftOngoingFloor = requestFloor;
    }

    if (
      movingDirection === movingDirectionEnum.DOWN ||
      movingDirection === movingDirectionEnum.PENDING_MOVING_DOWN
    ) {
      // Moving downward with a descending order
      liftOngoingFloor = newLiftOngoingFloor.sort((a, b) => {
        return a.callFloor > b.callFloor
          ? -1
          : a.callFloor === b.callFloor
          ? 0
          : 1;
      });
    }
  }

  // Get rid of the problems of moving to a floor that the passenger has already entered
  // or exited to avoid the lift stop moving
  liftPendingFloor = removeDuplicate(liftOngoingFloor, liftPendingFloor);

  return {
    liftOngoingFloor,
    liftPendingFloor,
  };
}

// If lift is moving upwards but the calling floor is lower than the lift
// Or the lift is moving downwards but the calling floor is higher than the lift
// Add to the pending queue
export function addToPending(state, pendingFloor, buttonPress) {
  const liftPendingFloor = [...state.liftPendingFloor];
  const liftOngoingFloor = [...state.liftOngoingFloor];
  const floorData = { callFloor: pendingFloor, buttonPress };

  if (
    checkNoDuplicate(liftPendingFloor, floorData) &&
    checkNoDuplicate(liftOngoingFloor, floorData)
  )
    liftPendingFloor.unshift(floorData);

  return { liftPendingFloor };
}

export function pendingToOngoing(state) {
  let liftPendingFloor = [...state.liftPendingFloor];
  const currentFloor = state.currentFloor;
  const currentButtonPress = state.buttonPress;
  let movingDirection;
  let liftOngoingFloor = [];

  // Stops at the ground floor
  if (
    currentButtonPress === buttonsEnum.CALL_UP ||
    (currentButtonPress === buttonsEnum.REQUEST_FLOOR && currentFloor === 0)
  ) {
    movingDirection = movingDirectionEnum.UP;

    let requestFloor = liftPendingFloor.filter(
      (floor) => floor.buttonPress === buttonsEnum.REQUEST_FLOOR
    );
    let callDownFloor = liftPendingFloor.filter(
      (floor) => floor.buttonPress === buttonsEnum.CALL_DOWN
    );

    requestFloor.sort((a, b) => {
      return a.callFloor > b.callFloor ? 1 : a.callFloor < b.callFloor ? -1 : 0;
    });

    if (callDownFloor.length) {
      const highestCallDownFloor = callDownFloor.reduce((a, b) => {
        return a.callFloor > b.callFloor ? a : b;
      });
      // Handle request first then call down
      requestFloor.push(highestCallDownFloor);
      // Remove the highest call down floor in the pending queue
      liftPendingFloor = liftPendingFloor.filter(
        (floor) => floor.callFloor !== highestCallDownFloor.callFloor
      );
    }

    liftOngoingFloor = requestFloor;

    // Remove the request_floor in the pending queue
    liftPendingFloor = liftPendingFloor.filter((floor) => {
      return floor.buttonPress !== buttonsEnum.REQUEST_FLOOR;
    });

    return { movingDirection, liftOngoingFloor, liftPendingFloor };
  }

  // Stops at other floor besides ground floor
  if (
    currentButtonPress === buttonsEnum.CALL_DOWN ||
    (currentButtonPress === buttonsEnum.REQUEST_FLOOR && currentFloor !== 0)
  ) {
    movingDirection = movingDirectionEnum.DOWN;
    // Add those floor that are lower than current floor to the ongoing queue
    // and remove those floor in pending queue
    liftOngoingFloor = liftPendingFloor.filter((floor) => {
      return floor.callFloor < currentFloor;
    });

    liftPendingFloor = liftPendingFloor.filter((floor) => {
      return floor.callFloor >= currentFloor;
    });

    liftOngoingFloor.sort((a, b) => {
      return a.callFloor > b.callFloor ? -1 : a.callFloor < b.callFloor ? 1 : 0;
    });

    return { movingDirection, liftOngoingFloor, liftPendingFloor };
  }
}

export function removeReachedCall(state) {
  // track current ongoing button
  let nextButtonPress = state.liftOngoingFloor[0].buttonPress;

  // track next ongoing button
  if (state.liftOngoingFloor.length > 1)
    nextButtonPress = state.liftOngoingFloor[1].buttonPress;

  return {
    buttonPress: nextButtonPress,
    liftOngoingFloor: [...state.liftOngoingFloor].slice(1),
  };
}
