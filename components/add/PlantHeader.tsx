import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';

interface PlantHeaderProps {
  photoUrl: string;
  name: string;
  scientificName: string;
}

export function PlantHeader({ photoUrl, name, scientificName }: PlantHeaderProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: photoUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.scientificName}>{scientificName}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  name: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  scientificName: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});