-- Create the 'resumes' bucket for storing applicant resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read access (so admins can view resumes)
-- Note: You might want to restrict this to admins only in a real production app,
-- but for now, public read is easier to ensure links work.
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'resumes' );

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload resumes"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'resumes' AND auth.role() = 'authenticated' );

-- Policy: Allow users to update their own files (optional, but good practice)
CREATE POLICY "Users can update own resumes"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'resumes' AND auth.uid() = owner );
