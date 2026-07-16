# Cloudinary Media Migration Design

## Overview
Migrate media storage from Supabase Storage to Cloudinary for better performance, transformations, and cost management.

## Current State
- Media references stored in DB: `profiles.avatar_url`, `submissions.content_link`, `submissions.content_file_name`
- Files likely stored in Supabase Storage buckets or localStorage
- No optimization, transformations, or CDN delivery

## Target Architecture

### Backend (Next.js API Routes)
```
POST   /api/media/upload          - Signed upload (authenticated users)
POST   /api/media/upload-signed   - Get signed upload params (for direct upload)
GET    /api/media/signed-url      - Generate signed delivery URL for private media
DELETE /api/media/:publicId       - Delete media (admin/instructor)
GET    /api/media/:publicId       - Get media metadata
```

### Database Schema
```sql
-- New media table for tracking all uploads
CREATE TABLE media_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  public_id TEXT NOT NULL UNIQUE,           -- Cloudinary public_id
  resource_type TEXT NOT NULL,              -- 'image' | 'video' | 'raw'
  format TEXT NOT NULL,                     -- Original format
  width INT,                                -- For images/videos
  height INT,
  duration DOUBLE PRECISION,                -- For videos
  bytes BIGINT NOT NULL,                    -- File size
  secure_url TEXT NOT NULL,                 -- Cloudinary secure URL
  folder TEXT,                              -- Cloudinary folder
  tags TEXT[],                              -- For organization
  uploaded_by UUID REFERENCES profiles(id),
  entity_type TEXT,                         -- 'profile' | 'submission' | 'lesson' | 'announcement'
  entity_id UUID,                           -- Reference ID
  is_private BOOLEAN DEFAULT false,         -- Require signed URL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_media_entity ON media_assets(entity_type, entity_id);
CREATE INDEX idx_media_uploaded_by ON media_assets(uploaded_by);
CREATE INDEX idx_media_public_id ON media_assets(public_id);
```

### Frontend Components
1. **MediaUploader** - Drag-drop, progress, multiple files, validation
2. **CloudinaryImage** - Optimized `<Image>` wrapper with transformations
3. **CloudinaryVideo** - Video player with adaptive streaming
4. **MediaGallery** - Grid/list display with lightbox

### Security
- **Signed Uploads**: Server generates signature, client uploads directly to Cloudinary
- **Private Media**: Signed delivery URLs with expiration (1hr default)
- **Transformations**: Allowed transformations whitelisted server-side
- **File Validation**: Type, size limits enforced both client and server
- **Access Control**: RLS policies on media_assets table

### Cloudinary Configuration
```typescript
// Folder structure
folders: {
  profiles: 'housmata/profiles',
  submissions: 'housmata/submissions',
  lessons: 'housmata/lessons',
  announcements: 'housmata/announcements',
  certificates: 'housmata/certificates',
  temp: 'housmata/temp'
}

// Allowed transformations per context
transformations: {
  profile: { w: 400, h: 400, crop: 'fill', gravity: 'face', quality: 'auto' },
  submission: { w: 1200, quality: 'auto' },
  lesson: { w: 800, quality: 'auto' },
  thumbnail: { w: 200, h: 200, crop: 'fill', quality: 'auto' },
  hero: { w: 1920, quality: 'auto' }
}
```

## Migration Strategy

### Phase 1: Setup & New Uploads
1. Add Cloudinary dependencies
2. Create media_assets table
3. Build upload API with signed uploads
4. Build React upload/display components
5. Test new uploads go to Cloudinary

### Phase 2: Data Migration
1. List all files in Supabase Storage buckets
2. Download each file
3. Upload to Cloudinary with same folder structure
4. Create media_assets records
5. Update foreign references (profiles, submissions)
6. Verify all URLs work

### Phase 3: Cleanup
1. Remove Supabase Storage buckets
2. Remove Supabase Storage dependencies
3. Update documentation

## Environment Variables
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=housmata_unsigned  # For unsigned uploads (public media)
```

## API Examples

### Signed Upload (Server)
```typescript
// POST /api/media/upload-signed
// Returns: { signature, timestamp, api_key, cloud_name, folder }
```

### Direct Upload (Client)
```typescript
// Client uploads directly to Cloudinary using signed params
const formData = new FormData();
formData.append('file', file);
formData.append('signature', signature);
formData.append('api_key', apiKey);
formData.append('timestamp', timestamp);
formData.append('folder', folder);
await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
  method: 'POST',
  body: formData
});
```

### Signed Delivery URL (Server)
```typescript
// GET /api/media/signed-url?publicId=xxx&expiresIn=3600
// Returns: { signedUrl, expiresAt }
```