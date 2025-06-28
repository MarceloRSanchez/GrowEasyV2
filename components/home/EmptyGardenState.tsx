import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { Scaling as Seedling } from 'lucide-react-native';

interface EmptyGardenStateProps {
  onAddPlant: () => void;
}

export function EmptyGardenState({ onAddPlant }: EmptyGardenStateProps) {
  const { t } = useTranslation();
  
  return (
    <View style={styles.container}>
      <View style={styles.illustration}>
        <Image
          source={{
            uri: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800'
          }}
          style={styles.image}
        />
        <View style={styles.overlay}>
          <Seedling size={64} color={Colors.primary} />
        </View>
      </View>
      
      <Text style={styles.title}>{t('home.emptyGarden.title')}</Text>
      <Text style={styles.subtitle}>
        {t('home.emptyGarden.subtitle')}
      </Text>
      
      <Button
        title={t('home.emptyGarden.button')}
        onPress={onAddPlant}
        size="large"
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  illustration: {
    width: 200,
    height: 200,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 253, 251, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  button: {
    width: '100%',
    maxWidth: 280,
  },
});