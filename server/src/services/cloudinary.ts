import { v2 as cloudinary } from 'cloudinary';

export function initCloudinary() {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const configured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_SECRET);
    if (configured) {
        console.log('[Cloudinary] Configured successfully');
    } else {
        console.log('[Cloudinary] ⚠ Not fully configured (missing secret). Gallery uploads disabled.');
    }
    return configured;
}

export async function uploadImage(buffer: Buffer, originalName: string): Promise<{ url: string; thumbnailUrl: string }> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'astro-view',
                resource_type: 'image',
                public_id: `astro_${Date.now()}`,
                transformation: [{ quality: 'auto', fetch_format: 'auto' }],
            },
            (error, result) => {
                if (error || !result) {
                    reject(error || new Error('Upload failed'));
                    return;
                }
                // Generate thumbnail URL (400px wide)
                const thumbnailUrl = cloudinary.url(result.public_id, {
                    width: 400,
                    height: 300,
                    crop: 'fill',
                    quality: 'auto',
                    fetch_format: 'auto',
                });

                resolve({
                    url: result.secure_url,
                    thumbnailUrl,
                });
            }
        );
        uploadStream.end(buffer);
    });
}
