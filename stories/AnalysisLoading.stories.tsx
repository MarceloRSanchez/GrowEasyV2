import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { AnalysisLoading } from '@/components/diagnose/AnalysisLoading';

const meta: Meta<typeof AnalysisLoading> = {
  title: 'Components/AnalysisLoading',
  component: AnalysisLoading,
};

export default meta;

type Story = StoryObj<typeof meta>;

function AnalysisLoadingDemo() {
  const [visible, setVisible] = useState(false);
  
  // Auto-hide after 10 seconds
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [visible]);
  
  return (
    <View style={styles.container}>
      <Button
        title={visible ? "Hide Loading" : "Show Loading"}
        onPress={() => setVisible(!visible)}
      />
      
      <AnalysisLoading visible={visible} />
    </View>
  );
}

export const Default: Story = {
  render: () => <AnalysisLoadingDemo />,
};

export const CustomMessage: Story = {
  render: () => {
    const [visible, setVisible] = useState(false);
    
    return (
      <View style={styles.container}>
        <Button
          title={visible ? "Hide Loading" : "Show Loading"}
          onPress={() => setVisible(!visible)}
        />
        
        <AnalysisLoading 
          visible={visible} 
          message="Processing plant health data..." 
        />
      </View>
    );
  },
};

export const PersistentDemo: Story = {
  render: () => (
    <View style={styles.container}>
      <AnalysisLoading visible={true} />
    </View>
  ),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});