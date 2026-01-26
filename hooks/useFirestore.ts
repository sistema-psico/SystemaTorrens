import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export function useFirestore<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    
    const docRef = doc(db, "app_data", key);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setStoredValue(docSnap.data().value as T);
      } else {
        // Si no existen datos (primera vez), subimos los iniciales
        setDoc(docRef, { value: initialValue })
          .catch(e => console.error("Error migrando datos:", e));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [key]);

  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      const docRef = doc(db, "app_data", key);
      await setDoc(docRef, { value: valueToStore });
    } catch (error) {
      console.error(`Error guardando en Firestore clave "${key}":`, error);
    }
  };

  return [storedValue, setValue, loading] as const;
}
