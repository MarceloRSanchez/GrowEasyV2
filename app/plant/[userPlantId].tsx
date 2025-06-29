import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  ScrollView as RNScrollView,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ErrorToast } from '@/components/ui/ErrorToast';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { WaterHistoryChart } from '@/components/charts/WaterHistoryChart';
import { SunExposureChart } from '@/components/charts/SunExposureChart';
import { SoilHumidityDial } from '@/components/charts/SoilHumidityDial';
import { usePlantDetail } from '@/hooks/usePlantDetail';
import { useLogWatering } from '@/hooks/useLogWatering';
import { useLogFertilizing } from '@/hooks/useLogFertilizing';
import { useLogHarvest } from '@/hooks/useLogHarvest';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { speak, unloadSound } from '@/lib/tts';
import { ConfettiCannon, ConfettiCannonRef } from '@/components/ui/ConfettiCannon';
import { Toast } from '@/components/ui/Toast';
import {
  ArrowLeft,
  Droplets,
  Zap,
  Scissors,
  Clock,
  Play,
  Camera,
  Archive,
  ChevronDown,
  ChevronUp,
  Flame,
  X,
} from 'lucide-react-native';
import { ActionButton } from '@/components/quickActions/ActionButton';
// ==== CONSTANTS  ============================================================
const HEADER_HEIGHT = 320;
const ACTION_BAR_H = 72;

// ==== MAIN COMPONENT  =======================================================
export default function PlantDetailScreen() {
  /*  ---------------- hooks / queries ----------------  */
  const { userPlantId } = useLocalSearchParams<{ userPlantId: string }>();
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = usePlantDetail(
    userPlantId!,
    user?.id,
  );
  const logWatering = useLogWatering();
  const logFertilizing = useLogFertilizing();
  const logHarvest = useLogHarvest();
  const { toast, showToast, hideToast } = useToast();

  /*  ---------------- local state ----------------  */
  const confettiRef = useRef<ConfettiCannonRef>(null);
  const [showError, setShowError] = useState(true);
  const [showDanger, setShowDanger] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  /*  ---------------- scroll animation ----------------  */
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const headerImgAnim = useAnimatedStyle(() => ({
    transform: [{ translateY: -scrollY.value * 0.5 }],
  }));

  const stickyNavAnim = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 200], [0, 1], 'clamp'),
  }));

  const actionBarAnim = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.max(-scrollY.value, 0) }],
  }));

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      unloadSound();
    };
  }, []);

  /*  ---------------- loading / error ----------------  */
  if (error && !data) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderBackOnly />
        {showError && (
          <ErrorToast
            message={error}
            onRetry={refetch}
            onDismiss={() => setShowError(false)}
          />
        )}
      </SafeAreaView>
    );
  }

  if (isLoading || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <PlantDetailSkeleton />
      </SafeAreaView>
    );
  }

  /*  ---------------- derived ----------------  */
  const plant = data.plant;
  const daysSinceSow = Math.floor(
    (Date.now() - new Date(plant.sow_date).getTime()) / 86_400_000,
  );
  const isArchived = !plant.is_active;

  /*  ---------------- handlers ----------------  */
  const handleCare = (type: 'water' | 'fertilize' | 'harvest') => {
    confettiRef.current?.start();
    const mutationMap = {
      water: logWatering,
      fertilize: logFertilizing,
      harvest: logHarvest,
    } as const;

    mutationMap[type].mutate(
      { userPlantId: userPlantId! },
      {
        onSuccess: () => showToast(`${type} done!`, 'success'),
        onError: () => showToast('Something went wrong', 'error'),
      },
    );
  };

  // voice guide
  const playVoice = async () => {
    if (isPlaying) {
      await unloadSound();
      setIsPlaying(false);
      return;
    }
    
    setIsPlaying(true);
    try {
      const tipsText = plant.plant.tips.join('. ');
      const voiceText = `Here are care tips for ${plant.nickname}. ${tipsText}`;
      
      const handle = await speak(voiceText);

      // Native (Expo) — use Expo Sound callbacks
      if ('setOnPlaybackStatusUpdate' in handle) {
        (handle as any).setOnPlaybackStatusUpdate((status: any) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      } else {
        // Web — HTMLAudioElement
        (handle as HTMLAudioElement).onended = () => setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error playing voice guide:', error);
      setIsPlaying(false);
      showToast('Failed to play voice guide', 'error');
    }
  };

  /*  ---------------- render ----------------  */
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrap}>
        <Animated.Image
          source={{ uri: plant.plant.image_url }}
          style={[styles.headerImg, headerImgAnim]}
          blurRadius={4}
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", 'transparent', 'rgba(0,0,0,0.6)']}
          style={styles.headerOverlay}
        />
        <HeaderBackOnly light />
        <View style={styles.headerContent}>
          <View style={styles.growthRing}>
            <Text style={styles.growthPct}>{plant.growth_percent}%</Text>
          </View>
          <Text style={styles.plantName}>{plant.nickname}</Text>
          <Text style={styles.plantSpecies}>{plant.plant.scientific_name}</Text>
          <Text style={styles.days}>{daysSinceSow} days since sowing</Text>
        </View>
      </View>

      {/* STICKY NAV TITLE */}
      <Animated.View style={[styles.stickyNav, stickyNavAnim]}>
        <HeaderBackOnly />
        <Text style={styles.stickyTitle}>{plant.nickname}</Text>
      </Animated.View>

      {/* SCROLL CONTENT */}
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + ACTION_BAR_H + Spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* ACTION BAR */}
        <Animated.View style={[styles.actionBar, actionBarAnim]}>
          <ActionButton
            type="water"
            onPress={() => handleCare('water')}
            disabled={isLoading}
            loading={false}
          />
          <ActionButton
            type="fertilize"
            onPress={() => handleCare('fertilize')}
            disabled={isLoading}
            loading={false}
          />
          <ActionButton
            type="harvest"
            onPress={() => handleCare('harvest')}
            disabled={isLoading}
            loading={false}
          />
        </Animated.View>

        {/* Timeline */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Care Timeline</Text>
          {plant.next_actions
            ?.slice()
            .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
            .map((a) => (
              <TimelineItem
                key={a.type}
                icon={getActionIcon(a.type)}
                label={a.label}
                dueDate={a.due_date}
                status={a.status}
              />
            ))}
        </Card>

        {/* Voice guide */}
        <Card style={styles.sectionCard}>
          <View style={styles.voiceHeader}>
            <Text style={styles.sectionTitle}>Voice Guide</Text>
            <TouchableOpacity 
              style={[styles.playBtn, isPlaying && styles.playingBtn]} 
              onPress={playVoice}
              accessibilityLabel={isPlaying ? "Stop voice guide" : "Play voice guide"}
              accessibilityHint={isPlaying ? "Stop the currently playing voice guide" : "Listen to care tips for this plant"}
              accessibilityRole="button"
            >
              {isPlaying ? (
                <X size={20} color="#fff" />
              ) : (
                <Play size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.voiceText}>
            "Hi! Your {plant.nickname.toLowerCase()} is at {plant.growth_percent}% growth. {getVoiceGuideText(plant)}"
          </Text>
        </Card>

        {/* Analytics */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Growth Analytics</Text>
          <WaterHistoryChart data={data.analytics.waterHistory} loading={isLoading} error={!!error} />
          <SunExposureChart data={data.analytics.sunExposure} loading={isLoading} error={!!error} />
          <SoilHumidityDial humidity={data.analytics.soilHumidity} loading={isLoading} error={!!error} />
        </Card>

        {/* Danger Zone collapsible */}
        <Card style={styles.sectionCard}>
          <TouchableOpacity style={styles.dangerHeader} onPress={() => setShowDanger((s) => !s)}>
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            {showDanger ? <ChevronUp size={20} color={Colors.error} /> : <ChevronDown size={20} color={Colors.error} />}
          </TouchableOpacity>
          {showDanger && (
            <Button
              title="Archive Plant"
              onPress={() => Alert.alert('Archive', 'Not implemented')}
              variant="outline"
              style={{ borderColor: Colors.error }}
              textStyle={{ color: Colors.error }}
            />
          )}
        </Card>

        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* ARCHIVED OVERLAY */}
      {isArchived && (
        <View style={styles.archivedOverlay}>
          <Archive size={24} color="#fff" />
          <Text style={styles.archivedText}>Archived</Text>
        </View>
      )}

      <ConfettiCannon ref={confettiRef} />
      <Toast message={toast.message} type={toast.type} visible={toast.visible} onHide={hideToast} />
    </View>
  );
}

// ==== SUB‑COMPONENTS  =======================================================
const HeaderBackOnly = ({ light = false }: { light?: boolean }) => (
  <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
    <ArrowLeft size={24} color={light ? '#fff' : Colors.textPrimary} />
  </TouchableOpacity>
);

const TimelineItem = ({ icon, label, dueDate, status }: any) => {
  const colorMap = { overdue: Colors.error, upcoming: Colors.warning, scheduled: Colors.textMuted } as const;
  const color = colorMap[status];
  return (
    <View style={styles.timelineItem}>
      <View style={[styles.timelineDot, { backgroundColor: color }]} />
      <View style={styles.timelineIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.timelineLabel}>{label}</Text>
        <Text style={[styles.timelineDate, { color }]}>{new Date(dueDate).toLocaleDateString()}</Text>
      </View>
    </View>
  );
};

function PlantDetailSkeleton() {
  return (
    <View style={styles.container}>
      <LoadingSkeleton width="100%" height={HEADER_HEIGHT} />
    </View>
  );
}

// ==== HELPERS  ==============================================================
function getActionIcon(type: string) {
  switch (type) {
    case 'water':
      return <Droplets size={20} color={Colors.accent} />;
    case 'fertilize':
      return <Zap size={20} color={Colors.warning} />;
    case 'harvest':
      return <Scissors size={20} color={Colors.success} />;
    default:
      return <Clock size={20} color={Colors.textMuted} />;
  }
}

function getVoiceGuideText(plant: any) {
  return 'Keep the soil moist and provide indirect sunlight.';
}

// ==== STYLES  ===============================================================
const styles = StyleSheet.create({
  /* container & header */
  container: { flex: 1, backgroundColor: Colors.bgLight },
  headerWrap: { position: 'absolute', top: 0, left: 0, right: 0, height: HEADER_HEIGHT },
  headerImg: { width: '100%', height: '100%' },
  headerOverlay: { ...StyleSheet.absoluteFillObject },
  headerContent: {
    position: 'absolute',
    bottom: ACTION_BAR_H + 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  growthRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  growthPct: { ...Typography.h3, color: Colors.primary, fontWeight: '700' },
  plantName: { ...Typography.h2, color: '#fff', marginTop: Spacing.sm },
  plantSpecies: { ...Typography.body, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' },
  days: { ...Typography.bodySmall, color: 'rgba(255,255,255,0.8)' },
  backBtn: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  /* sticky nav */
  stickyNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#fff',
    zIndex: 2,
    shadowColor: Colors.shadowColor,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  stickyTitle: { ...Typography.h3, color: Colors.textPrimary, marginLeft: Spacing.md },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  /* action bar */
  actionBar: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    height: ACTION_BAR_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    backgroundColor: 'transparent',
    zIndex: 2,
    shadowColor: Colors.shadowColor,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    paddingBottom: 10,
  },
  actionBtn: { flex: 1, height: '100%', borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 4 },
  firstBtn: { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 },
  lastBtn: { borderTopRightRadius: 20, borderBottomRightRadius: 20 },
  actionBtnText: { ...Typography.bodySmall, color: '#fff', fontWeight: '600' },

  /* cards & sections */
  sectionCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.lg },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: Spacing.md },

  /* timeline */
  timelineItem: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  timelineDot: { width: 6, height: 6, borderRadius: 3, marginRight: Spacing.sm },
  timelineIcon: { width: 40, alignItems: 'center' },
  timelineLabel: { ...Typography.body, color: Colors.textPrimary, fontWeight: '600' },
  timelineDate: { ...Typography.bodySmall },

  /* voice guide */
  voiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  playBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  playingBtn: { backgroundColor: Colors.error },
  voiceText: { ...Typography.body, color: Colors.textSecondary, lineHeight: 24, fontStyle: 'italic' },

  /* danger zone */
  dangerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dangerTitle: { ...Typography.body, color: Colors.error, fontWeight: '600' },

  /* archived overlay */
  archivedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  archivedText: { ...Typography.body, color: '#fff', marginLeft: Spacing.sm, fontWeight: '600' },
  /* botones */
  actionContainer: {
    position: 'absolute', right: 0, top: 0, bottom: 0, width: 100,
    flexDirection: 'row', zIndex: 2,
  },
  actionButton: { flex: 1, height: '100%', justifyContent: 'center', alignItems: 'center', marginRight: 4 },
  first: { borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  last: { borderTopRightRadius: 12, borderBottomRightRadius: 12, marginRight: 8 },
  actionText: { ...Typography.caption, color: Colors.white, fontWeight: '600', fontSize: 11, marginTop: 4 },
});