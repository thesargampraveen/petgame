/**
 * StatBar Component
 * A reusable progress bar component for displaying pet stats
 * Features:
 * - Animated progress with smooth transitions
 * - Color changes based on stat level (green → yellow → red)
 * - Icon indicator for each stat type
 * - Percentage label
 */

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { getStatColor } from '../utils/constants';
import { COLORS, UI_CONFIG } from '../utils/constants';

/**
 * Animated Circle component for the progress bar
 * Reanimated doesn't directly support SVG, so we use this workaround
 * with react-native-svg and reanimated's useAnimatedProps
 */
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Props for the StatBar component
 */
interface StatBarProps {
  /** Current value of the stat (0-100) */
  value: number;
  /** Label to display above the bar */
  label: string;
  /** Icon emoji to show next to the label */
  icon: string;
  /** Optional test ID for testing */
  testID?: string;
}

/**
 * Convert degrees to radians for circle calculations
 */
const degToRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Calculate the circumference of a circle
 */
const CIRCUMFERENCE = 2 * Math.PI * 45; // radius = 45

/**
 * StatBar Component
 * Displays a circular progress bar with color-coded status
 */
export const StatBar: React.FC<StatBarProps> = ({ value, label, icon, testID }) => {
  // Shared value for animating the progress
  const progress = useSharedValue(0);

  // Update progress when value changes
  useEffect(() => {
    progress.value = withTiming(value / 100, {
      duration: 600,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [value, progress]);

  // Calculate the color based on stat value
  const barColor = useMemo(() => {
    if (label === 'Hunger') {
      return getStatColor(value, 'hunger');
    } else if (label === 'Energy') {
      return getStatColor(value, 'energy');
    } else {
      return getStatColor(value, 'happiness');
    }
  }, [value, label]);

  // Calculate the background color based on stat level
  const bgColor = useMemo(() => {
    if (value < 30) {
      return '#FFEBEE'; // Light red for critical
    } else if (value < 70) {
      return '#FFF8E1'; // Light yellow for medium
    } else {
      return '#E8F5E9'; // Light green for good
    }
  }, [value]);

  /**
   * Animated props for the circle's stroke-dashoffset
   * This creates the progress animation
   */
  const animatedProps = useAnimatedProps(() => {
    // Calculate the dash offset based on progress
    // Offset goes from CIRCUMFERENCE (empty) to 0 (full)
    const dashOffset = CIRCUMFERENCE - progress.value * CIRCUMFERENCE;

    return {
      strokeDashoffset: dashOffset,
    };
  });

  return (
    <View style={styles.container} testID={testID}>
      {/* Label with icon */}
      <View style={styles.labelContainer}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.percentage}>{Math.round(value)}%</Text>
      </View>

      {/* Circular progress bar */}
      <View style={[styles.circleContainer, { backgroundColor: bgColor }]}>
        <Svg width={UI_CONFIG.STAT_BAR_HEIGHT * 2} height={UI_CONFIG.STAT_BAR_HEIGHT * 2}>
          {/* Background circle (track) */}
          <Circle
            cx={UI_CONFIG.STAT_BAR_HEIGHT}
            cy={UI_CONFIG.STAT_BAR_HEIGHT}
            r={45}
            stroke="#E0E0E0"
            strokeWidth={10}
            fill="none"
          />

          {/* Progress circle (animated) */}
          <AnimatedCircle
            animatedProps={animatedProps}
            cx={UI_CONFIG.STAT_BAR_HEIGHT}
            cy={UI_CONFIG.STAT_BAR_HEIGHT}
            r={45}
            stroke={barColor}
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
            rotation={-90} // Start from top
            origin={`${UI_CONFIG.STAT_BAR_HEIGHT}, ${UI_CONFIG.STAT_BAR_HEIGHT}`}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
          />
        </Svg>

        {/* Inner circle with emoji face */}
        <View style={styles.innerContent}>
          <Text style={styles.face}>
            {value > 70 ? '😊' : value > 40 ? '😐' : '😟'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  percentage: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  circleContainer: {
    width: UI_CONFIG.STAT_BAR_HEIGHT * 2,
    height: UI_CONFIG.STAT_BAR_HEIGHT * 2,
    borderRadius: UI_CONFIG.STAT_BAR_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  innerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  face: {
    fontSize: 20,
  },
});
