import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export interface ConfettiCannonRef {
  start: () => void;
}

interface ConfettiCannonProps {
  count?: number;
  origin?: { x: number; y: number };
  explosionSpeed?: number;
  fallSpeed?: number;
  fadeOut?: boolean;
}

export const ConfettiCannon = forwardRef<ConfettiCannonRef, ConfettiCannonProps>(
  ({ count = 50, origin = { x: width / 2, y: height / 2 }, explosionSpeed = 350, fallSpeed = 3000, fadeOut = true }, ref) => {
    const confettiRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      start: () => {
        if (Platform.OS === 'web') {
          // Web fallback - create simple confetti effect
          createWebConfetti();
        } else {
          // Native confetti would use react-native-confetti-cannon
          confettiRef.current?.start();
        }
      },
    }));

    const createWebConfetti = () => {
      const colors = ['#32E177', '#3DB5FF', '#F59E0B', '#EF4444', '#8B5CF6'];
      const confettiContainer = document.createElement('div');
      confettiContainer.style.position = 'fixed';
      confettiContainer.style.top = '0';
      confettiContainer.style.left = '0';
      confettiContainer.style.width = '100%';
      confettiContainer.style.height = '100%';
      confettiContainer.style.pointerEvents = 'none';
      confettiContainer.style.zIndex = '9999';
      document.body.appendChild(confettiContainer);

      for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = `${origin.x}px`;
        confetti.style.top = `${origin.y}px`;
        confetti.style.borderRadius = '50%';
        confetti.style.transform = 'scale(0)';
        confetti.style.transition = 'all 3s ease-out';
        confettiContainer.appendChild(confetti);

        // Animate confetti
        setTimeout(() => {
          const angle = Math.random() * 2 * Math.PI;
          const distance = Math.random() * 300 + 100;
          const x = Math.cos(angle) * distance + Math.random() * 200;
          const y = Math.sin(angle) * distance + Math.random() * 600;
          confetti.style.transform = `translate(${x}px, ${y}px) scale(1.2) rotate(${Math.random() * 720}deg)`;
          confetti.style.transition = 'all 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          confetti.style.zIndex = '10000';

          // Clean up after animation
          setTimeout(() => {
            if (document.body.contains(confettiContainer)) {
              document.body.removeChild(confettiContainer);
            }
          }, 3000);
        }, 0);
      }
    };

    return (
      <View style={styles.container}>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
});

ConfettiCannon.displayName = 'ConfettiCannon';