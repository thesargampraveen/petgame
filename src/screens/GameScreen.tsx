/**
 * GameScreen Component
 * A fun mini-game where you catch falling treats
 * Features:
 * - Pet moves left/right to catch treats
 * - Score tracking
 * - Combo system for consecutive catches
 * - Returns to home screen with XP bonus
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import Svg, { Circle, Ellipse, Path, G } from 'react-native-svg';
import { PetMood } from '../types';
import { COLORS } from '../utils/constants';

interface FallingItem {
  id: number;
  x: number;
  y: number;
  type: 'treat' | 'star' | 'bonus';
  speed: number;
}

interface GameScreenProps {
  onGameEnd: (score: number) => void;
}

const GAME_DURATION = 30; // 30 seconds per game
const SPAWN_RATE = 800; // New item every 800ms

export const GameScreen: React.FC<GameScreenProps> = ({ onGameEnd }) => {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [petX, setPetX] = useState(150); // Pet horizontal position
  const [gameOver, setGameOver] = useState(false);

  const animationRef = useRef<number>();
  const spawnTimeoutRef = useRef<NodeJS.Timeout>();
  const itemIdCounter = useRef(0);

  // Pet dimensions for collision detection
  const PET_WIDTH = 100;
  const PET_HEIGHT = 100;
  const ITEM_SIZE = 40;
  const SCREEN_WIDTH = 350; // Approximate screen width

  /**
   * Spawn a new falling item
   */
  const spawnItem = useCallback(() => {
    const newItem: FallingItem = {
      id: itemIdCounter.current++,
      x: Math.random() * (SCREEN_WIDTH - ITEM_SIZE),
      y: -ITEM_SIZE,
      type: Math.random() > 0.8 ? 'bonus' : Math.random() > 0.5 ? 'star' : 'treat',
      speed: 2 + Math.random() * 3, // Random speed between 2 and 5
    };
    setItems((prev) => [...prev, newItem]);
  }, []);

  /**
   * Game loop - update item positions and check collisions
   */
  const gameLoop = useCallback(() => {
    setItems((prevItems) => {
      const updatedItems = prevItems.map((item) => ({
        ...item,
        y: item.y + item.speed,
      }));

      // Check for collisions with pet
      let newScore = score;
      let newCombo = combo;

      updatedItems.forEach((item) => {
        // Simple collision detection
        const petCenter = petX + PET_WIDTH / 2;
        const itemCenter = item.x + ITEM_SIZE / 2;

        // Check if item is at pet's height and horizontally aligned
        if (
          item.y > 180 && item.y < 280 &&
          Math.abs(petCenter - itemCenter) < PET_WIDTH / 2 + ITEM_SIZE / 2
        ) {
          // Caught!
          const points = item.type === 'bonus' ? 50 : item.type === 'star' ? 20 : 10;
          newCombo += 1;
          const comboBonus = Math.floor(newCombo / 5) * 5; // Bonus every 5 combo
          newScore += points + comboBonus;

          // Remove caught item by filtering it out
          const filtered = updatedItems.filter((i) => i.id !== item.id);

          setScore(newScore);
          setCombo(newCombo);
          return filtered;
        }
      });

      // Remove items that fell off screen
      const itemsOnScreen = updatedItems.filter((item) => item.y < 600);

      // Reset combo if item falls without catching
      if (itemsOnScreen.length < updatedItems.length && newCombo > 0) {
        setCombo(0);
      }

      return itemsOnScreen;
    });
  }, [petX, score, combo]);

  /**
   * Handle touch/move to control pet position
   */
  const handleTouchMove = useCallback((event: any) => {
    const touchX = event.nativeEvent.locationX;
    const constrainedX = Math.max(0, Math.min(SCREEN_WIDTH - PET_WIDTH, touchX - PET_WIDTH / 2));
    setPetX(constrainedX);
  }, []);

  /**
   * End game and return to home screen
   */
  const handleEndGame = useCallback(() => {
    setGameOver(true);
    if (spawnTimeoutRef.current) {
      clearTimeout(spawnTimeoutRef.current);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Return score after a delay
    setTimeout(() => {
      onGameEnd(score);
    }, 1500);
  }, [score, onGameEnd]);

  /**
   * Set up game timer
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleEndGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleEndGame]);

  /**
   * Set up item spawning
   */
  useEffect(() => {
    if (!gameOver) {
      spawnTimeoutRef.current = setInterval(() => {
        spawnItem();
      }, SPAWN_RATE);

      return () => {
        if (spawnTimeoutRef.current) {
          clearInterval(spawnTimeoutRef.current);
        }
      };
    }
  }, [spawnItem, gameOver]);

  /**
   * Set up game animation loop
   */
  useEffect(() => {
    if (!gameOver) {
      const animate = () => {
        gameLoop();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [gameLoop, gameOver]);

  /**
   * Render a falling item
   */
  const renderItem = (item: FallingItem) => {
    const scaleValue = 1;

    if (item.type === 'treat') {
      return (
        <Svg key={item.id} width={ITEM_SIZE} height={ITEM_SIZE} viewBox="0 0 40 40">
          <Ellipse cx="20" cy="20" rx="12" ry="8" fill="#8B4513" />
          <Circle cx="8" cy="20" r="4" fill="#F5DEB3" />
          <Circle cx="32" cy="20" r="4" fill="#F5DEB3" />
        </Svg>
      );
    } else if (item.type === 'star') {
      return (
        <Svg key={item.id} width={ITEM_SIZE} height={ITEM_SIZE} viewBox="0 0 40 40">
          <Path
            d="M20 5 L25 15 L35 15 L27 22 L30 32 L20 25 L10 32 L13 22 L5 15 L15 15 Z"
            fill="#FFD700"
          />
        </Svg>
      );
    } else {
      // Bonus item - heart
      return (
        <Svg key={item.id} width={ITEM_SIZE} height={ITEM_SIZE} viewBox="0 0 40 40">
          <Path
            d="M20 30 C20 30, 5 20, 5 12 C5 8, 8 5, 12 5 C16 5, 20 10, 20 10 C20 10, 24 5, 28 5 C32 5, 35 8, 35 12 C35 20, 20 30, 20 30 Z"
            fill="#FF6B6B"
          />
        </Svg>
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#87CEEB" />

      {/* Game background - sky */}
      <View style={styles.skyBackground}>
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          {/* Sun */}
          <Circle cx="300" cy="50" r="30" fill="#FFD700" opacity={0.8} />

          {/* Clouds */}
          <G opacity={0.9}>
            <Ellipse cx="100" cy="40" rx="40" ry="20" fill="#FFFFFF" />
            <Ellipse cx="80" cy="35" rx="25" ry="18" fill="#FFFFFF" />
            <Ellipse cx="120" cy="38" rx="25" ry="16" fill="#FFFFFF" />
          </G>
          <G opacity={0.7}>
            <Ellipse cx="250" cy="80" rx="35" ry="18" fill="#FFFFFF" />
            <Ellipse cx="235" cy="75" rx="20" ry="15" fill="#FFFFFF" />
            <Ellipse cx="265" cy="76" rx="20" ry="14" fill="#FFFFFF" />
          </G>
        </Svg>
      </View>

      {/* Header with score */}
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>

        <View style={styles.timerContainer}>
          <Text style={styles.timerValue}>{timeLeft}s</Text>
        </View>

        <View style={styles.comboContainer}>
          <Text style={styles.comboLabel}>Combo</Text>
          <Text style={styles.comboValue}>x{combo}</Text>
        </View>
      </View>

      {/* Game area */}
      <View
        style={styles.gameArea}
        onTouchMove={handleTouchMove}
      >
        {/* Falling items */}
        {items.map((item) => (
          <View
            key={item.id}
            style={[
              styles.itemContainer,
              {
                left: item.x,
                top: item.y,
              },
            ]}
          >
            {renderItem(item)}
          </View>
        ))}

        {/* Pet at bottom */}
        <Animated.View
          style={[
            styles.petContainer,
            {
              left: petX,
            },
          ]}
        >
          <Svg width={PET_WIDTH} height={PET_HEIGHT} viewBox="0 0 100 100">
            {/* Shadow */}
            <Ellipse cx="50" cy="95" rx="30" ry="5" fill="#000000" opacity={0.2} />

            {/* Body */}
            <Circle cx="50" cy="50" r="35" fill="#FFD54F" />

            {/* Belly */}
            <Ellipse cx="50" cy="60" rx="20" ry="15" fill="#FFFFFF" opacity={0.3} />

            {/* Happy face */}
            <Path
              d="M35 40 Q40 35 45 40"
              stroke="#2D2D2D"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M55 40 Q60 35 65 40"
              stroke="#2D2D2D"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M40 55 Q50 65 60 55"
              stroke="#2D2D2D"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />

            {/* Rosy cheeks */}
            <Circle cx="32" cy="48" r="4" fill="#FFB6C1" opacity={0.6} />
            <Circle cx="68" cy="48" r="4" fill="#FFB6C1" opacity={0.6} />

            {/* Ears */}
            <Ellipse cx="25" cy="30" rx="12" ry="18" fill="#FFD54F" />
            <Ellipse cx="25" cy="30" rx="7" ry="12" fill="#FFF9C4" opacity={0.5} />
            <Ellipse cx="75" cy="30" rx="12" ry="18" fill="#FFD54F" />
            <Ellipse cx="75" cy="30" rx="7" ry="12" fill="#FFF9C4" opacity={0.5} />
          </Svg>
        </Animated.View>

        {/* Ground */}
        <View style={styles.ground}>
          <View style={styles.grass} />
        </View>
      </View>

      {/* Game over overlay */}
      {gameOver && (
        <View style={styles.gameOverOverlay}>
          <View style={styles.gameOverCard}>
            <Text style={styles.gameOverTitle}>🎉 Time's Up!</Text>
            <Text style={styles.finalScoreLabel}>Final Score</Text>
            <Text style={styles.finalScoreValue}>{score}</Text>
            <Text style={styles.xpBonusText}>+{Math.floor(score / 10)} XP Bonus!</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
  },
  skyBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 16,
    marginTop: 200,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  timerContainer: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  comboContainer: {
    alignItems: 'center',
  },
  comboLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600',
  },
  comboValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  gameArea: {
    flex: 1,
    marginTop: 20,
  },
  itemContainer: {
    position: 'absolute',
    width: ITEM_SIZE,
    height: ITEM_SIZE,
  },
  petContainer: {
    position: 'absolute',
    bottom: 100,
    width: PET_WIDTH,
    height: PET_HEIGHT,
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  grass: {
    flex: 1,
    backgroundColor: '#8BC34A',
    borderTopWidth: 8,
    borderTopColor: '#689F38',
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gameOverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 16,
  },
  finalScoreLabel: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  finalScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 8,
  },
  xpBonusText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '600',
  },
});

const ITEM_SIZE = 40;
const PET_WIDTH = 100;
const PET_HEIGHT = 100;
