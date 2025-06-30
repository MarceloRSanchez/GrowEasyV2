/*
  # Add plant diagnoses table

  1. New Tables
    - `plant_diagnoses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `image_url` (text, not null)
      - `status` (text, check constraint for 'healthy', 'warning', 'critical')
      - `resume` (text)
      - `description` (text)
      - `created_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on `plant_diagnoses` table
    - Add policies for users to read and insert their own diagnoses
    - Create storage bucket for diagnosis images
    - Add storage policies for public access and authenticated uploads
*/

-- Create the plant_diagnoses table
CREATE TABLE IF NOT EXISTS plant_diagnoses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  image_url text NOT NULL,
  status text NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
  resume text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable row level security
ALTER TABLE plant_diagnoses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "user can read own diagnoses"
  ON plant_diagnoses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user can insert own diagnoses"
  ON plant_diagnoses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for diagnoses if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('diagnoses', 'diagnoses', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to diagnoses bucket
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'diagnoses');

-- Allow authenticated users to upload to diagnoses bucket
CREATE POLICY "Authenticated users can upload diagnoses"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'diagnoses');