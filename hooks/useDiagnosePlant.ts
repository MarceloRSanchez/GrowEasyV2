import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useAuth } from '@/hooks/useAuth';

export interface DiagnoseRequest { 
  uri: string; 
}

export interface DiagnosisResult {
  id: string;
  image_url: string;
  status: 'healthy' | 'warning' | 'critical';
  resume: string;
  description: string;
  created_at: string;
}

export function useDiagnosePlant() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ uri }: DiagnoseRequest): Promise<DiagnosisResult> => {
      if (!user) {
        throw new Error('User must be authenticated to upload images');
      }

      // 1. Upload image to Supabase Storage
      const fileName = `${user.id}/${uuidv4()}.jpg`;
      
      let file;
      if (Platform.OS === 'web') {
        // For web, fetch the file and convert to blob
        const response = await fetch(uri);
        file = await response.blob();
      } else {
        // For native, use the URI directly with FileSystem
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        file = {
          uri,
          name: fileName,
          type: 'image/jpeg',
          base64,
        };
      }
      
      const { data, error } = await supabase
        .storage.from('diagnoses')
        .upload(fileName, file, { 
          cacheControl: '3600', 
          upsert: false 
        });
        
      if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }
      
      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase
        .storage.from('diagnoses')
        .getPublicUrl(fileName);
      
      // 2. Call n8n webhook for diagnosis
      const res = await fetch('https://n8n.lubee.com.ar/webhook/plant-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: publicUrl }),
      });
      
      if (!res.ok) {
        throw new Error(`Diagnosis API error: ${res.status} ${res.statusText}`);
      }
      
      const txt = await res.text();
      // Strip markdown code-block
      const json = JSON.parse(txt.replace(/```json|```/g, '').trim());
      
      // Validate and ensure we have a valid status
      const validStatuses = ['healthy', 'warning', 'critical'];
      const status = validStatuses.includes(json.status) ? json.status : 'warning';
      
      // 3. Insert diagnosis record in database
      const { data: row, error: dbErr } = await supabase
        .from('plant_diagnoses')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          status: status,
          resume: json.resume,
          description: json.description,
        })
        .select()
        .single();
        
      if (dbErr) {
        console.error('Database insert error:', dbErr);
        throw new Error(`Failed to save diagnosis: ${dbErr.message}`);
      }
      
      // 4. Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['diagnoses'] });
      
      return row as unknown as DiagnosisResult;
    },
    onError: (error) => {
      console.error('Diagnosis error:', error);
    },
  });
}