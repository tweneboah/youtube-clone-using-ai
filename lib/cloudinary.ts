import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadVideo = async (file: Buffer, folder: string = 'videos') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder,
        chunk_size: 6000000,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(file);
  });
};

export const uploadImage = async (file: Buffer, folder: string = 'thumbnails') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder,
        transformation: [
          { width: 640, height: 360, crop: 'fill' },
          { quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(file);
  });
};

export const uploadAvatar = async (file: Buffer, userId: string) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'avatars',
        public_id: `avatar_${userId}`,
        overwrite: true,
        transformation: [
          { width: 800, height: 800, crop: 'fill', gravity: 'face' },
          { quality: 'auto', format: 'webp' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(file);
  });
};

export const uploadBanner = async (file: Buffer, userId: string) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'banners',
        public_id: `banner_${userId}`,
        overwrite: true,
        transformation: [
          { width: 2560, height: 424, crop: 'fill' },
          { quality: 'auto', format: 'webp' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(file);
  });
};

export const deleteAsset = async (publicId: string, resourceType: 'image' | 'video' = 'video') => {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

// Upload Short video (vertical 9:16)
export const uploadShortVideo = async (file: Buffer, folder: string = 'shorts') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder,
        chunk_size: 6000000,
        transformation: [
          { aspect_ratio: '9:16', crop: 'fill' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(file);
  });
};

// Upload Short thumbnail (vertical 9:16)
export const uploadShortThumbnail = async (file: Buffer, folder: string = 'short-thumbnails') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder,
        transformation: [
          { width: 405, height: 720, crop: 'fill' },
          { quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(file);
  });
};

// Generate thumbnail from video at specific time
export const generateVideoThumbnail = (videoUrl: string, time: number = 0): string => {
  // Extract public_id from Cloudinary URL
  const urlParts = videoUrl.split('/');
  const uploadIndex = urlParts.findIndex(part => part === 'upload');
  if (uploadIndex !== -1) {
    const publicIdWithExt = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
    return cloudinary.url(publicId, {
      resource_type: 'video',
      transformation: [
        { start_offset: time },
        { width: 405, height: 720, crop: 'fill' },
        { format: 'jpg' },
      ],
    });
  }
  return videoUrl;
};

export default cloudinary;
