/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Note: Gesture handling is already wrapped in App.tsx with GestureHandlerRootView
AppRegistry.registerComponent(appName, () => App);
