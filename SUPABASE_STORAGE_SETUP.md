# Supabase Storage Setup for Exhibition Images

## Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Click "New Bucket"
3. Name: `exhibition-images`
4. Public bucket: ✅ **Yes** (images need to be publicly accessible)
5. Click "Create bucket"

## Set Storage Policies

After creating the bucket, set up the following RLS policies:

```sql
-- Allow gallery users to upload images
CREATE POLICY "Gallery users can upload exhibition images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'exhibition-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to all images
CREATE POLICY "Anyone can view exhibition images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'exhibition-images');

-- Allow gallery users to update their own images
CREATE POLICY "Gallery users can update their exhibition images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'exhibition-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow gallery users to delete their own images
CREATE POLICY "Gallery users can delete their exhibition images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'exhibition-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## File Organization

Images are stored in folders by gallery ID:
```
exhibition-images/
  ├── gallery-uuid-1/
  │   ├── 1702831200000.jpg
  │   └── 1702831300000.png
  └── gallery-uuid-2/
      └── 1702831400000.jpg
```

## Size Limits

- Maximum file size: 5MB
- Supported formats: JPG, PNG, WEBP, GIF
- Recommended dimensions: 1200x800px or larger

## Environment Variables

Make sure these are set in `apps/web/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Testing Upload

1. Log in to gallery dashboard
2. Go to "New Exhibition"
3. Click image upload area
4. Select an image file
5. Image should upload and display preview
6. Submit the form

The image URL will be saved as `image_url` in the `exhibition_submissions` table.
