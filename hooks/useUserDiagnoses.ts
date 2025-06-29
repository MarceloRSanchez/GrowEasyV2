import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface DiagnosisItem {
  id: string;
  image_url: string;
  status: 'healthy' | 'warning' | 'critical';
  resume: string;
  description: string;
  created_at: string;
}

export function useUserDiagnoses() {
  return useQuery({
    queryKey: ['diagnoses'],
    queryFn: async (): Promise<DiagnosisItem[]> => {
      const { data, error } = await supabase
        .from('plant_diagnoses')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching diagnoses:', error);
        throw new Error(`Failed to fetch diagnoses: ${error.message}`);
      }
      
      return data as DiagnosisItem[];
    },
    staleTime: 60_000, // 1 minute
  });
}