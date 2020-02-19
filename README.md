### Redux Saga Training Lift

## Instructions

You are tasked with programming a lift. 🙂
You will receive button presses and sensor feedback from people moving between the doors and your task will be to move the lift between the floors, open and close doors for passengers.

Add necessary code in sagas/liftSaga.js to program your lift.

Buttons:
1. Button events are dispatched as actions with type, button, and optional data field. Type is always `liftActions.BUTTON_PRESS`.
2. There are two buttons outside the lift at each floor.
Corresponding button fields are: `buttonsEnum.CALL_UP`, `buttonsEnum.CALL_DOWN`
Data field for them will contain the floor at which they were requested.
3. There is one buton inside a lift `buttonsEnum.REQUEST_FLOOR`. Data contains the floor number. 🙂

Sensors:
1. When there is an object blocking doors `liftActions.DOOR_SENSOR_ON` will be dispatched.
Once the door is clear `liftActions.DOOR_SENSOR_OFF` will be dispacthed.
Sensor state is available in state.lift.sensorState.

Controlling the lift:
1. You may move the lift up by one floor using `liftActions.moveUp()`
2. You may move the lift down by one floor using `liftActions.moveDown()`
3. You may open and close the door using `liftActions.openDoor()` and `liftActions.closeDoor()`

Requirements:
1. Lift can't move with open doors.
2. Lift can't move beyond the last and the first floor. It's dangerous.
3. Lift should automatically open doors when it arrives at the desired floor.
4. Lift should automatically close doors five second after the last person enters (or if no person enters)

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `yarn build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
