import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { boolean, text } from '@storybook/addon-knobs';
import { Button } from '@/components/ui/Button';
import { QuickActionSheet, QuickActionSheetRef } from '@/components/quickActions/QuickActionSheet';

// Create a query client for Storybook
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const meta: Meta<typeof QuickActionSheet> = {
  title: 'Components/QuickActionSheet',
  component: QuickActionSheet,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <View style={styles.container}>
          <Story />
        </View>
      </QueryClientProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

const mockPlantData = {
  id: 'plant-123',
  nickname: 'My Sweet Basil',
  photoUrl: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=400',
  growthPercent: 75,
  species: 'Ocimum basilicum',
};

function QuickActionSheetDemo() {
  const sheetRef = useRef<QuickActionSheetRef>(null);

  const handleOpenSheet = () => {
    sheetRef.current?.open(mockPlantData);
  };

  const handleWater = (plantId: string) => {
    Alert.alert('Success!', `Water action completed for plant ${plantId}`);
  };

  const handleFertilize = (plantId: string) => {
    Alert.alert('Success!', `Fertilize action completed for plant ${plantId}`);
  };

  const handleHarvest = (plantId: string) => {
    Alert.alert('Success!', `Harvest action completed for plant ${plantId}`);
  };

  const handleArchive = (plantId: string) => {
    Alert.alert('Success!', `Archive action completed for plant ${plantId}`);
  };

  return (
    <View style={styles.demoContainer}>
      <Button
        title="Open Quick Actions"
        onPress={handleOpenSheet}
        size="large"
      />
      
      <QuickActionSheet
        ref={sheetRef}
        onWater={handleWater}
        onFertilize={handleFertilize}
        onHarvest={handleHarvest}
        onArchive={handleArchive}
      />
    </View>
  );
}

export const Default: Story = {
  render: () => <QuickActionSheetDemo />,
  name: 'Interactive Demo',
};

export const HighGrowthPlant: Story = {
  render: () => {
    const sheetRef = useRef<QuickActionSheetRef>(null);
    
    const highGrowthPlant = {
      ...mockPlantData,
      nickname: 'Ready to Harvest Tomato',
      growthPercent: 95,
      photoUrl: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400',
      species: 'Solanum lycopersicum',
    };

    return (
      <View style={styles.demoContainer}>
        <Button
          title="Open High Growth Plant"
          onPress={() => sheetRef.current?.open(highGrowthPlant)}
          size="large"
        />
        
        <QuickActionSheet
          ref={sheetRef}
          onWater={(id) => Alert.alert('Success!', `Water: ${id}`)}
          onFertilize={(id) => Alert.alert('Success!', `Fertilize: ${id}`)}
          onHarvest={(id) => Alert.alert('Success!', `Harvest: ${id}`)}
          onArchive={(id) => Alert.alert('Success!', `Archive: ${id}`)}
        />
      </View>
    );
  },
  name: 'High Growth Plant',
};

export const LowGrowthPlant: Story = {
  render: () => {
    const sheetRef = useRef<QuickActionSheetRef>(null);
    
    const lowGrowthPlant = {
      ...mockPlantData,
      nickname: 'Young Seedling',
      growthPercent: 15,
      photoUrl: 'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&cs=tinysrgb&w=400',
      species: 'Lactuca sativa',
    };

    return (
      <View style={styles.demoContainer}>
        <Button
          title="Open Young Plant"
          onPress={() => sheetRef.current?.open(lowGrowthPlant)}
          size="large"
        />
        
        <QuickActionSheet
          ref={sheetRef}
          onWater={(id) => Alert.alert('Success!', `Water: ${id}`)}
          onFertilize={(id) => Alert.alert('Success!', `Fertilize: ${id}`)}
          onHarvest={(id) => Alert.alert('Success!', `Harvest: ${id}`)}
          onArchive={(id) => Alert.alert('Success!', `Archive: ${id}`)}
        />
      </View>
    );
  },
  name: 'Young Plant',
};

export const WithoutSpecies: Story = {
  render: () => {
    const sheetRef = useRef<QuickActionSheetRef>(null);
    
    const plantWithoutSpecies = {
      id: 'plant-456',
      nickname: 'Mystery Plant',
      photoUrl: 'https://images.pexels.com/photos/568470/pexels-photo-568470.jpeg?auto=compress&cs=tinysrgb&w=400',
      growthPercent: 60,
    };

    return (
      <View style={styles.demoContainer}>
        <Button
          title="Open Plant Without Species"
          onPress={() => sheetRef.current?.open(plantWithoutSpecies)}
          size="large"
        />
        
        <QuickActionSheet
          ref={sheetRef}
          onWater={(id) => Alert.alert('Success!', `Water: ${id}`)}
          onFertilize={(id) => Alert.alert('Success!', `Fertilize: ${id}`)}
          onHarvest={(id) => Alert.alert('Success!', `Harvest: ${id}`)}
          onArchive={(id) => Alert.alert('Success!', `Archive: ${id}`)}
        />
      </View>
    );
  },
  name: 'Without Species',
};

export const ErrorSimulation: Story = {
  render: () => {
    const sheetRef = useRef<QuickActionSheetRef>(null);

    return (
      <View style={styles.demoContainer}>
        <Button
          title="Open With Error Simulation"
          onPress={() => sheetRef.current?.open(mockPlantData)}
          size="large"
        />
        
        <QuickActionSheet
          ref={sheetRef}
          onWater={() => Alert.alert('Error!', 'Simulated network error')}
          onFertilize={() => Alert.alert('Error!', 'Simulated validation error')}
          onHarvest={() => Alert.alert('Error!', 'Simulated server error')}
          onArchive={() => Alert.alert('Error!', 'Simulated permission error')}
        />
      </View>
    );
  },
  name: 'Error Simulation',
};

export const WithErrorBanner: Story = {
  render: () => {
    const sheetRef = useRef<QuickActionSheetRef>(null);
    const showError = boolean('Show Error Banner', true);
    const errorMessage = text('Error Message', 'Multiple failures detected. Try again later or check your connection.');

    return (
      <View style={styles.demoContainer}>
        <Button
          title="Open With Error Banner"
          onPress={() => sheetRef.current?.open(mockPlantData)}
          size="large"
        />
        
        <QuickActionSheet
          ref={sheetRef}
          onWater={() => showError && Alert.alert('Error!', 'Simulated repeated failure')}
          onFertilize={() => showError && Alert.alert('Error!', 'Simulated repeated failure')}
          onHarvest={() => showError && Alert.alert('Error!', 'Simulated repeated failure')}
          onArchive={() => showError && Alert.alert('Error!', 'Simulated repeated failure')}
        />
      </View>
    );
  },
  name: 'With Error Banner',
};

export const GlobalLoadingDemo: Story = {
  render: () => {
    const sheetRef = useRef<QuickActionSheetRef>(null);
    const showLoading = boolean('Show Global Loading', true);
    const loadingMessage = text('Loading Message', 'Logging action…');

    return (
      <View style={styles.demoContainer}>
        <Button
          title="Open With Global Loading"
          onPress={() => sheetRef.current?.open(mockPlantData)}
          size="large"
        />
        
        <QuickActionSheet
          ref={sheetRef}
          onWater={() => showLoading && Alert.alert('Loading...', loadingMessage)}
          onFertilize={() => showLoading && Alert.alert('Loading...', loadingMessage)}
          onHarvest={() => showLoading && Alert.alert('Loading...', loadingMessage)}
          onArchive={() => showLoading && Alert.alert('Loading...', loadingMessage)}
        />
      </View>
    );
  },
  name: 'Global Loading Demo',
};

export const ArchiveConfirmDemo: Story = {
  render: () => {
    const sheetRef = useRef<QuickActionSheetRef>(null);
    const showConfirm = boolean('Show Archive Confirm', true);

    return (
      <View style={styles.demoContainer}>
        <Button
          title="Open Archive Confirm Demo"
          onPress={() => sheetRef.current?.open(mockPlantData)}
          size="large"
        />
        
        <QuickActionSheet
          ref={sheetRef}
          onWater={() => Alert.alert('Success!', 'Water logged')}
          onFertilize={() => Alert.alert('Success!', 'Fertilize logged')}
          onHarvest={() => Alert.alert('Success!', 'Harvest logged')}
          onArchive={() => showConfirm && Alert.alert('Archive Confirm', 'This would show the native confirmation dialog')}
        />
      </View>
    );
  },
  name: 'Archive Confirm Demo',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  demoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});