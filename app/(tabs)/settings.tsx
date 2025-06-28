import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { User, Bell, Leaf, Globe, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight, Camera, Moon, Smartphone } from 'lucide-react-native';
import { useOnboarding } from '@/hooks/useOnboarding';

interface SettingItem {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoWatering, setAutoWatering] = useState(false);
  const { user, signOut } = useAuth();
  const { resetOnboarding } = useOnboarding();

  const profileData = {
    name: user?.email?.split('@')[0] || 'Gardener',
    email: user?.email || 'user@groweasy.com',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
    level: 5,
    plantsGrown: 12,
    ecoPoints: 1250,
  };

  const settingSections = [
    {
      title: 'Account',
      items: [
        {
          icon: <User size={24} color={Colors.primary} />,
          title: 'Profile',
          subtitle: 'Edit your personal information',
          type: 'navigation',
          onPress: () => Alert.alert('Profile', 'Profile settings coming soon!'),
        },
        {
          icon: <Camera size={24} color={Colors.accent} />,
          title: 'Photo Permissions',
          subtitle: 'Manage camera and gallery access',
          type: 'navigation',
          onPress: () => Alert.alert('Permissions', 'Photo permissions settings'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: <Bell size={24} color={Colors.warning} />,
          title: 'Notifications',
          subtitle: 'Care reminders and updates',
          type: 'toggle',
          value: notifications,
          onToggle: setNotifications,
        },
        {
          icon: <Moon size={24} color={Colors.textMuted} />,
          title: 'Dark Mode',
          subtitle: 'Switch to dark theme',
          type: 'toggle',
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          icon: <Globe size={24} color={Colors.accent} />,
          title: 'Language',
          subtitle: 'English (US)',
          type: 'navigation',
          onPress: () => Alert.alert('Language', 'Language settings coming soon!'),
        },
      ],
    },
    {
      title: 'Garden',
      items: [
        {
          icon: <Leaf size={24} color={Colors.primary} />,
          title: 'Garden Settings',
          subtitle: 'Manage your plants and garden layout',
          type: 'navigation',
          onPress: () => Alert.alert('Garden', 'Garden settings coming soon!'),
        },
        {
          icon: <Smartphone size={24} color={Colors.accent} />,
          title: 'Smart Devices',
          subtitle: 'Connect IoT sensors and automation',
          type: 'toggle',
          value: autoWatering,
          onToggle: setAutoWatering,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: <HelpCircle size={24} color={Colors.textMuted} />,
          title: 'Help & FAQ',
          subtitle: 'Get help and find answers',
          type: 'navigation',
          onPress: () => Alert.alert('Help', 'Help center coming soon!'),
        },
        {
          icon: <Shield size={24} color={Colors.textMuted} />,
          title: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
          type: 'navigation',
          onPress: () => Alert.alert('Privacy', 'Privacy policy coming soon!'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.type === 'toggle'}
    >
      <View style={styles.settingContent}>
        <View style={styles.settingIcon}>
          {item.icon}
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
        <View style={styles.settingAction}>
          {item.type === 'toggle' ? (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          ) : (
            <ChevronRight size={20} color={Colors.textMuted} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await signOut();
              router.replace('/auth');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        },
      ]
    );
  };

  const handleResetOnboarding = async () => {
    Alert.alert(
      'Reset Onboarding',
      'This will reset the onboarding flow. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetOnboarding();
            Alert.alert('Success', 'Onboarding reset! App will restart.', [
              {
                text: 'OK',
                onPress: () => router.replace('/'),
              },
            ]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: profileData.avatar }} style={styles.profileAvatar} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profileData.name}</Text>
              <Text style={styles.profileEmail}>{profileData.email}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Level {profileData.level}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.profileStats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profileData.plantsGrown}</Text>
              <Text style={styles.statLabel}>Plants Grown</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profileData.ecoPoints}</Text>
              <Text style={styles.statLabel}>Eco Points</Text>
            </View>
          </View>
        </Card>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  {renderSettingItem(item, itemIndex)}
                  {itemIndex < section.items.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </Card>
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            title="Log Out"
            onPress={handleLogout}
            variant="outline"
            textStyle={{ color: Colors.error }}
            style={[styles.logoutButton, { borderColor: Colors.error }]}
          />
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>GrowEasy v1.0.0</Text>
          <Text style={styles.versionSubtext}>Built with 🌱 for urban gardeners</Text>
        </View>

        {/* Debug Button */}
        <View style={styles.debugSection}>
          <Text style={styles.debugSectionTitle}>Debug Tools</Text>
          
          <TouchableOpacity
            style={styles.debugButton}
            onPress={handleResetOnboarding}
            accessibilityLabel="Reset onboarding flow"
          >
            <Text style={styles.debugButtonText}>🔄 Reset Onboarding</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  profileCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  levelBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  levelText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: '600',
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '700',
  },
  statLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  section: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  sectionCard: {
    padding: 0,
  },
  settingItem: {
    padding: Spacing.md,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    backgroundColor: Colors.bgLight,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  settingSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  settingAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: Spacing.md + 40 + Spacing.md,
  },
  logoutContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  logoutButton: {
    width: '100%',
  },
  versionContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  versionText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  versionSubtext: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  debugSection: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  debugSectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  debugButton: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  debugButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});