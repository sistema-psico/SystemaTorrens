import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const InstallAppButton: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            // Prevenir que el navegador muestre el prompt nativo inmediatamente
            e.preventDefault();
            // Guardar el evento para dispararlo después cuando el usuario haga click
            setDeferredPrompt(e);
            // Mostrar nuestro botón personalizado
            setShowButton(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // También escuchamos si la app ya fue instalada para ocultar el botón
        window.addEventListener('appinstalled', () => {
            setShowButton(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', () => {});
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Mostrar el prompt nativo de instalación
        deferredPrompt.prompt();

        // Esperar la respuesta del usuario
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowButton(false);
        }
    };

    if (!showButton) return null;

    return (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 animate-fade-in">
             {/* Opción para cerrar el aviso si molesta */}
             <button 
                onClick={() => setShowButton(false)} 
                className="bg-black/50 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors backdrop-blur-sm"
             >
                <X className="w-3 h-3" />
             </button>
             
             <button
                onClick={handleInstallClick}
                className="bg-white text-black px-5 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform flex items-center gap-2 border border-white/20 backdrop-blur-md"
            >
                <Download className="w-4 h-4" /> INSTALAR APP
            </button>
        </div>
    );
};

export default InstallAppButton;