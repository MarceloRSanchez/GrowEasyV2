import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorToast } from '@/components/ui/ErrorToast';
import { usePlantDetail } from '@/hooks/usePlantDetail';
import { useLogWatering } from '@/hooks/useLogWatering';
import { useLogFertilizing } from '@/hooks/useLogFertilizing';
import { useLogHarvest } from '@/hooks/useLogHarvest';
import { useToast } from '@/hooks/useToast';
import { ConfettiCannon, ConfettiCannonRef } from '@/components/ui/ConfettiCannon';
import { Toast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { WaterHistoryChart } from '@/components/charts/WaterHistoryChart';
import { SunExposureChart } from '@/components/charts/SunExposureChart';
import { SoilHumidityDial } from '@/components/charts/SoilHumidityDial';
import { 
  ArrowLeft, 
  Droplets, 
  Zap, 
  Scissors, 
  Clock, 
  Play, 
  Camera,
  Archive,
  Trash2,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function PlantDetailScreen() {
  const { userPlantId } = useLocalSearchParams<{ userPlantId: string }>();
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = usePlantDetail(userPlantId!, user?.id);
  const logWatering = useLogWatering();
  const logFertilizing = useLogFertilizing();
  const logHarvest = useLogHarvest();
  const { toast, showToast, hideToast } = useToast();
  const [scrollY, setScrollY] = useState(0);
  const [showError, setShowError] = useState(true);
  const confettiRef = useRef<ConfettiCannonRef>(null);

  // Handle error state
  if (error && !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          {showError && (
            <ErrorToast
              message={error}
              onRetry={refetch}
              onDismiss={() => setShowError(false)}
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Handle loading state
  if (isLoading || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <PlantDetailSkeleton />
      </SafeAreaView>
    );
  }

  const plantData = data.plant;
  
  // Check if plant is archived
  const isArchived = !plantData.is_active;
  
  // Calculate days since sowing
  const daysSinceSow = Math.floor(
    (new Date().getTime() - new Date(plantData.sow_date).getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleCareAction = (actionType: string) => {
    if (!userPlantId) return;

    // Trigger confetti
    confettiRef.current?.start();

    switch (actionType) {
      case 'water':
        logWatering.mutate(
          { userPlantId },
          {
            onSuccess: () => {
              showToast('Well watered! 💧', 'success');
            },
            onError: () => {
              showToast('Something went wrong. Try again?', 'error');
            },
          }
        );
        break;
      case 'fertilize':
        logFertilizing.mutate(
          { userPlantId },
          {
            onSuccess: () => {
              showToast('Plant fertilized! 🌱', 'success');
            },
            onError: () => {
              showToast('Something went wrong. Try again?', 'error');
            },
          }
        );
        break;
      case 'harvest':
        logHarvest.mutate(
          { userPlantId },
          {
            onSuccess: () => {
              showToast('Harvest complete! 🎉', 'success');
            },
            onError: () => {
              showToast('Something went wrong. Try again?', 'error');
            },
          }
        );
        break;
    }
  };

  const handlePlayVoiceGuide = () => {
    Alert.alert('Voice Guide', 'Playing voice guidance...');
  };

  const handleAddNote = () => {
    Alert.alert('Add Note', 'Camera functionality coming soon!');
  };

  const handleArchivePlant = () => {
    Alert.alert(
      'Archive Plant',
      'Are you sure you want to archive this plant?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Archive', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  const handleRetry = () => {
    setShowError(false);
    refetch();
  };

  const headerHeight = 300;
  const parallaxOffset = scrollY * 0.5;
  const headerOpacity = Math.max(0, Math.min(1, scrollY / 200));

  return (
    <View style={styles.container}>
      {/* Collapsing Header */}
      <View style={[styles.header, { height: headerHeight }]}>
        <Image
          source={{ uri: plantData.plant.image_url }}
          style={[
            styles.headerImage,
            { transform: [{ translateY: -parallaxOffset }] }
          ]}
        />
        <View style={styles.headerOverlay} />
        
        {/* Header Controls */}
        <View style={styles.headerControls}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Growth Ring & Info */}
        <View style={styles.headerContent}>
          <View style={styles.growthRing}>
            <View style={styles.growthRingInner}>
              <Text style={styles.growthPercent}>{plantData.growth_percent}%</Text>
            </View>
          </View>
          <Text style={styles.plantName}>{plantData.nickname}</Text>
          <Text style={styles.plantSpecies}>{plantData.plant.scientific_name}</Text>
          <Text style={styles.daysSinceSow}>{daysSinceSow} days since sowing</Text>
        </View>
      </View>

      {/* Sticky Navigation Bar (appears on scroll) */}
      <View style={[styles.stickyNav, { opacity: headerOpacity }]}>
        <TouchableOpacity style={styles.stickyBackButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.stickyTitle}>{plantData.nickname}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: headerHeight - 100 }} />

        {/* Sticky Action Bar */}
        <View style={styles.actionBar}>
          <ActionButton
            type="water"
            onPress={() => handleCareAction('water')}
          />
          <ActionButton
            type="fertilize"
            onPress={() => handleCareAction('fertilize')}
          />
          <ActionButton
            type="harvest"
            onPress={() => handleCareAction('harvest')}
          />
        </View>

        {/* Care Timeline */}
        <Card style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Care Timeline</Text>
          {(plantData.next_actions || []).map((action, index) => (
            <TimelineItem
              key={index}
              icon={getActionIcon(action.type)}
              label={action.label}
              dueDate={action.due_date}
              status={action.status}
            />
          ))}
        </Card>

        {/* Voice Guide Card */}
        <Card style={styles.voiceGuideCard}>
          <View style={styles.voiceGuideHeader}>
            <Text style={styles.sectionTitle}>Voice Guide</Text>
            <TouchableOpacity style={styles.playButton} onPress={handlePlayVoiceGuide}>
              <Play size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.voiceGuideText}>
            "Hi there! Your {plantData.plant.name.toLowerCase()} is looking great at {plantData.growth_percent}% growth. {getVoiceGuideText(plantData)}"
          </Text>
        </Card>

        {/* Growth Analytics */}
        <Card style={styles.analyticsCard}>
          <Text style={styles.sectionTitle}>Growth Analytics</Text>
          
          <WaterHistoryChart
            data={data.analytics.waterHistory}
            loading={isLoading}
            error={!!error}
          />
          
          <SunExposureChart
            data={data.analytics.sunExposure}
            loading={isLoading}
            error={!!error}
          />
          
          <SoilHumidityDial
            humidity={data.analytics.soilHumidity}
            loading={isLoading}
            error={!!error}
          />
        </Card>

        {/* Notes & Photos */}
        <Card style={styles.notesCard}>
          <View style={styles.notesHeader}>
            <Text style={styles.sectionTitle}>Notes & Photos</Text>
            <TouchableOpacity style={styles.addNoteButton} onPress={handleAddNote}>
              <Camera size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.notesGallery}>
            {data.notes.map((note) => (
              <NoteItem
                key={note.id}
                imageUrl={note.imageUrl || 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=400'}
                caption={note.caption}
                createdAt={note.createdAt}
              />
            ))}
          </ScrollView>
        </Card>

        {/* Danger Zone */}
        <Card style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <Button
            title="Archive Plant"
            onPress={handleArchivePlant}
            variant="outline"
            style={[styles.dangerButton, { borderColor: Colors.error }]}
            textStyle={{ color: Colors.error }}
          />
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Archived Plant Overlay */}
      {isArchived && (
        <View style={styles.archivedOverlay}>
          <View style={styles.archivedBadge}>
            <Archive size={20} color={Colors.white} />
            <Text style={styles.archivedText}>Archived Plant</Text>
          </View>
        </View>
      )}

      {/* Confetti Cannon */}
      <ConfettiCannon ref={confettiRef} />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />

      {/* Error Toast */}
      {error && showError && (
        <ErrorToast
          message={error}
          onRetry={handleRetry}
          onDismiss={() => setShowError(false)}
        />
      )}
    </View>
  );
}

// Action Button Component
interface ActionButtonProps {
  type: 'water' | 'fertilize' | 'harvest';
  onPress: () => void;
}

function ActionButton({ type, onPress }: ActionButtonProps) {
  const getButtonConfig = () => {
    switch (type) {
      case 'water':
        return {
          icon: <Droplets size={24} color={Colors.white} />,
          label: 'Water',
          color: Colors.accent,
        };
      case 'fertilize':
        return {
          icon: <Zap size={24} color={Colors.white} />,
          label: 'Fertilize',
          color: Colors.warning,
        };
      case 'harvest':
        return {
          icon: <Scissors size={24} color={Colors.white} />,
          label: 'Harvest',
          color: Colors.success,
        };
    }
  };

  const config = getButtonConfig();

  return (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: config.color }]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={false} // Will be controlled by parent component
    >
      {config.icon}
      <Text style={styles.actionButtonText}>{config.label}</Text>
    </TouchableOpacity>
  );
}

// Timeline Item Component
interface TimelineItemProps {
  icon: React.ReactNode;
  label: string;
  dueDate: string;
  status: 'overdue' | 'upcoming' | 'scheduled';
}

function TimelineItem({ icon, label, dueDate, status }: TimelineItemProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'overdue':
        return Colors.error;
      case 'upcoming':
        return Colors.warning;
      case 'scheduled':
        return Colors.textMuted;
    }
  };

  return (
    <View style={styles.timelineItem}>
      <View style={[styles.timelineIcon, { backgroundColor: `${getStatusColor()}15` }]}>
        {icon}
      </View>
      <View style={styles.timelineContent}>
        <Text style={styles.timelineLabel}>{label}</Text>
        <Text style={[styles.timelineDate, { color: getStatusColor() }]}>
          {new Date(dueDate).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}

// Note Item Component
interface NoteItemProps {
  imageUrl: string;
  caption: string;
  createdAt: string;
}

function NoteItem({ imageUrl, caption, createdAt }: NoteItemProps) {
  return (
    <View style={styles.noteItem}>
      <Image source={{ uri: imageUrl }} style={styles.noteImage} />
      <Text style={styles.noteCaption}>{caption}</Text>
      <Text style={styles.noteDate}>{new Date(createdAt).toLocaleDateString()}</Text>
    </View>
  );
}

// Voice guide text generator
function getVoiceGuideText(plantData: any) {
  const tips = plantData.plant.tips || [];
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  
  if (plantData.growth_percent >= 90) {
    return "Your plant is ready for harvest! " + (randomTip || "Keep up the great work!");
  }
  
  return randomTip || "Keep providing consistent care and your plant will thrive!";
}

// Helper function to get action icons
function getActionIcon(type: string) {
  switch (type) {
    case 'water':
      return <Droplets size={20} color={Colors.accent} />;
    case 'fertilize':
      return <Zap size={20} color={Colors.warning} />;
    case 'prune':
      return <Scissors size={20} color={Colors.success} />;
    default:
      return <Clock size={20} color={Colors.textMuted} />;
  }
}

// Loading skeleton component
function PlantDetailSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header skeleton */}
      <View style={[styles.header, { height: 300 }]}>
        <LoadingSkeleton width="100%" height="100%" />
        <View style={styles.headerOverlay} />
        <View style={styles.headerControls}>
          <LoadingSkeleton width={40} height={40} borderRadius={20} />
        </View>
        <View style={styles.headerContent}>
          <LoadingSkeleton width={80} height={80} borderRadius={40} style={{ marginBottom: 16 }} />
          <LoadingSkeleton width={200} height={28} style={{ marginBottom: 8 }} />
          <LoadingSkeleton width={150} height={16} style={{ marginBottom: 4 }} />
          <LoadingSkeleton width={120} height={14} />
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={{ height: 200 }} />
        
        {/* Action bar skeleton */}
        <View style={styles.actionBar}>
          <LoadingSkeleton width="30%" height={60} borderRadius={16} />
          <LoadingSkeleton width="30%" height={60} borderRadius={16} />
          <LoadingSkeleton width="30%" height={60} borderRadius={16} />
        </View>

        {/* Content skeletons */}
        <View style={{ paddingHorizontal: 16 }}>
          <LoadingSkeleton width="100%" height={200} borderRadius={12} style={{ marginBottom: 24 }} />
          <LoadingSkeleton width="100%" height={150} borderRadius={12} style={{ marginBottom: 24 }} />
          <LoadingSkeleton width="100%" height={300} borderRadius={12} style={{ marginBottom: 24 }} />
          <LoadingSkeleton width="100%" height={180} borderRadius={12} style={{ marginBottom: 24 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  errorContainer: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerImage: {
    width: '100%',
    height: '120%',
    resizeMode: 'cover',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerControls: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  growthRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.md,
  },
  growthRingInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  growthPercent: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '700',
  },
  plantName: {
    ...Typography.h2,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 4,
  },
  plantSpecies: {
    ...Typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  daysSinceSow: {
    ...Typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  stickyNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    zIndex: 2,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stickyBackButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  stickyTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: '600',
    marginTop: 4,
  },
  timelineCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  timelineDate: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  voiceGuideCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: '#F0F9FF',
  },
  voiceGuideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  playButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceGuideText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  analyticsCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  notesCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  addNoteButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.bgLight,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  notesGallery: {
    flexDirection: 'row',
  },
  noteItem: {
    width: 120,
    marginRight: Spacing.md,
  },
  noteImage: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.md,
    resizeMode: 'cover',
    marginBottom: Spacing.xs,
  },
  noteCaption: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  noteDate: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  dangerZone: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: '#FEF2F2',
  },
  dangerTitle: {
    ...Typography.body,
    color: Colors.error,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  dangerButton: {
    width: '100%',
  },
  archivedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  archivedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.textMuted,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  archivedText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
});