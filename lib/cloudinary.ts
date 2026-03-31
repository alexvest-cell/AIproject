import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export function streamUpload(buffer: Buffer, resourceType: 'image' | 'video' = 'image'): Promise<{ secure_url: string; [key: string]: unknown }> {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: resourceType },
            (error, result) => {
                if (result) resolve(result as { secure_url: string });
                else reject(error);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
}
