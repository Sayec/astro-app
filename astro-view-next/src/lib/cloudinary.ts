import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
    buffer: Buffer,
    originalName: string,
): Promise<{ url: string; thumbnailUrl: string; publicId: string }> {
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
                const thumbnailUrl = cloudinary.url(result.public_id, {
                    width: 400,
                    height: 300,
                    crop: 'fill',
                    quality: 'auto',
                    fetch_format: 'auto',
                });
                resolve({ url: result.secure_url, thumbnailUrl, publicId: result.public_id });
            }
        );
        uploadStream.end(buffer);
    });
}

export async function deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
}
