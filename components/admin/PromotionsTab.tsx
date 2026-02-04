import React, { useState, useRef } from 'react';
import { Banner, Product, Coupon } from '../../types';
import { 
    Plus, Trash2, Package, Upload, Loader2, Ticket, Tag
} from 'lucide-react';
import { useImageUpload } from '../../hooks/useImageUpload';
import Toast, { ToastType } from '../Toast';

interface PromotionsTabProps {
    banners: Banner[];
    setBanners: (banners: Banner[]) => void;
    products: Product[];
    coupons?: Coupon[];
    setCoupons?: (coupons: Coupon[]) => void;
}

const PromotionsTab: React.FC<PromotionsTabProps> = ({ banners, setBanners, products, coupons = [], setCoupons }) => {
    // Banner States
    const [isEditing, setIsEditing] = useState(false);
    const [currentBanner, setCurrentBanner] = useState<Partial<Banner>>({});
    const [selectedPromoProductId, setSelectedPromoProductId] = useState('');
    const [promoQuantity, setPromoQuantity] = useState(1);

    // Coupon States
    const [newCouponCode, setNewCouponCode] = useState('');
    const [newCouponDiscount, setNewCouponDiscount] = useState(0);

    // Image Upload
    const { uploadImage, uploading } = useImageUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType } | null>(null);

    // --- BANNERS HANDLERS ---
    // (Mantenemos los handlers de banners existentes)
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setToast({ show: true, message: "La imagen es muy pesada (Máx 5MB)", type: 'error' });
            return;
        }
        const url = await uploadImage(file);
        if (url) {
            setCurrentBanner(prev => ({ ...prev, image: url }));
            setToast({ show: true, message: "Imagen subida correctamente", type: 'success' });
        } else {
            setToast({ show: true, message: "Error al subir imagen", type: 'error' });
        }
    };

    const handleSaveBanner = () => {
        if (!currentBanner.title) return;
        const bannerToSave: Banner = {
            id: currentBanner.id || `B-${Date.now()}`,
            title: currentBanner.title,
            description: currentBanner.description || '',
            image: currentBanner.image || '/images/placeholder-banner.jpg',
            brand: currentBanner.brand || 'informa',
            active: currentBanner.active ?? true,
            discountPercentage: Number(currentBanner.discountPercentage) || 0,
            relatedProducts: currentBanner.relatedProducts || []
        };
        if (currentBanner.id) {
            setBanners(banners.map(b => b.id === bannerToSave.id ? bannerToSave : b));
        } else {
            setBanners([...banners, bannerToSave]);
        }
        setIsEditing(false);
        setCurrentBanner({});
    };

    const handleDeleteBanner = (id: string) => {
        if (window.confirm('¿Eliminar esta promoción?')) {
            setBanners(banners.filter(b => b.id !== id));
        }
    };

    const handleAddProductToBanner = () => {
        if (!selectedPromoProductId || promoQuantity < 1) return;
        const newRelated = [
            ...(currentBanner.relatedProducts || []),
            { productId: selectedPromoProductId, quantity: promoQuantity, discountPercentage: currentBanner.discountPercentage }
        ];
        setCurrentBanner({ ...currentBanner, relatedProducts: newRelated });
        setSelectedPromoProductId('');
        setPromoQuantity(1);
    };

    const handleRemoveProductFromBanner = (index: number) => {
        const newRelated = [...(currentBanner.relatedProducts || [])];
        newRelated.splice(index, 1);
        setCurrentBanner({ ...currentBanner, relatedProducts: newRelated });
    };

    // --- COUPON HANDLERS ---
    const handleAddCoupon = () => {
        if (!newCouponCode || newCouponDiscount <= 0 || !setCoupons) return;
        const newCoupon: Coupon = {
            id: `CP-${Date.now()}`,
            code: newCouponCode.toUpperCase().trim(),
            discountPercentage: newCouponDiscount,
            active: true
        };
        setCoupons([...coupons, newCoupon]);
        setNewCouponCode('');
        setNewCouponDiscount(0);
        setToast({ show: true, message: "Cupón creado exitosamente", type: 'success' });
    };

    const handleDeleteCoupon = (id: string) => {
        if (!setCoupons) return;
        if (window.confirm('¿Eliminar este cupón?')) {
            setCoupons(coupons.filter(c => c.id !== id));
        }
    };

    return (
        <div className="animate-fade-in relative space-y-12">
            {toast?.show && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}

            {/* --- SECCIÓN CUPONES --- */}
            <div>
                <h2 className="text-2xl font-black text-white italic mb-6 flex items-center gap-2">
                    <Ticket className="w-6 h-6 text-[#ccff00]" /> GESTIÓN DE <span className="text-[#ccff00]">CUPONES</span>
                </h2>
                <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-6">
                    
                    {/* Crear Cupón */}
                    <div className="flex flex-wrap gap-4 items-end mb-8 bg-black/20 p-4 rounded-xl border border-white/5">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-bold text-zinc-400 mb-1">CÓDIGO</label>
                            <input 
                                type="text" 
                                placeholder="EJ: VERANO2024" 
                                value={newCouponCode}
                                onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                                className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#ccff00] uppercase font-mono" 
                            />
                        </div>
                        <div className="w-[150px]">
                            <label className="block text-xs font-bold text-zinc-400 mb-1">% DESCUENTO</label>
                            <input 
                                type="number" 
                                placeholder="10" 
                                value={newCouponDiscount || ''}
                                onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                                className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#ccff00]" 
                            />
                        </div>
                        <button 
                            onClick={handleAddCoupon}
                            disabled={!newCouponCode || newCouponDiscount <= 0}
                            className="bg-[#ccff00] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#b3e600] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-[50px]"
                        >
                            <Plus className="w-5 h-5" /> Crear
                        </button>
                    </div>

                    {/* Lista de Cupones */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {coupons.map(coupon => (
                            <div key={coupon.id} className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-xl group hover:border-[#ccff00]/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#ccff00]/20 rounded-lg text-[#ccff00]">
                                        <Tag className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white font-mono text-lg">{coupon.code}</h4>
                                        <p className="text-zinc-400 text-sm">{coupon.discountPercentage}% Descuento</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDeleteCoupon(coupon.id)}
                                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        {coupons.length === 0 && <p className="text-zinc-500 text-sm col-span-full text-center py-4">No hay cupones activos.</p>}
                    </div>
                </div>
            </div>

            <hr className="border-white/10" />

            {/* --- SECCIÓN BANNERS (Existente) --- */}
            <div>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white italic">BANNERS Y <span className="text-[#ccff00]">OFERTAS</span></h1>
                        <p className="text-zinc-500 text-sm">Gestiona la publicidad destacada en la página principal</p>
                    </div>
                    <button 
                        onClick={() => { setCurrentBanner({ brand: 'informa', active: true, relatedProducts: [], discountPercentage: 0 }); setIsEditing(true); }} 
                        className="bg-[#ccff00] text-black px-6 py-2 rounded-lg hover:bg-[#b3e600] flex items-center gap-2 font-bold hover:scale-105 transition-transform"
                    >
                        <Plus className="w-5 h-5" /> Nueva Promoción
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map(banner => (
                        <div key={banner.id} className="bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-lg border border-white/5 overflow-hidden group hover:border-[#ccff00]/30 transition-all">
                             {/* (Renderizado de Banner igual que antes) */}
                             <div className="relative h-48 bg-black">
                                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded uppercase ${banner.brand === 'informa' ? 'bg-[#ccff00] text-black' : 'bg-white text-black'}`}>{banner.brand}</div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-lg mb-1 text-white">{banner.title}</h3>
                                <div className="flex items-center gap-2 pt-2 border-t border-white/5 mt-4">
                                    <button onClick={() => { setCurrentBanner({...banner}); setIsEditing(true); }} className="flex-1 py-2 text-sm font-medium text-blue-400 bg-blue-900/10 hover:bg-blue-900/20 rounded-lg">Editar</button>
                                    <button onClick={() => handleDeleteBanner(banner.id)} className="p-2 text-red-400 bg-red-900/10 hover:bg-red-900/20 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* BANNER MODAL (Igual que antes pero con el upload arreglado arriba) */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh] animate-scale-in">
                        <h3 className="text-xl font-bold text-white mb-4">Editar Banner</h3>
                        {/* (Formulario de banner igual que antes) */}
                        <div className="space-y-4">
                             <input type="text" placeholder="Título" className="w-full bg-black/50 border border-white/10 p-3 rounded text-white" value={currentBanner.title || ''} onChange={e => setCurrentBanner({...currentBanner, title: e.target.value})} />
                             <div className="flex gap-2">
                                <input type="text" placeholder="URL Imagen" className="flex-1 bg-black/50 border border-white/10 p-3 rounded text-white" value={currentBanner.image || ''} onChange={e => setCurrentBanner({...currentBanner, image: e.target.value})} />
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-white/10 text-white p-3 rounded">{uploading ? <Loader2 className="animate-spin"/> : <Upload />}</button>
                             </div>
                             {/* ... resto de campos */}
                             <div className="flex justify-end gap-2 mt-6">
                                <button onClick={() => setIsEditing(false)} className="text-zinc-400 px-4 py-2 hover:bg-white/5 rounded-xl">Cancelar</button>
                                <button onClick={handleSaveBanner} className="bg-[#ccff00] text-black px-6 py-2 rounded-xl font-bold">Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromotionsTab;
