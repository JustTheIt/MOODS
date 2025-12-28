export const uploadMedia = async (uri: string, type: 'image' | 'video' = 'image'): Promise<string> => {
  try {
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary configuration is missing");
    }

    const formData = new FormData();
    formData.append("file", {
      uri: uri,
      type: type === 'video' ? "video/mp4" : "image/jpeg",
      name: type === 'video' ? "upload.mp4" : "upload.jpg",
    } as any);
    formData.append("upload_preset", uploadPreset);
    // resource_type: "auto" allows Cloudinary to detect if it's an image or video
    formData.append("resource_type", "auto");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, // 'auto' is the correct resource type for mixed media
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary error response:", errorText);
      let errorMessage = "Cloudinary upload failed";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // Not JSON
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading media to Cloudinary:", error);
    throw error;
  }
};

// Maintain compatibility with existing code
export const uploadImage = uploadMedia;
