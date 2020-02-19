import { combineReducers } from 'redux';

import liftReducer from './liftReducer';

const rootReducer = combineReducers({
  lift: liftReducer,
});

export default rootReducer;
