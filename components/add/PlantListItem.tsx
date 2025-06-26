import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';

interface PlantListItemProps {
  photoUrl: string;
  name: string;
  scientificName: string;
  category: string;
  difficulty: string;
  onPress: () => void;
}

export function PlantListItem({
  photoUrl,
  name,
  scientificName,
  category,
  difficulty,
  onPress,
}: PlantListItemProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return Colors.success;
      case 'intermediate':
        return Colors.warning;
      case 'advanced':
        return Colors.error;
      default:
        return Colors.textMuted;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'herb':
        return Colors.primary;
      case 'vegetable':
        return Colors.accent;
      case 'fruit':
        return Colors.warning;
      case 'flower':
        return '#8B5CF6';
      case 'succulent':
        return '#10B981';
      default:
        return Colors.textMuted;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: photoUrl }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: `${getCategoryColor(category)}15` }]}>
              <Text style={[styles.badgeText, { color: getCategoryColor(category) }]}>
                {category}
              </Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.scientificName}>{scientificName}</Text>
        
        <View style={styles.footer}>
          <View style={[styles.difficultyBadge, { backgroundColor: `${getDifficultyColor(difficulty)}15` }]}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(difficulty) }]}>
              {difficulty}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  badges: {
    marginLeft: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  scientificName: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  difficultyText: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});