const defaultState = Object.freeze({
});

export default function liftReducer(state = defaultState, action) {
  switch (action.type) {
    default:
      return state;
  }
}
