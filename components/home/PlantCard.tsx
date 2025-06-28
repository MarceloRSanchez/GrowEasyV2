import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Dimensions, AppState, ActivityIndicator,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring, runOnJS,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing } from '@/constants/Colors';
import { ConfettiCannon, ConfettiCannonRef } from '@/components/ui/ConfettiCannon';
import { Toast } from '@/components/ui/Toast';
import { useLogWatering } from '@/hooks/useLogWatering';
import { useLogFertilizing } from '@/hooks/useLogFertilizing';
import { useLogHarvest } from '@/hooks/useLogHarvest';
import { useToast } from '@/hooks/useToast';
import { Droplets, Zap, Scissors, ChevronRight } from 'lucide-react-native';

const ACTION_WIDTH = 240;
const SWIPE_THRESHOLD = 80;
const SPRING = { damping: 20, stiffness: 300, mass: 0.5 };

interface PlantCardProps {
  id: string;
  photoUrl: string;
  name: string;
  species: string;
  progressPct: number;
  nextActionLabel: string;
  nextActionColor: string;
  onPress: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export function PlantCard(props: PlantCardProps) {
  const {
    id, photoUrl, name, species,
    progressPct, nextActionLabel, nextActionColor,
    onPress, showToast: externalToast,
  } = props;

  /* ───────── state & refs ───────── */
  const translateX = useSharedValue(0);
  const [isOpen, setIsOpen] = React.useState(false);
  const [showOverlay, setShowOverlay] = React.useState(false);
  const [loadingAction, setLoading] = React.useState<string | null>(null);

  const startX = useSharedValue(0);        // contexto del gesto
  const confettiRef = useRef<ConfettiCannonRef>(null);

  const logWatering = useLogWatering();
  const logFertilizing = useLogFertilizing();
  const logHarvest = useLogHarvest();
  const { toast, showToast, hideToast } = useToast();
  const pushToast = externalToast ?? showToast;

  /* ───────── helpers ───────── */
  const openCard = () => {
    translateX.value = withSpring(-ACTION_WIDTH, SPRING);
    setIsOpen(true);
    setShowOverlay(true);
  };

  const closeCard = () => {
    translateX.value = withSpring(0, SPRING);
    setIsOpen(false);
    setShowOverlay(false);
  };

  const getIcon = (l: string, c: string) => {
    l = l.toLowerCase();
    if (l.includes('water')) return <Droplets size={16} color={c} />;
    if (l.includes('fertilize')) return <Zap size={16} color={c} />;
    if (l.includes('harvest')) return <Scissors size={16} color={c} />;
    return null;
  };

  /* ───────── pan gesture ───────── */
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onStart(() => { startX.value = translateX.value; })
    .onUpdate((e) => {
      'worklet';
      const nx = Math.max(Math.min(startX.value + e.translationX, 0), -ACTION_WIDTH);
      translateX.value = nx;
    })
    .onEnd((e) => {
      'worklet';
      const x = translateX.value;
      const v = e.velocityX;

      const open = v < -500 || x < -ACTION_WIDTH / 2;
      const close = v > 500 || x > -ACTION_WIDTH / 2;

      if (open) runOnJS(openCard)();
      else if (close) runOnJS(closeCard)();
      else {
        const snap = x < -ACTION_WIDTH / 2 ? -ACTION_WIDTH : 0;
        translateX.value = withSpring(snap, SPRING);
        snap === 0 ? runOnJS(closeCard)() : runOnJS(openCard)();
      }
    });

  /* ───────── tap sobre la tarjeta ───────── */
  const handleCardPress = () => (isOpen ? closeCard() : onPress());

  /* ───────── cerrar al background ───────── */
  useEffect(() => {
    const sub = AppState.addEventListener('change', s => s !== 'active' && closeCard());
    return () => sub.remove();
  }, []);

  /* ───────── anim style ───────── */
  const cardAnim = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  /* ───────── render ───────── */
  return (
    <View style={styles.container}>
      {/* overlay que cierra la card – NO cubre la franja de botones */}
      {showOverlay && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeCard} />
      )}

      {/* botones */}
      <View style={styles.actionContainer}>
        {/* Water */}
        <TouchableOpacity
          style={[styles.actionButton, styles.first, { backgroundColor: '#4A90E2' }]}
          disabled={!!loadingAction}
          onPress={() => {
            if (loadingAction) return;
            setLoading('water'); closeCard();
            logWatering.mutate(
              { userPlantId: id },
              {
                onSuccess: () => { confettiRef.current?.start(); pushToast('Well watered! 💧', 'success'); },
                onError: () => pushToast('Error watering', 'error'),
                onSettled: () => setLoading(null)
              }
            );
          }}
        >
          {loadingAction === 'water'
            ? <ActivityIndicator color={Colors.white} />
            : <Droplets size={16} color={Colors.white} />}
          <Text style={styles.actionText}>Water</Text>
        </TouchableOpacity>

        {/* Fertilize */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#7ED321' }]}
          disabled={!!loadingAction}
          onPress={() => {
            if (loadingAction) return;
            setLoading('fertilize'); closeCard();
            logFertilizing.mutate(
              { userPlantId: id },
              {
                onSuccess: () => { confettiRef.current?.start(); pushToast('Fertilized! 🌱', 'success'); },
                onError: () => pushToast('Error fertilizing', 'error'),
                onSettled: () => setLoading(null)
              }
            );
          }}
        >
          {loadingAction === 'fertilize'
            ? <ActivityIndicator color={Colors.white} />
            : <Zap size={16} color={Colors.white} />}
          <Text style={styles.actionText}>Fertilize</Text>
        </TouchableOpacity>

        {/* Harvest */}
        <TouchableOpacity
          style={[styles.actionButton, styles.last, { backgroundColor: '#F5A623' }]}
          disabled={!!loadingAction}
          onPress={() => {
            if (loadingAction) return;
            setLoading('harvest'); closeCard();
            logHarvest.mutate(
              { userPlantId: id },
              {
                onSuccess: () => { confettiRef.current?.start(); pushToast('Harvested! 🎉', 'success'); },
                onError: () => pushToast('Error harvesting', 'error'),
                onSettled: () => setLoading(null)
              }
            );
          }}
        >
          {loadingAction === 'harvest'
            ? <ActivityIndicator color={Colors.white} />
            : <Scissors size={16} color={Colors.white} />}
          <Text style={styles.actionText}>Harvest</Text>
        </TouchableOpacity>
      </View>

      {/* tarjeta */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardAnim]}>
          <TouchableOpacity style={styles.cardTouchable} activeOpacity={0.9} onPress={handleCardPress}>
            <Image source={{ uri: photoUrl }} style={styles.plantImage} />
            <View style={styles.plantInfo}>
              <Text style={styles.plantName} numberOfLines={1}>{name}</Text>
              <Text style={styles.plantSpecies} numberOfLines={1}>{species}</Text>
              <View style={styles.middleRow}>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressPercent}>{progressPct}%</Text>
                </View>
                <View style={[styles.nextActionChip, { backgroundColor: `${nextActionColor}30` }]}>
                  {getIcon(nextActionLabel, nextActionColor)}
                  <Text style={[styles.nextActionText, { color: nextActionColor }]} numberOfLines={1}>
                    {nextActionLabel}
                  </Text>
                </View>
                <ChevronRight size={16} color={Colors.textMuted} />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>

      <ConfettiCannon ref={confettiRef} />
      {!externalToast && (
        <Toast message={toast.message} type={toast.type} visible={toast.visible} onHide={hideToast} />
      )}
    </View>
  );
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  container: { marginHorizontal: Spacing.md, marginBottom: Spacing.md, height: 110, position: 'relative' },

  /* overlay sólo para cerrar – NO cubre botones */
  overlay: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: ACTION_WIDTH,
    backgroundColor: 'transparent', zIndex: 1,
  },

  /* botones */
  actionContainer: {
    position: 'absolute', right: 0, top: 0, bottom: 0, width: ACTION_WIDTH,
    flexDirection: 'row', zIndex: 2,
  },
  actionButton: { flex: 1, height: '100%', justifyContent: 'center', alignItems: 'center', marginRight: 4 },
  first: { borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  last: { borderTopRightRadius: 12, borderBottomRightRadius: 12, marginRight: 8 },
  actionText: { ...Typography.caption, color: Colors.white, fontWeight: '600', fontSize: 11, marginTop: 4 },

  /* tarjeta */
  card: {
    flex: 1, flexDirection: 'row', borderRadius: 12, backgroundColor: Colors.white,
    shadowColor: 'rgba(0,0,0,0.1)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4,
    elevation: 3, zIndex: 3,       // encima del overlay y botones
  },
  cardTouchable: { flex: 1, flexDirection: 'row' },
  plantImage: { width: 90, height: 110, resizeMode: 'cover', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  plantInfo: { flex: 1, paddingHorizontal: Spacing.md, justifyContent: 'center' },
  plantName: { ...Typography.body, color: Colors.textPrimary, fontWeight: '600' },
  plantSpecies: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: 4 },
  middleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressCircle: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: `${Colors.primary}30`,
    justifyContent: 'center', alignItems: 'center', backgroundColor: `${Colors.primary}10`,
  },
  progressPercent: { ...Typography.caption, color: Colors.primary, fontWeight: '600', fontSize: 10 },
  nextActionChip: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderRadius: 10, flex: 1, marginLeft: 8,
  },
  nextActionText: { ...Typography.bodySmall, fontWeight: '600', marginLeft: 4 },
});