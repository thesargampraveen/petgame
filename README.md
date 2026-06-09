# My Pet - Virtual Pet Game

A cute virtual pet game similar to Tamagotchi, built with React Native CLI.

## Features

- 🐱 **Adorable Virtual Pet** - A cute animated pet with mood-based expressions
- 📊 **Stat Management** - Monitor Hunger, Energy, and Happiness
- 🎮 **Interactive Actions** - Feed, play, and put your pet to sleep
- 📈 **XP & Leveling System** - Level up by taking care of your pet
- ⏰ **Offline Progress** - Stats decay even when the app is closed
- ✨ **Juicy Animations** - Bounce effects, particles, and smooth transitions
- 🎨 **Modern UI** - Beautiful color-coded stat bars and card design

## Tech Stack

- **React Native** 0.80+
- **TypeScript** for type safety
- **Redux Toolkit** for state management
- **React Native Reanimated** for smooth animations
- **React Native MMKV** for fast persistent storage
- **React Native Gesture Handler** for touch interactions
- **React Native Haptics** for tactile feedback

## Installation

### Prerequisites

- Node.js 18 or higher
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Steps

1. **Navigate to the project directory**
   ```bash
   cd C:\Users\Admin\PetGame
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS dependencies (macOS only)**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Configure native dependencies**

   For Android, the dependencies are usually auto-linked. If you encounter issues:
   ```bash
   npx react-native link react-native-gesture-handler
   npx react-native link react-native-reanimated
   npx react-native link react-native-mmkv
   npx react-native link react-native-haptics
   ```

5. **Configure ProGuard (Android)**

   Add to `android/app/proguard-rules.pro`:
   ```prolog
   -keep class com.como.mmkv.MMKV { *; }
   -keep class com.swmansion.reanimated.ReanimatedPackage { *; }
   ```

6. **Configure Reanimated (Android)**

   Update `android/app/src/main/java/com/mypet/MainActivity.java`:
   ```java
   package com.mypet;

   import com.facebook.react.ReactActivity;

   public class MainActivity extends ReactActivity {
       @Override
       protected String getMainComponentName() {
           return "MyPet";
       }
   }
   ```

## Running the App

### Development Mode

```bash
# Start the Metro bundler
npm start

# In another terminal, run on Android
npm run android

# Or run on iOS (macOS only)
npm run ios
```

### Building APK

```bash
# Debug APK
npm run build-android-debug

# Release APK
npm run build-android
```

The APK files will be located at:
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

## How to Play

1. **Feed Your Pet** 🍖
   - Increases Hunger stat
   - Awards XP
   - Triggers heart particles

2. **Play with Your Pet** 🎾
   - Increases Happiness but costs Energy
   - Awards XP
   - Triggers star particles

3. **Put to Sleep** 🌙
   - Energy regenerates faster while sleeping
   - Other stats decay slower
   - Pet shows sleeping expression

4. **Level Up** 📈
   - Every action awards XP
   - Higher levels unlock titles
   - XP bonus for keeping stats high

## Stat Decay

- **Online Decay**: Stats decrease gradually while the app is open
- **Offline Decay**: Stats decrease when the app is closed (capped at 8 hours)
- **Maximum Offline Penalty**: Stats won't drop below 40% from offline decay

## Pet Moods

- 😊 **Happy**: All stats above 70%
- 🤩 **Excited**: All stats above 90%
- 😐 **Idle**: Normal state
- 😢 **Sad**: Any stat below 40%
- 🚨 **Critical**: Any stat below 20%
- 😴 **Sleeping**: When pet is put to sleep

## Project Structure

```
src/
├── assets/           # Images, fonts, etc.
├── components/        # Reusable UI components
│   ├── Pet.tsx               # Pet character component
│   ├── StatBar.tsx           # Circular progress bar
│   ├── ActionButton.tsx      # Animated button
│   └── ParticleEffect.tsx   # Floating emoji effects
├── redux/            # State management
│   ├── store.ts              # Redux store configuration
│   └── petSlice.ts           # Pet state and reducers
├── screens/          # Screen components
│   └── HomeScreen.tsx        # Main game screen
├── hooks/            # Custom React hooks
│   ├── useRedux.ts           # Typed Redux hooks
│   ├── usePetActions.ts      # Pet action functions
│   └── usePetDecay.ts        # Automatic stat decay
├── utils/            # Utility functions
│   ├── constants.ts          # Game constants
│   └── offlineDecay.ts       # Offline decay calculation
├── storage/          # Persistent storage
│   └── mmkv.ts                # MMKV storage setup
└── types/            # TypeScript definitions
    └── index.ts              # Type definitions
```

## Game Balance

### Decay Rates (per second)
- Hunger: -0.5
- Energy: -0.3
- Happiness: -0.4

### Action Benefits
- Feed: +25 Hunger
- Play: +20 Happiness, -10 Energy, -5 Hunger
- Sleep: +5 Energy per second

### XP System
- Base XP per action: 10
- Bonus multiplier: 1.5x (when average stat > 70%)
- Level 2 requires: 100 XP
- Each level requires 1.2x more XP

## Troubleshooting

### Metro bundler issues
```bash
npm start -- --reset-cache
```

### Android build issues
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### iOS build issues (macOS)
```bash
cd ios
pod install
cd ..
npm run ios
```

### Reanimated not working
Ensure you've configured MainActivity.java as shown above and that ProGuard rules are added.

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

Built with ❤️ using React Native and TypeScript.
