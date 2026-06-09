/**
 * My Pet - Virtual Pet Game App
 * A cute Tamagotchi-style game built with React Native
 *
 * @format
 */

import React from 'react';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/redux/store';
import { HomeScreen } from './src/screens/HomeScreen';

/**
 * Main App Component
 * Wraps the application with Redux and Gesture Handler providers
 */
function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <HomeScreen />
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
