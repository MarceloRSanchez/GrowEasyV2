import { useEffect } from 'react';
import { router } from 'expo-router';

export default function AddPlantIndex() {
  useEffect(() => {
    // Redirect to search step immediately
    router.replace('/add/search');
  }, []);

  return null;
}