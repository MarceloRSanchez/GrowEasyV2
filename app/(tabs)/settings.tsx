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
import { AvatarPicker } from '@/components/settings/AvatarPicker';
import { DisplayNameEditor } from '@/components/settings/DisplayNameEditor';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { useNotifications } from '@/hooks/useNotifications';
import { router } from 'expo-router';
import { User, Bell, Leaf, Globe, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight, Camera, Moon, Smartphone, Volume2 } from 'lucide-react-native';
import { useOnboarding } from '@/hooks/useOnboarding';
import { testTTS } from '@/lib/tts';

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
  const { isEnabled: notificationsEnabled, toggleNotifications } = useNotifications();
  const { profile, isLoading: profileLoading, updateProfile } = useUserProfile();
  const { toast, showToast, hideToast } = useToast();
  const [autoWatering, setAutoWatering] = useState(false);
  const { user, signOut } = useAuth();
  const { resetOnboarding } = useOnboarding();

  const handleUpdateDisplayName = async (newName: string) => {
    try {
      await updateProfile.mutateAsync({ display_name: newName });
      showToast('Display name updated successfully', 'success');
    } catch (error) {
      console.error('Error updating display name:', error);
      showToast('Failed to update display name', 'error');
    }
  };

  const handleAvatarChange = (url: string) => {
    showToast('Profile picture updated successfully', 'success');
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
          value: notificationsEnabled,
          onToggle: toggleNotifications,
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
          icon: <Volume2 size={24} color={Colors.primary} />,
          title: 'Test Voice Guide',
          subtitle: 'Test text-to-speech functionality',
          type: 'navigation',
          onPress: async () => {
            try {
              Alert.alert('Testing TTS', 'Check console for logs...');
              await testTTS();
            } catch (error) {
              Alert.alert('TTS Error', `Failed to play audio: ${error}`);
            }
          },
        },
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
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Manage your account and preferences</Text>
          </View>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <AvatarPicker
              avatarUrl={profile?.avatar_url}
              size={80}
              onAvatarChange={handleAvatarChange}
              disabled={profileLoading || updateProfile.isLoading}
            />
            <View style={styles.profileInfo}>
              <DisplayNameEditor
                displayName={profile?.display_name}
                email={profile?.email || user?.email || 'user@example.com'}
                onSave={handleUpdateDisplayName}
                disabled={profileLoading || updateProfile.isLoading}
              />
              <Text style={styles.profileEmail}>{profile?.email || user?.email}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Level 5</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.profileStats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Plants Grown</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>1250</Text>
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
          
          {/* Toast */}
          <Toast
            message={toast.message}
            type={toast.type}
            visible={toast.visible}
            onHide={hideToast}
          />
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
    paddingBottom: Spacing.md,
  },
  titleContainer: {
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  profileCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
    marginBottom: Spacing.lg,
  },
  profileInfo: {
    flex: 1,
    alignItems: 'center',
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