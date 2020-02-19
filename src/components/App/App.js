import React from 'react';
import { useSelector } from 'react-redux';

import doorStateEnum from '../../enums/doorStateEnum';
import sensorStateEnum from '../../enums/sensorStateEnum';

import logo from './logo.svg';
import './App.css';

function App() {
  const error = useSelector(state => state.error.error);

  const passengersCount = useSelector(state => state.lift.passengersCount);

  const currentFloor = useSelector(state => state.lift.currentFloor);
  const doorState = useSelector(state => state.lift.doorState);
  const sensorState = useSelector(state => state.lift.sensorState);

  const doorStateCaption = {
    [doorStateEnum.CLOSED]: 'closed',
    [doorStateEnum.OPEN]: 'open',
  }[doorState];

  const sensorStateCaption = {
    [sensorStateEnum.ON]: 'blocked',
    [sensorStateEnum.OFF]: 'unblocked',
  }[sensorState];

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {error && (
          <div>
            <p>The lift is broken.</p>
            <p>{error}</p>
          </div>
        )}
        {!error && (
          <div>
            <p>Everything is in order.</p>
            <p>{`The lift is on the ${currentFloor} floor.`}</p>
            <p>{`There are ${passengersCount} passengers waiting.`}</p>
            <p>{`The doors are ${doorStateCaption} and ${sensorStateCaption}.`}</p>
          </div>
        )}
        <p>Find more in README.md</p>
      </header>
    </div>
  );
}

export default App;
