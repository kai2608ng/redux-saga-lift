export function getDoorState(state) {
  return state.lift.doorState;
}

export function getCurrentFloor(state) {
  return state.lift.currentFloor;
}

export function getTargetFloor(state) {
  return state.lift.onGoingQueue[0];
}

export function getMovingDirection(state) {
  return state.lift.movingDirection;
}

export function getSensorState(state){
  return state.lift.sensorState
}

export function getOngoingQueue(state){
  return state.lift.onGoingQueue
}

export function getPendingQueue(state){
  return state.lift.pendingQueue
}

export function getIsOngoing(state){
  return state.lift.onGoingQueue.length
}