
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * Uploads media (image or video) to Cloudinary
 * @param uri - The local URI of the media
 * @param folder - Cloudinary folder
 * @param resourceType - 'image' | 'video'
 */
export const uploadToCloudinary = async (
    uri: string,
    folder: string,
    resourceType: 'image' | 'video' = 'image'
): Promise<{ url: string, width: number, height: number, duration?: number }> => {
    if (!process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error("Cloudinary credentials are not configured in .env");
    }

    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const formData = new FormData();
    // @ts-ignore
    formData.append('file', {
        uri,
        type: resourceType === 'video' ? 'video/mp4' : 'image/jpeg',
        name: resourceType === 'video' ? 'upload.mp4' : 'upload.jpg',
    });
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    try {
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Cloudinary upload failed");
        }

        const data = await response.json();

        return {
            url: data.secure_url,
            width: data.width,
            height: data.height,
            duration: data.duration, // Cloudinary returns duration for videos
        };
    } catch (error: any) {
        console.error("Cloudinary upload error:", error.message);
        throw new Error(`Failed to upload ${resourceType} to Cloudinary`);
    }
};
