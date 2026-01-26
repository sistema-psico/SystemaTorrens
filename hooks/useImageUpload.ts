import { useState } from 'react';

export const useImageUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadImage = async (file: File): Promise<string | null> => {
        setUploading(true);
        setError(null);

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            console.error("Faltan las credenciales de Cloudinary en el archivo .env");
            setError("Error de configuración del servidor.");
            setUploading(false);
            return null;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        // Opcional: Organizar en carpeta 'products' dentro de Cloudinary
        formData.append('folder', 'products'); 

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error('Error en la subida a Cloudinary');
            }

            const data = await response.json();
            setUploading(false);
            // Cloudinary devuelve la URL segura en 'secure_url'
            return data.secure_url; 

        } catch (err: any) {
            console.error("Error subiendo imagen:", err);
            setError("Error al subir la imagen. Intenta de nuevo.");
            setUploading(false);
            return null;
        }
    };

    return { uploadImage, uploading, error };
};
