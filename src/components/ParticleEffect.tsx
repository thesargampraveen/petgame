/**
 * ParticleEffect Component
 * Displays floating emoji particles for visual feedback
 * Features:
 * - Random spawn positions around a center point
 * - Float upward animation with fade out
 * - Multiple particle types (hearts, stars, zzz, sparkles)
 * - Automatic cleanup after animation completes
 */

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
  ReduceMotion,
} from 'react-native-reanimated';
import { ANIMATION_CONFIG } from '../utils/constants';

/**
 * Screen dimensions for calculating spawn positions
 */
const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Props for a single particle
 */
interface ParticleProps {
  /** The emoji to display */
  emoji: string;
  /** Starting X position (0-1 relative to parent width) */
  startX: number;
  /** Starting Y position (0-1 relative to parent height) */
  startY: number;
  /** Random horizontal drift */
  driftX: number;
  /** Animation duration in ms */
  duration?: number;
  /** Callback when animation completes */
  onAnimationEnd?: () => void;
}

/**
 * Single Particle Component
 * Animates one floating emoji particle
 */
const Particle: React.FC<ParticleProps> = ({
  emoji,
  startX,
  startY,
  driftX,
  duration = ANIMATION_CONFIG.PARTICLE_DURATION,
  onAnimationEnd,
}) => {
  // Animation values
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  /**
   * Start the particle animation when component mounts
   */
  useEffect(() => {
    // Start with a pop-in effect
    scale.value = withSequence(
      withTiming(1.2, { duration: 100, easing: Easing.out(Easing.exp) }),
      withTiming(1, { duration: 100, easing: Easing.inOut(Easing.sin) })
    );

    // Float upward and fade out
    translateX.value = withTiming(driftX, {
      duration,
      easing: Easing.out(Easing.exp),
    });

    translateY.value = withTiming(-150, {
      duration,
      easing: Easing.out(Easing.exp),
    });

    opacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, {
        duration: duration - 200,
        easing: Easing.in(Easing.cubic),
      })
    );

    // Call cleanup when animation completes
    const timeoutId = setTimeout(() => {
      if (onAnimationEnd) {
        runOnJS(onAnimationEnd)();
      }
    }, duration);

    return () => clearTimeout(timeoutId);
  }, [duration, driftX, onAnimationEnd]);

  /**
   * Animated styles
   */
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[
        styles.particle,
        {
          left: `${startX * 100}%`,
          top: `${startY * 100}%`,
        },
        animatedStyle,
      ]}
    >
      {emoji}
    </Animated.Text>
  );
};

/**
 * Props for the ParticleEffect container
 */
export interface ParticleEffectProps {
  /** Whether to show particles */
  visible: boolean;
  /** Type of particles to show */
  type: 'heart' | 'star' | 'zzz' | 'sparkle';
  /** Number of particles to spawn */
  count?: number;
  /** Callback when all particles complete */
  onComplete?: () => void;
}

/**
 * ParticleEffect Component
 * Spawns and manages multiple floating particles
 */
export const ParticleEffect: React.FC<ParticleEffectProps> = ({
  visible,
  type,
  count = 8,
  onComplete,
}) => {
  // Track completed particles
  const [completedCount, setCompletedCount] = React.useState(0);

  /**
   * Get the emoji for a particle type
   */
  const getEmoji = (particleType: string): string => {
    switch (particleType) {
      case 'heart':
        return '❤️';
      case 'star':
        return '⭐';
      case 'zzz':
        return '💤';
      case 'sparkle':
        return '✨';
      default:
        return '✨';
    }
  };

  /**
   * Generate random particles with varied positions
   */
  const particles = useMemo(() => {
    if (!visible) return [];

    const newParticles = [];

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: `${type}-${i}-${Date.now()}`,
        emoji: getEmoji(type),
        startX: 40 + Math.random() * 20, // Center 20% of parent (40-60%)
        startY: 40 + Math.random() * 20, // Center 20% of parent (40-60%)
        driftX: (Math.random() - 0.5) * 100, // Random horizontal drift
        duration: ANIMATION_CONFIG.PARTICLE_DURATION + Math.random() * 300, // Slight timing variation
      });
    }

    return newParticles;
  }, [visible, type, count]);

  /**
   * Handle individual particle completion
   */
  const handleParticleComplete = () => {
    const newCount = completedCount + 1;
    setCompletedCount(newCount);

    // All particles done
    if (newCount >= particles.length && onComplete) {
      onComplete();
    }
  };

  if (!visible || particles.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          emoji={particle.emoji}
          startX={particle.startX}
          startY={particle.startY}
          driftX={particle.driftX}
          duration={particle.duration}
          onAnimationEnd={handleParticleComplete}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'visible',
  },
  particle: {
    position: 'absolute',
    fontSize: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});
