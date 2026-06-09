/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { gestureHandlerRootHoc } from 'react-native-gesture-handler';
import App from './App';
import { name as appName } from './app.json';

// Wrap the app with gesture handler to ensure proper gesture handling
const WrappedApp = gestureHandlerRootHoc(App);

AppRegistry.registerComponent(appName, () => WrappedApp);
