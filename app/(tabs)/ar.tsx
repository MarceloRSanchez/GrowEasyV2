import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Cuboid as Cube, Smartphone, Eye, Zap, PhoneIncoming as ComingSoon, ArrowRight } from 'lucide-react-native';

const arFeatures = [
  {
    icon: <Eye size={32} color={Colors.primary} />,
    title: 'Plant Visualization',
    description: 'See how your plants will look in your space before planting',
  },
  {
    icon: <Smartphone size={32} color={Colors.accent} />,
    title: 'Space Planning',
    description: 'Optimize your garden layout with AR-guided placement',
  },
  {
    icon: <Zap size={32} color={Colors.warning} />,
    title: 'Growth Simulation',
    description: 'Watch your plants grow over time with realistic animations',
  },
];

export default function ARScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AR Garden</Text>
          <Text style={styles.subtitle}>Augmented reality gardening experience</Text>
        </View>

        {/* Coming Soon Badge */}
        <Card style={styles.comingSoonCard}>
          <LinearGradient
            colors={['#32E177', '#3DB5FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientContainer}
          >
            <View style={styles.comingSoonContent}>
              <Cube size={64} color={Colors.white} />
              <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
              <Text style={styles.comingSoonText}>
                We're working on an amazing AR experience that will revolutionize how you plan and visualize your garden.
              </Text>
            </View>
          </LinearGradient>
        </Card>

        {/* Preview Image */}
        <Card style={styles.previewCard}>
          <Image
            source={{
              uri: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800'
            }}
            style={styles.previewImage}
          />
          <View style={styles.previewOverlay}>
            <Text style={styles.previewText}>AR Preview</Text>
          </View>
        </Card>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What's Coming</Text>
          {arFeatures.map((feature, index) => (
            <Card key={index} style={styles.featureCard}>
              <View style={styles.featureContent}>
                <View style={styles.featureIcon}>
                  {feature.icon}
                </View>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <ArrowRight size={20} color={Colors.textMuted} />
              </View>
            </Card>
          ))}
        </View>

        {/* Early Access */}
        <Card style={styles.earlyAccessCard}>
          <Text style={styles.earlyAccessTitle}>Get Early Access</Text>
          <Text style={styles.earlyAccessText}>
            Join our beta program and be among the first to experience AR gardening.
          </Text>
          <Button
            title="Join Beta Program"
            onPress={() => {}}
            size="large"
            style={styles.betaButton}
          />
          <Text style={styles.betaNote}>
            We'll notify you when AR features are ready for testing.
          </Text>
        </Card>

        {/* Tech Requirements */}
        <Card style={styles.requirementsCard}>
          <Text style={styles.requirementsTitle}>System Requirements</Text>
          <View style={styles.requirementsList}>
            <Text style={styles.requirement}>• ARCore (Android) or ARKit (iOS) compatible device</Text>
            <Text style={styles.requirement}>• Camera with autofocus</Text>
            <Text style={styles.requirement}>• Gyroscope and accelerometer sensors</Text>
            <Text style={styles.requirement}>• Minimum 3GB RAM recommended</Text>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  header: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  comingSoonCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  gradientContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  comingSoonContent: {
    alignItems: 'center',
  },
  comingSoonTitle: {
    ...Typography.h2,
    color: Colors.white,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  comingSoonText: {
    ...Typography.body,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  previewCard: {
    padding: 0,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(50, 225, 119, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    ...Typography.h3,
    color: Colors.white,
    fontWeight: '700',
  },
  featuresContainer: {
    marginBottom: Spacing.lg,
  },
  featuresTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  featureCard: {
    marginBottom: Spacing.sm,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 64,
    height: 64,
    backgroundColor: Colors.bgLight,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  earlyAccessCard: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    backgroundColor: '#F0F9FF',
  },
  earlyAccessTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  earlyAccessText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
  betaButton: {
    width: '100%',
    marginBottom: Spacing.sm,
  },
  betaNote: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  requirementsCard: {
    marginBottom: Spacing.lg,
  },
  requirementsTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  requirementsList: {
    gap: Spacing.xs,
  },
  requirement: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});