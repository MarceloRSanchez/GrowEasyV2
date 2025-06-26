import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface PlantSelection {
  id: string;
  name: string;
  scientificName: string;
  imageUrl: string;
  category: string;
  difficulty: string;
  careSchedule: {
    watering?: number;
    fertilizing?: number;
  };
  growthTime: number;
  sunlight: string;
  waterNeeds: string;
  tips: string[];
}

export interface PlantConfiguration {
  nickname: string;
  wateringDays: number;
  fertilizingDays: number;
}

interface AddWizardContextType {
  selectedPlant: PlantSelection | null;
  configuration: PlantConfiguration;
  hasUnsavedChanges: boolean;
  setSelectedPlant: (plant: PlantSelection) => void;
  updateConfiguration: (config: Partial<PlantConfiguration>) => void;
  resetWizard: () => void;
}

const AddWizardContext = createContext<AddWizardContextType | undefined>(undefined);

const defaultConfiguration: PlantConfiguration = {
  nickname: '',
  wateringDays: 2,
  fertilizingDays: 14,
};

export function AddWizardProvider({ children }: { children: ReactNode }) {
  const [selectedPlant, setSelectedPlantState] = useState<PlantSelection | null>(null);
  const [configuration, setConfiguration] = useState<PlantConfiguration>(defaultConfiguration);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const setSelectedPlant = (plant: PlantSelection) => {
    setSelectedPlantState(plant);
    // Pre-populate configuration with plant defaults
    setConfiguration({
      nickname: plant.name,
      wateringDays: plant.careSchedule.watering || 2,
      fertilizingDays: plant.careSchedule.fertilizing || 14,
    });
    setHasUnsavedChanges(false);
  };

  const updateConfiguration = (config: Partial<PlantConfiguration>) => {
    setConfiguration(prev => ({ ...prev, ...config }));
    setHasUnsavedChanges(true);
  };

  const resetWizard = () => {
    setSelectedPlantState(null);
    setConfiguration(defaultConfiguration);
    setHasUnsavedChanges(false);
  };

  return (
    <AddWizardContext.Provider
      value={{
        selectedPlant,
        configuration,
        hasUnsavedChanges,
        setSelectedPlant,
        updateConfiguration,
        resetWizard,
      }}
    >
      {children}
    </AddWizardContext.Provider>
  );
}

export function useAddWizard() {
  const context = useContext(AddWizardContext);
  if (context === undefined) {
    throw new Error('useAddWizard must be used within an AddWizardProvider');
  }
  return context;
}