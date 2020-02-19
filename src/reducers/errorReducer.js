import * as errorActions from '../actions/errorActions';

const defaultState = Object.freeze({
  errors: [],
});

export default function errorReducer(state = defaultState, action) {
  switch (action.type) {
    case errorActions.PUSH_ERROR: {
      return Object.freeze({
        ...state,
        errors: state.errors.concat(action.error),
      });
    }
    case errorActions.POP_ERROR: {
      return Object.freeze({
        ...state,
        errors: state.errors.slice(0, -1),
      });
    }
    default:
      return state;
  }
}
