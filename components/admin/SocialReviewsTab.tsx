import React, { useState, useRef } from 'react';
import { SocialReview, Brand } from '../../types';
import { Trash2, Plus, Upload, Loader2, Instagram, Image as ImageIcon } from 'lucide-react';
import { useImageUpload } from '../../hooks/useImageUpload';
import Toast, { ToastType } from '../Toast';

interface SocialReviewsTabProps {
    reviews: SocialReview[];
    setReviews: (reviews: SocialReview[]) => void;
}

const SocialReviewsTab: React.FC<SocialReviewsTabProps> = ({ reviews, setReviews }) => {
    const [newReviewBrand, setNewReviewBrand] = useState<Brand | 'both'>('informa');
    const [newReviewImage, setNewReviewImage] = useState('');
    
    // Hooks para subir imagen
    const { uploadImage, uploading } = useImageUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType } | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setToast({ show: true, message: "La imagen es muy pesada (Máx 5MB)", type: 'error' });
            return;
        }

        const url = await uploadImage(file);
        
        if (url) {
            setNewReviewImage(url);
            setToast({ show: true, message: "Captura subida correctamente", type: 'success' });
        } else {
            setToast({ show: true, message: "Error al subir imagen", type: 'error' });
        }
    };

    const handleAddReview = () => {
        if (!newReviewImage) {
            setToast({ show: true, message: "Debes subir una imagen", type: 'error' });
            return;
        }

        const newReview: SocialReview = {
            id: `REV-${Date.now()}`,
            imageUrl: newReviewImage,
            brand: newReviewBrand
        };

        setReviews([newReview, ...reviews]);
        setNewReviewImage('');
        setToast({ show: true, message: "Reseña agregada al carrusel", type: 'success' });
    };

    const handleDeleteReview = (id: string) => {
        if (window.confirm('¿Eliminar esta reseña?')) {
            setReviews(reviews.filter(r => r.id !== id));
        }
    };

    return (
        <div className="animate-fade-in relative">
            {toast?.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white italic">TESTIMONIOS Y <span className="text-[#ccff00]">RESEÑAS</span></h1>
                    <p className="text-zinc-500 text-sm">Sube capturas de Instagram Stories o Chats de clientes felices.</p>
                </div>
            </div>

            {/* FORMULARIO DE CARGA */}
            <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-2xl mb-8 flex flex-col md:flex-row gap-6 items-end">
                
                {/* Preview de Imagen */}
                <div className="w-full md:w-48 h-64 bg-black/40 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden relative group">
                    {newReviewImage ? (
                        <img src={newReviewImage} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                        <div className="text-zinc-600 flex flex-col items-center">
                            <ImageIcon className="w-8 h-8 mb-2" />
                            <span className="text-xs">Sin Imagen</span>
                        </div>
                    )}
                    
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold gap-2"
                    >
                        {uploading ? <Loader2 className="animate-spin" /> : <Upload />} Subir
                    </button>
                </div>

                {/* Controles */}
                <div className="flex-1 w-full space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 mb-1">Marca asociada</label>
                        <select 
                            value={newReviewBrand}
                            onChange={(e) => setNewReviewBrand(e.target.value as any)}
                            className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#ccff00]"
                        >
                            <option value="informa">In Forma</option>
                            <option value="phisis">Phisis</option>
                            <option value="iqual">Phisis Fragancias</option>
                            <option value="biofarma">BioFarma</option>
                            <option value="both">General / Todas</option>
                        </select>
                    </div>

                    <button 
                        onClick={handleAddReview}
                        disabled={!newReviewImage}
                        className="w-full bg-[#ccff00] text-black font-bold py-3 rounded-xl hover:bg-[#b3e600] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> AGREGAR TESTIMONIO
                    </button>
                    <p className="text-xs text-zinc-500 text-center">
                        Tip: Usa capturas verticales (formato historia) para mejor resultado.
                    </p>
                </div>
            </div>

            {/* LISTA DE RESEÑAS */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {reviews.map(review => (
                    <div key={review.id} className="relative group rounded-xl overflow-hidden border border-white/10">
                        <img src={review.imageUrl} alt="Review" className="w-full h-auto object-cover aspect-[9/16]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-100 transition-opacity flex flex-col justify-end p-3">
                            <span className={`text-[10px] font-bold uppercase mb-2 ${
                                review.brand === 'informa' ? 'text-[#ccff00]' :
                                review.brand === 'phisis' ? 'text-emerald-400' :
                                review.brand === 'iqual' ? 'text-indigo-400' : 
                                review.brand === 'biofarma' ? 'text-blue-400' : 'text-white'
                            }`}>
                                {review.brand === 'both' ? 'General' : review.brand}
                            </span>
                            <button 
                                onClick={() => handleDeleteReview(review.id)}
                                className="w-full bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors"
                            >
                                <Trash2 className="w-3 h-3" /> Eliminar
                            </button>
                        </div>
                        <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full">
                            <Instagram className="w-3 h-3 text-white" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SocialReviewsTab;
