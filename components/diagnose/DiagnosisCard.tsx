import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { formatDistanceToNow } from 'date-fns';
import { DiagnosisItem } from '@/hooks/useUserDiagnoses';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react-native';

interface DiagnosisCardProps {
  diagnosis: DiagnosisItem;
  onPress: (diagnosis: DiagnosisItem) => void;
}

export function DiagnosisCard({ diagnosis, onPress }: DiagnosisCardProps) {
  const getStatusIcon = () => {
    switch (diagnosis.status) {
      case 'healthy':
        return <CheckCircle size={20} color={Colors.success} />;
      case 'warning':
        return <AlertTriangle size={20} color={Colors.warning} />;
      case 'critical':
        return <XCircle size={20} color={Colors.error} />;
      default:
        return null;
    }
  };
  
  const getStatusColor = () => {
    switch (diagnosis.status) {
      case 'healthy':
        return Colors.success;
      case 'warning':
        return Colors.warning;
      case 'critical':
        return Colors.error;
      default:
        return Colors.textMuted;
    }
  };
  
  const timeAgo = formatDistanceToNow(new Date(diagnosis.created_at), { addSuffix: true });
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(diagnosis)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Plant diagnosis: ${diagnosis.status}`}
      accessibilityHint="Tap to view detailed diagnosis"
    >
      <Image 
        source={{ uri: diagnosis.image_url }} 
        style={styles.image}
        accessibilityLabel="Plant diagnosis image"
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            {getStatusIcon()}
            <Text style={[styles.status, { color: getStatusColor() }]}>
              {diagnosis.status.charAt(0).toUpperCase() + diagnosis.status.slice(1)}
            </Text>
          </View>
          <Text style={styles.date}>{timeAgo}</Text>
        </View>
        
        <Text style={styles.resume} numberOfLines={2}>
          {diagnosis.resume}
        </Text>
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
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    ...Typography.body,
    fontWeight: '600',
    marginLeft: 4,
  },
  date: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  resume: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});