// Cloudinary Upload Service
// Uses unsigned uploads with upload presets (no API secret exposed)

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const UPLOAD_PRESETS = {
    profileImage: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_PROFILE_IMAGE,
    images: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_IMAGES,
    groupIcon: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_GROUP_ICON,
    audio: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_AUDIO,
    file: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_FILE,
};

/**
 * Generic upload function
 */
const uploadToCloudinary = async (file, preset, folder, resourceType = "image") => {
    if (!CLOUD_NAME) {
        throw new Error("Cloudinary cloud name not configured");
    }

    if (!preset) {
        throw new Error("Upload preset not configured");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);
    formData.append("folder", folder);

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

    const response = await fetch(url, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Upload failed");
    }

    const data = await response.json();
    return data.secure_url;
};

/**
 * Upload profile image
 */
export const uploadProfileImage = async (file) => {
    return uploadToCloudinary(
        file,
        UPLOAD_PRESETS.profileImage,
        "zychat/profile",
        "image"
    );
};

/**
 * Upload chat image
 */
export const uploadChatImage = async (file) => {
    return uploadToCloudinary(
        file,
        UPLOAD_PRESETS.images,
        "zychat/chat-images",
        "image"
    );
};

/**
 * Upload group icon
 */
export const uploadGroupIcon = async (file) => {
    return uploadToCloudinary(
        file,
        UPLOAD_PRESETS.groupIcon,
        "zychat/group-icons",
        "image"
    );
};

/**
 * Upload audio file
 */
export const uploadAudio = async (file) => {
    return uploadToCloudinary(
        file,
        UPLOAD_PRESETS.audio,
        "zychat/audio",
        "video" // Cloudinary uses video endpoint for audio
    );
};

/**
 * Upload general file
 */
export const uploadFile = async (file) => {
    return uploadToCloudinary(
        file,
        UPLOAD_PRESETS.file,
        "zychat/files",
        "raw"
    );
};

/**
 * Get optimized image URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
    if (!url || !url.includes("cloudinary")) return url;

    const { width, height, quality = "auto", format = "auto" } = options;

    // Insert transformations before /upload/
    const parts = url.split("/upload/");
    if (parts.length !== 2) return url;

    const transformations = [];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    transformations.push(`q_${quality}`);
    transformations.push(`f_${format}`);
    transformations.push("c_fill");

    return `${parts[0]}/upload/${transformations.join(",")}/${parts[1]}`;
};
