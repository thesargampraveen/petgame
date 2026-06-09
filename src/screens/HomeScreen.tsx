/**
 * HomeScreen Component
 * The main screen of the pet game
 * Features:
 * - Displays the pet with current mood
 * - Shows all three stat bars
 * - Provides action buttons (feed, play, sleep/wake)
 * - Displays level and XP progress
 * - Shows particle effects on actions
 * - Handles all user interactions
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { Pet } from '../components/Pet';
import { StatBar } from '../components/StatBar';
import { ActionButton } from '../components/ActionButton';
import { ParticleEffect } from '../components/ParticleEffect';
import { usePetActions } from '../hooks/usePetActions';
import { usePetDecay } from '../hooks/usePetDecay';
import {
  selectPetStats,
  selectPetMood,
  selectPetLevel,
  selectPetXP,
  selectXPToNextLevel,
  selectIsSleeping,
  initializePet,
} from '../redux/petSlice';
import { PetMood } from '../types';
import { COLORS, getLevelTitle, getXPForLevel } from '../utils/constants';

/**
 * HomeScreen Component
 * Main game screen that combines all UI elements
 */
export const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { feed, play, sleep, wake } = usePetActions();

  // Redux state
  const stats = useAppSelector(selectPetStats);
  const mood = useAppSelector(selectPetMood);
  const level = useAppSelector(selectPetLevel);
  const xp = useAppSelector(selectPetXP);
  const xpToNextLevel = useAppSelector(selectXPToNextLevel);
  const isSleeping = useAppSelector(selectIsSleeping);

  // Local state for animations
  const [bounceTrigger, setBounceTrigger] = useState(false);
  const [particleVisible, setParticleVisible] = useState(false);
  const [particleType, setParticleType] = useState<'heart' | 'star' | 'zzz' | 'sparkle'>('heart');

  // Initialize pet state on mount
  useEffect(() => {
    dispatch(initializePet());
  }, [dispatch]);

  // Set up automatic stat decay
  usePetDecay({ intervalMs: 1000 });

  /**
   * Handle bounce animation completion
   */
  const handleBounceComplete = useCallback(() => {
    setBounceTrigger(false);
  }, []);

  /**
   * Handle feed action
   */
  const handleFeed = useCallback(() => {
    feed();
    setBounceTrigger(true);
    setParticleType('heart');
    setParticleVisible(true);
  }, [feed]);

  /**
   * Handle play action
   */
  const handlePlay = useCallback(() => {
    if (stats.energy < 10) {
      // Too tired to play
      return;
    }
    play();
    setBounceTrigger(true);
    setParticleType('star');
    setParticleVisible(true);
  }, [play, stats.energy]);

  /**
   * Handle sleep/wake action
   */
  const handleSleepToggle = useCallback(() => {
    if (isSleeping) {
      wake();
    } else {
      sleep();
      setParticleType('zzz');
      setParticleVisible(true);
    }
  }, [isSleeping, sleep, wake]);

  /**
   * Handle particle animation completion
   */
  const handleParticleComplete = useCallback(() => {
    setParticleVisible(false);
  }, []);

  /**
   * Get background color based on mood
   */
  const getBackgroundColor = (): string => {
    switch (mood) {
      case PetMood.HAPPY:
      case PetMood.EXCITED:
        return '#FFF3E0'; // Warm orange tint
      case PetMood.SAD:
        return '#ECEFF1'; // Cool gray
      case PetMood.CRITICAL:
        return '#FFEBEE'; // Light red
      case PetMood.SLEEPING:
        return '#E8EAF6'; // Soft purple
      default:
        return '#F5F5F7'; // Default light gray
    }
  };

  /**
   * Get welcome message based on mood
   */
  const getWelcomeMessage = (): string => {
    if (isSleeping) {
      return 'Shh... Pet is sleeping 😴';
    }

    switch (mood) {
      case PetMood.HAPPY:
        return 'Your pet is happy! 😊';
      case PetMood.EXCITED:
        return 'Your pet is super excited! 🤩';
      case PetMood.SAD:
        return 'Your pet is feeling sad... 😢';
      case PetMood.CRITICAL:
        return 'Your pet needs attention! 🚨';
      default:
        return 'Take care of your pet! 🐾';
    }
  };

  const levelTitle = getLevelTitle(level);
  const xpForNextLevel = getXPForLevel(level + 1);
  const xpProgress = xpForNextLevel > 0 ? (xp / xpForNextLevel) * 100 : 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <StatusBar barStyle="dark-content" backgroundColor={getBackgroundColor()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with level info */}
        <View style={styles.header}>
          <View style={styles.levelContainer}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelNumber}>{level}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>{levelTitle}</Text>
              <Text style={styles.xpText}>
                {xp} / {xpForNextLevel} XP
              </Text>
            </View>
          </View>
          <Text style={styles.welcomeMessage}>{getWelcomeMessage()}</Text>
        </View>

        {/* Pet display */}
        <View style={styles.petSection}>
          <Pet
            mood={mood}
            triggerBounce={bounceTrigger}
            onBounceComplete={handleBounceComplete}
          />
          <ParticleEffect
            visible={particleVisible}
            type={particleType}
            onComplete={handleParticleComplete}
          />
        </View>

        {/* Stats section */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <StatBar
              value={stats.hunger}
              label="Hunger"
              icon="🍖"
              testID="hunger-stat"
            />
            <StatBar
              value={stats.energy}
              label="Energy"
              icon="⚡"
              testID="energy-stat"
            />
            <StatBar
              value={stats.happiness}
              label="Happiness"
              icon="❤️"
              testID="happiness-stat"
            />
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionsSection}>
          <View style={styles.actionsRow}>
            <ActionButton
              label="Feed"
              icon="🍖"
              onPress={handleFeed}
              disabled={isSleeping || stats.hunger >= 100}
              color="#4CAF50"
              testID="feed-button"
            />
            <ActionButton
              label="Play"
              icon="🎾"
              onPress={handlePlay}
              disabled={isSleeping || stats.energy < 10 || stats.hunger < 10}
              color="#FF9800"
              testID="play-button"
            />
          </View>
          <View style={styles.sleepRow}>
            <ActionButton
              label={isSleeping ? 'Wake Up' : 'Sleep'}
              icon={isSleeping ? '☀️' : '🌙'}
              onPress={handleSleepToggle}
              color={isSleeping ? '#FFC107' : '#673AB7'}
              testID="sleep-button"
            />
          </View>
        </View>

        {/* Info card */}
        {mood === PetMood.CRITICAL && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>⚠️ Needs Attention!</Text>
            <Text style={styles.infoText}>
              {stats.hunger < 30 && 'Your pet is hungry! Feed them. '}
              {stats.energy < 30 && 'Your pet is tired! Let them sleep. '}
              {stats.happiness < 30 && 'Your pet is sad! Play with them. '}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  levelBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  levelInfo: {
    alignItems: 'flex-start',
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  xpText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  welcomeMessage: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  petSection: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    marginBottom: 20,
  },
  statsSection: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  actionsSection: {
    gap: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  sleepRow: {
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C62828',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#D32F2F',
    lineHeight: 20,
  },
});
