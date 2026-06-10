/**
 * Pet Component
 * The main visual representation of the virtual pet
 * Features:
 * - Different animations based on mood (happy, sad, sleeping, critical, excited)
 * - Smooth transitions between moods
 * - Idle animation (breathing effect)
 * - Bounce animation on actions
 * - SVG-based cute pet character
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path, G } from 'react-native-svg';
import { PetMood } from '../types';
import { ANIMATION_CONFIG, UI_CONFIG, COLORS } from '../utils/constants';

/**
 * Props for the Pet component
 */
export interface PetProps {
  /** Current mood of the pet */
  mood: PetMood;
  /** Whether to trigger a bounce animation */
  triggerBounce?: boolean;
  /** Callback when bounce animation completes */
  onBounceComplete?: () => void;
  /** Whether pet is eating (shows eating animation) */
  isEating?: boolean;
  /** Optional test ID */
  testID?: string;
}

/**
 * Pet Component
 * Displays an animated pet character with mood-based expressions
 */
export const Pet: React.FC<PetProps> = ({
  mood,
  triggerBounce = false,
  onBounceComplete,
  isEating = false,
  testID,
}) => {
  // Scale for bounce animation
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  // Idle animation (breathing effect)
  const breatheScale = useSharedValue(1);
  const bounceY = useSharedValue(0);

  // Eating animation values
  const mouthOpen = useSharedValue(0);
  const foodVisible = useSharedValue(1);
  const headTilt = useSharedValue(0);

  // Track if bounce is in progress
  const bounceInProgress = useRef(false);

  /**
   * Start idle animations when component mounts
   */
  useEffect(() => {
    // Breathing animation - gentle scale up and down
    breatheScale.value = withRepeat(
      withSequence(
        withTiming(1.02, {
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(1, {
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
        })
      ),
      -1, // Infinite repeat
      false
    );

    // Subtle bounce animation
    bounceY.value = withRepeat(
      withSequence(
        withTiming(-5, {
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(0, {
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
        })
      ),
      -1,
      false
    );
  }, []);

  /**
   * Handle eating animation
   */
  useEffect(() => {
    if (isEating) {
      // Head tilts forward while eating
      headTilt.value = withSequence(
        withTiming(5, { duration: 200 }),
        withTiming(-5, { duration: 300 }),
        withTiming(5, { duration: 300 }),
        withTiming(0, { duration: 200 })
      );

      // Mouth opens and closes (chewing)
      mouthOpen.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 250 }),
          withTiming(0, { duration: 250 })
        ),
        3, // 3 chewing cycles
        false
      );

      // Food fades out at the end
      foodVisible.value = withTiming(0, { duration: 800, delay: 500 });
    } else {
      // Reset values when not eating
      mouthOpen.value = 0;
      headTilt.value = 0;
      foodVisible.value = 1;
    }
  }, [isEating]);

  /**
   * Trigger bounce animation when requested
   */
  useEffect(() => {
    if (triggerBounce && !bounceInProgress.current) {
      bounceInProgress.current = true;

      // Bounce sequence: scale up -> scale down -> return to normal
      scale.value = withSequence(
        withSpring(1.15, {
          damping: 8,
          stiffness: 500,
        }),
        withSpring(0.95, {
          damping: 8,
          stiffness: 500,
        }),
        withSpring(1, {
          damping: 10,
          stiffness: 400,
        })
      );

      // Slight rotation for more dynamic feel
      rotation.value = withSequence(
        withTiming(5, { duration: 100 }),
        withTiming(-5, { duration: 200 }),
        withTiming(0, { duration: 100 })
      );

      // Notify when bounce completes (approximately 600ms)
      const timeoutId = setTimeout(() => {
        bounceInProgress.current = false;
        if (onBounceComplete) {
          runOnJS(onBounceComplete)();
        }
      }, 600);

      return () => clearTimeout(timeoutId);
    }
  }, [triggerBounce, onBounceComplete, scale, rotation]);

  /**
   * Get the face expression based on mood
   */
  const getFaceExpression = (): React.ReactElement => {
    // If eating, override with eating expression
    if (isEating) {
      return (
        <G>
          {/* Happy closed eyes while eating */}
          <Path
            d="M95 85 Q105 75 115 85"
            stroke="#2D2D2D"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M145 85 Q155 75 165 85"
            stroke="#2D2D2D"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {/* Open mouth for eating */}
          <Ellipse
            cx="130"
            cy="125"
            rx="12"
            ry="10"
            fill="#8B4513"
          />
          {/* Rosy cheeks */}
          <Circle cx="85" cy="105" r="10" fill="#FFB6C1" opacity={0.8} />
          <Circle cx="175" cy="105" r="10" fill="#FFB6C1" opacity={0.8} />
        </G>
      );
    }

    switch (mood) {
      case PetMood.HAPPY:
        return (
          <>
            {/* Happy eyes */}
            <Path
              d="M95 85 Q105 75 115 85"
              stroke="#2D2D2D"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M145 85 Q155 75 165 85"
              stroke="#2D2D2D"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            {/* Big smile */}
            <Path
              d="M105 115 Q130 145 155 115"
              stroke="#2D2D2D"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            {/* Rosy cheeks */}
            <Circle cx="85" cy="105" r="8" fill="#FFB6C1" opacity={0.6} />
            <Circle cx="175" cy="105" r="8" fill="#FFB6C1" opacity={0.6} />
          </>
        );

      case PetMood.SAD:
        return (
          <>
            {/* Sad eyes */}
            <Circle cx="105" cy="90" r="5" fill="#2D2D2D" />
            <Circle cx="155" cy="90" r="5" fill="#2D2D2D" />
            {/* Frown */}
            <Path
              d="M110 125 Q130 105 150 125"
              stroke="#2D2D2D"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            {/* Tear */}
            <Path
              d="M95 100 Q90 115 95 125 Q100 115 95 100"
              fill="#64B5F6"
            />
          </>
        );

      case PetMood.SLEEPING:
        return (
          <>
            {/* Closed eyes */}
            <Path
              d="M95 90 L115 90"
              stroke="#2D2D2D"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <Path
              d="M145 90 L165 90"
              stroke="#2D2D2D"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Slight smile */}
            <Path
              d="M115 115 Q130 125 145 115"
              stroke="#2D2D2D"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </>
        );

      case PetMood.CRITICAL:
        return (
          <>
            {/* Worried eyes */}
            <Ellipse cx="105" cy="90" rx="8" ry="10" fill="#2D2D2D" />
            <Ellipse cx="155" cy="90" rx="8" ry="10" fill="#2D2D2D" />
            {/* Worried mouth */}
            <Path
              d="M120 115 L130 115 L125 125 Z"
              stroke="#2D2D2D"
              strokeWidth="2"
              fill="none"
            />
            {/* Sweat drop */}
            <Path
              d="M175 85 Q170 100 175 110 Q180 100 175 85"
              fill="#B3E5FC"
            />
          </>
        );

      case PetMood.EXCITED:
        return (
          <>
            {/* Star eyes */}
            <Path
              d="M105 80 L110 90 L120 90 L112 97 L115 107 L105 100 L95 107 L98 97 L90 90 L100 90 Z"
              fill="#FFD700"
            />
            <Path
              d="M155 80 L160 90 L170 90 L162 97 L165 107 L155 100 L145 107 L148 97 L140 90 L150 90 Z"
              fill="#FFD700"
            />
            {/* Open excited mouth */}
            <Ellipse cx="130" cy="125" rx="15" ry="12" fill="#2D2D2D" />
            {/* Blush */}
            <Circle cx="80" cy="105" r="12" fill="#FF8A80" opacity={0.5} />
            <Circle cx="180" cy="105" r="12" fill="#FF8A80" opacity={0.5} />
          </>
        );

      case PetMood.IDLE:
      default:
        return (
          <>
            {/* Normal eyes */}
            <Circle cx="105" cy="90" r="6" fill="#2D2D2D" />
            <Circle cx="155" cy="90" r="6" fill="#2D2D2D" />
            {/* Small smile */}
            <Path
              d="M115 115 Q130 122 145 115"
              stroke="#2D2D2D"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </>
        );
    }
  };

  /**
   * Get pet body color based on mood
   */
  const getBodyColor = (): string => {
    switch (mood) {
      case PetMood.HAPPY:
      case PetMood.EXCITED:
        return '#FFD54F'; // Bright yellow
      case PetMood.SAD:
        return '#90A4AE'; // Blue-gray
      case PetMood.SLEEPING:
        return '#E1BEE7'; // Soft purple
      case PetMood.CRITICAL:
        return '#FFAB91'; // Pale orange
      default:
        return '#FFD54F'; // Default yellow
    }
  };

  /**
   * Animated style for bounce and rotation
   */
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * breatheScale.value },
      { translateY: bounceY.value },
      { rotateZ: `${rotation.value + headTilt.value}deg` },
    ],
  }));

  /**
   * Animated style for food visibility
   */
  const foodAnimatedStyle = useAnimatedStyle(() => ({
    opacity: foodVisible.value,
    transform: [
      { translateY: withSpring(foodVisible.value > 0.5 ? 0 : -20) },
    ],
  }));

  return (
    <View style={styles.container} testID={testID}>
      <Animated.View style={[styles.petContainer, animatedStyle]}>
        <Svg
          width={UI_CONFIG.PET_SIZE}
          height={UI_CONFIG.PET_SIZE}
          viewBox="0 0 260 260"
        >
          {/* Shadow */}
          <Ellipse
            cx="130"
            cy="245"
            rx="60"
            ry="10"
            fill="#000000"
            opacity={0.1}
          />

          {/* Body */}
          <Circle cx="130" cy="130" r="90" fill={getBodyColor()} />

          {/* Belly highlight */}
          <Ellipse cx="130" cy="160" rx="50" ry="40" fill="#FFFFFF" opacity={0.3} />

          {/* Face group */}
          <G>{getFaceExpression()}</G>

          {/* Ears */}
          <Ellipse cx="60" cy="80" rx="25" ry="35" fill={getBodyColor()} />
          <Ellipse cx="60" cy="80" rx="15" ry="25" fill="#FFF9C4" opacity={0.5} />
          <Ellipse cx="200" cy="80" rx="25" ry="35" fill={getBodyColor()} />
          <Ellipse cx="200" cy="80" rx="15" ry="25" fill="#FFF9C4" opacity={0.5} />

          {/* Feet */}
          <Ellipse cx="90" cy="210" rx="20" ry="12" fill="#FFA726" />
          <Ellipse cx="170" cy="210" rx="20" ry="12" fill="#FFA726" />

          {/* Arms */}
          <Ellipse cx="50" cy="150" rx="18" ry="25" fill={getBodyColor()} />
          <Ellipse cx="210" cy="150" rx="18" ry="25" fill={getBodyColor()} />
        </Svg>
      </Animated.View>

      {/* Food element (shown when eating) */}
      {isEating && (
        <Animated.View style={[styles.foodContainer, foodAnimatedStyle]}>
          <Svg width={60} height={60} viewBox="0 0 60 60">
            {/* Meat bone */}
            <Ellipse cx="30" cy="30" rx="18" ry="12" fill="#8B4513" />
            <Circle cx="12" cy="30" r="6" fill="#F5DEB3" />
            <Circle cx="48" cy="30" r="6" fill="#F5DEB3" />
            {/* Bone shine */}
            <Ellipse cx="28" cy="25" rx="8" ry="4" fill="#FFFFFF" opacity={0.4} />
          </Svg>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  petContainer: {
    // Size is set by the SVG viewBox
  },
  foodContainer: {
    position: 'absolute',
    right: 20,
    top: 80,
  },
});
