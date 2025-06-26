import { useEffect } from 'react';
import { router } from 'expo-router';

export default function AddPlantRedirect() {
  useEffect(() => {
    // Redirect to the add wizard
    router.replace('/add/search');
  }, []);

  return null;
}