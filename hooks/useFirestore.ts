import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

// Este hook sincroniza tus datos con la nube (Firestore)
export function useFirestore<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Referencia al documento en la colección 'app_data' con el nombre de la clave (ej: 'products')
    const docRef = doc(db, "app_data", key);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        // Si ya hay datos en la nube, los usamos
        setStoredValue(docSnap.data().value as T);
      } else {
        // Si NO hay datos (es la primera vez), subimos los datos iniciales automáticamente
        setDoc(docRef, { value: initialValue })
          .then(() => console.log(`Datos iniciales migrados para: ${key}`))
          .catch(e => console.error("Error migrando datos:", e));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [key]); // Dependencia clave

  // Función para guardar datos (reemplaza el estado local y actualiza Firebase)
  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Actualizamos estado local para respuesta rápida
      setStoredValue(valueToStore);
      // Guardamos en la nube
      const docRef = doc(db, "app_data", key);
      await setDoc(docRef, { value: valueToStore });
    } catch (error) {
      console.error(`Error guardando en Firestore clave "${key}":`, error);
    }
  };

  return [storedValue, setValue, loading] as const;
}