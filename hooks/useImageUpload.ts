import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

export const useImageUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadImage = async (file: File, folder: string = 'products'): Promise<string | null> => {
        setUploading(true);
        setError(null);
        try {
            // Generar un nombre único para evitar colisiones
            const fileName = `${Date.now()}_${file.name}`;
            const storageRef = ref(storage, `${folder}/${fileName}`);
            
            // Subir el archivo
            await uploadBytes(storageRef, file);
            
            // Obtener la URL pública
            const url = await getDownloadURL(storageRef);
            setUploading(false);
            return url;
        } catch (err: any) {
            console.error("Error subiendo imagen:", err);
            setError("Error al subir la imagen. Intenta de nuevo.");
            setUploading(false);
            return null;
        }
    };

    return { uploadImage, uploading, error };
};
