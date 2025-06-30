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
      console.log("publicUrl: ", publicUrl);
      // 2. Call n8n webhook for diagnosis
      const res = await fetch('https://n8n.lubee.com.ar/webhook/plant-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: publicUrl }),
      });
      console.log("Supabase response: ",res);
      if (!res.ok) {
        throw new Error(`Diagnosis API error: ${res.status} ${res.statusText}`);
      }
      
      const txt = await res.text();
      // Strip markdown code-block
      console.log("Raw response from n8n:", txt);
      
      // Handle different response formats
      let json;
      try {
        if (txt.includes('```json')) {
          // If response is in markdown code block format
          json = JSON.parse(txt.replace(/```json|```/g, '').trim());
        } else if (txt.includes('content')) {
          // If response is in { content: "..." } format
          const parsed = JSON.parse(txt);
          if (parsed.content) {
            json = JSON.parse(parsed.content.trim());
          } else {
            throw new Error('Invalid response format');
          }
        } else {
          // Try direct parsing
          json = JSON.parse(txt);
        }
      } catch (parseError) {
        console.error('Error parsing diagnosis response:', parseError, 'Raw text:', txt);
        // Provide fallback values if parsing fails
        json = {
          status: 'warning',
          resume: 'Unable to analyze image',
          description: 'The system was unable to properly analyze this image. Please try again with a clearer photo in better lighting.'
        };
      }
      
      // Validate and ensure we have a valid status
      const validStatuses = ['healthy', 'warning', 'critical'];
      const status = json && json.status && validStatuses.includes(json.status) 
        ? json.status 
        : 'warning';
      
      // Ensure we have valid values for all required fields
      const resume = json && json.resume 
        ? json.resume 
        : 'No summary available';
      
      const description = json && json.description 
        ? json.description 
        : 'No detailed description available';
      
      // 3. Insert diagnosis record in database
      const { data: row, error: dbErr } = await supabase
        .from('plant_diagnoses')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          status,
          resume,
          description,
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