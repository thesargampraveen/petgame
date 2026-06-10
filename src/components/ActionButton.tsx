/**
 * ActionButton Component
 * A reusable button component for pet actions (feed, play, sleep)
 * Features:
 * - Haptic feedback on press
 * - Scale animation (bounce effect)
 * - Disabled state with visual feedback
 * - Icon and label support
 */

import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import RNHapticFeedback from 'react-native-haptic-feedback';
import { COLORS, UI_CONFIG, ANIMATION_CONFIG } from '../utils/constants';

/**
 * Props for the ActionButton component
 */
interface ActionButtonProps {
  /** Text label for the button */
  label: string;
  /** Icon emoji to display */
  icon: string;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Button color (default: PRIMARY) */
  color?: string;
  /** Callback when button is pressed */
  onPress: (event: GestureResponderEvent) => void;
  /** Optional test ID */
  testID?: string;
}

/**
 * Animated Touchable component
 * This allows us to use Reanimated with TouchableOpacity
 */
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * ActionButton Component
 * An animated button with haptic feedback
 */
export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  disabled = false,
  color = COLORS.PRIMARY,
  onPress,
  testID,
}) => {
  // Scale animation value
  const scale = useSharedValue(1);

  /**
   * Trigger haptic feedback
   * Uses impact feedback style for tactile response
   */
  const triggerHaptic = () => {
    try {
      RNHapticFeedback.trigger('impactMedium', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    } catch (error) {
      // Haptics might not be available on all devices
      console.warn('Haptic feedback not available:', error);
    }
  };

  /**
   * Handle press in event
   * Scales the button down to provide visual feedback
   */
  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 10,
      stiffness: 400,
    });
  };

  /**
   * Handle press out event
   * Triggers a bounce animation and haptic feedback
   */
  const handlePressOut = () => {
    // First return to normal scale, then bounce
    scale.value = withSequence(
      withTiming(1, { duration: 100, easing: Easing.out(Easing.exp) }),
      withSpring(1.05, {
        damping: 8,
        stiffness: 500,
      }),
      withSpring(1, {
        damping: 10,
        stiffness: 400,
      })
    );

    // Trigger haptic feedback after the animation completes
    // This gives a more satisfying feel
    runOnJS(triggerHaptic)();
  };

  /**
   * Handle the main press event
   * Combines the animation with the callback
   */
  const handlePress = (event: GestureResponderEvent) => {
    if (disabled) return;

    // Trigger bounce animation
    scale.value = withSequence(
      withSpring(0.9, {
        damping: 8,
        stiffness: 600,
      }),
      withSpring(1.1, {
        damping: 6,
        stiffness: 500,
      }),
      withSpring(1, {
        damping: 10,
        stiffness: 400,
      })
    );

    // Trigger haptic
    triggerHaptic();

    // Call the press callback
    onPress(event);
  };

  /**
   * Animated style based on scale value
   */
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  /**
   * Determine button colors based on state
   */
  const backgroundColor = disabled ? '#E0E0E0' : color;
  const textColor = disabled ? '#9E9E9E' : '#FFFFFF';

  return (
    <AnimatedTouchable
      testID={testID}
      style={[
        styles.button,
        { backgroundColor },
        disabled && styles.disabled,
        animatedStyle,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: UI_CONFIG.BUTTON_HEIGHT,
    borderRadius: UI_CONFIG.BUTTON_BORDER_RADIUS,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
