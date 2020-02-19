import { combineReducers } from 'redux';

import errorReducer from './errorReducer';
import liftReducer from './liftReducer';

const rootReducer = combineReducers({
  error: errorReducer,
  lift: liftReducer,
});

export default rootReducer;
