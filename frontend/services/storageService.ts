import api from "@/lib/api";

export interface MediaUploadResult {
  url: string;
  width: number;
  height: number;
  aspectRatio: number;
  mediaType: 'image' | 'video';
  duration?: number;
}

/**
 * Uploads media to Cloudinary using a signed request
 */
export const uploadMedia = async (uri: string, type: 'image' | 'video' = 'image'): Promise<MediaUploadResult> => {
  try {
    // 1. Get signature from backend
    const signResponse = await api.get('/media/sign');
    const { signature, timestamp, apiKey, cloudName } = signResponse.data;

    const formData = new FormData();
    // @ts-ignore
    formData.append("file", {
      uri: uri,
      type: type === 'video' ? "video/mp4" : "image/jpeg",
      name: type === 'video' ? "upload.mp4" : "upload.jpg",
    });

    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("upload_preset", "moods_preset");
    formData.append("resource_type", type === 'video' ? "video" : "image");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${type === 'video' ? 'video' : 'image'}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary error response:", errorText);
      throw new Error("Cloudinary upload failed");
    }

    const data = await response.json();

    return {
      url: data.secure_url,
      width: data.width,
      height: data.height,
      aspectRatio: data.width / data.height,
      mediaType: type,
      duration: data.duration,
    };
  } catch (error) {
    console.error("Error uploading media to Cloudinary:", error);
    throw error;
  }
};

export const uploadImage = uploadMedia;
