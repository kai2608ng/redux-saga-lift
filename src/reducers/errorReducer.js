import * as errorActions from '../actions/errorActions';
import * as reducerActions from '../actions/reducerActions';

const defaultState = Object.freeze({
  error: null,
});

export default function errorReducer(state = defaultState, action) {
  switch (action.type) {
    case errorActions.SET_ERROR: {
      return Object.freeze({
        ...state,
        error: action.error,
      });
    }
    case reducerActions.RESET: {
      return defaultState;
    }
    default:
      return state;
  }
}
