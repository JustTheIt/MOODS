import axios from 'axios';

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * Uploads an image to Cloudinary using direct REST API
 * @param imageUri - The local URI of the image
 * @param folder - The folder in Cloudinary (e.g., 'mood/avatars', 'mood/stories')
 * @returns The secure URL of the uploaded image
 */
export const uploadToCloudinary = async (imageUri: string, folder: string): Promise<string> => {
    if (!process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error("Cloudinary credentials are not configured in .env");
    }

    const formData = new FormData();
    // @ts-ignore
    formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'upload.jpg',
    });
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    try {
        const response = await axios.post(CLOUDINARY_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.secure_url;
    } catch (error: any) {
        console.error("Cloudinary upload error:", error.response?.data || error.message);
        throw new Error("Failed to upload image to Cloudinary");
    }
};
