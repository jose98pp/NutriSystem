import { useState, useCallback } from 'react';
import axios from 'axios';

/**
 * Hook for handling file uploads with progress tracking
 * Requirements: 10
 * Task 22: Implementar sincronización de archivos
 */
export const useFileUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    /**
     * Compress image before upload
     */
    const compressImage = async (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            resolve(new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            }));
                        },
                        'image/jpeg',
                        quality
                    );
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    /**
     * Upload file with progress tracking and retry logic
     */
    const uploadFile = useCallback(async (file, endpoint, maxRetries = 3) => {
        let attempt = 0;
        let lastError = null;

        while (attempt < maxRetries) {
            try {
                attempt++;
                setUploading(true);
                setProgress(0);
                setError(null);

                // Compress image before upload
                const compressedFile = await compressImage(file);

                const formData = new FormData();
                formData.append('foto_perfil', compressedFile);

                const response = await axios.post(endpoint, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setProgress(percentCompleted);
                    },
                });

                setProgress(100);
                return response.data;
            } catch (err) {
                lastError = err;
                console.error(`Upload attempt ${attempt} failed:`, err);

                // If this is not the last attempt, wait before retrying
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    setError(err.message || 'Error al subir el archivo');
                    throw err;
                }
            } finally {
                if (attempt >= maxRetries || !lastError) {
                    setUploading(false);
                }
            }
        }

        throw lastError;
    }, []);

    /**
     * Upload profile photo
     */
    const uploadProfilePhoto = useCallback(async (file) => {
        return uploadFile(file, '/api/profile/upload-photo');
    }, [uploadFile]);

    /**
     * Reset upload state
     */
    const reset = useCallback(() => {
        setUploading(false);
        setProgress(0);
        setError(null);
    }, []);

    return {
        uploading,
        progress,
        error,
        uploadFile,
        uploadProfilePhoto,
        reset,
    };
};

export default useFileUpload;
