import React, { useState, useEffect } from 'react';
import { SiteContent, ContactInfo, PaymentConfig } from '../../types';
import { 
    Upload, Image, Banknote, CreditCard, Wallet, Save, Loader2, Percent, Users
} from 'lucide-react';
import Toast, { ToastType } from '../Toast';

interface SettingsTabProps {
    siteContent: SiteContent;
    setSiteContent: (content: SiteContent) => void;
    contactInfo: ContactInfo;
    setContactInfo: (info: ContactInfo) => void;
    paymentConfig: PaymentConfig;
    setPaymentConfig: (config: PaymentConfig) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ 
    siteContent, setSiteContent, 
    contactInfo, setContactInfo, 
    paymentConfig, setPaymentConfig 
}) => {
    const [localSiteContent, setLocalSiteContent] = useState<SiteContent>(siteContent);
    const [localContactInfo, setLocalContactInfo] = useState<ContactInfo>(contactInfo);
    const [localPaymentConfig, setLocalPaymentConfig] = useState<PaymentConfig>(paymentConfig);
    
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType } | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setLocalSiteContent(siteContent);
        setLocalContactInfo(contactInfo);
        setLocalPaymentConfig(paymentConfig);
    }, []);

    useEffect(() => {
        setHasChanges(true);
    }, [localSiteContent, localContactInfo, localPaymentConfig]);

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            setSiteContent(localSiteContent);
            setContactInfo(localContactInfo);
            setPaymentConfig(localPaymentConfig);
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setToast({ show: true, message: "Configuración guardada correctamente", type: 'success' });
            setHasChanges(false);
        } catch (error) {
            setToast({ show: true, message: "Error al guardar configuración", type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldKey: keyof SiteContent) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalSiteContent({ ...localSiteContent, [fieldKey]: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="animate-fade-in space-y-12 pb-32 relative">
             {toast?.show && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}

            <div className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${hasChanges ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                <button 
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="bg-[#ccff00] text-black px-8 py-4 rounded-full font-black shadow-[0_0_20px_rgba(204,255,0,0.4)] flex items-center gap-3 hover:scale-105 transition-transform disabled:opacity-70 disabled:cursor-not-allowed border-2 border-black"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    GUARDAR CAMBIOS
                </button>
            </div>

             {/* NUEVA SECCIÓN: CONTROL DE PRECIOS */}
             <div>
                <h1 className="text-3xl font-black text-white italic mb-6">POLÍTICA DE <span className="text-[#ccff00]">PRECIOS</span></h1>
                <div className="bg-zinc-900/40 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Descuento Revendedores */}
                    <div className="p-6 bg-blue-900/10 border border-blue-500/30 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Percent className="w-24 h-24 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-400" /> Margen Revendedores
                        </h3>
                        <p className="text-sm text-zinc-400 mb-6">Porcentaje de descuento automático aplicado a los pedidos de reposición de tus partners.</p>
                        
                        <div className="flex items-center gap-4">
                            <input 
                                type="number" 
                                min="0" 
                                max="100"
                                value={localSiteContent.resellerDiscount || 0}
                                onChange={(e) => setLocalSiteContent({...localSiteContent, resellerDiscount: Number(e.target.value)})}
                                className="w-24 text-3xl font-black bg-black/50 border border-blue-500/50 rounded-xl p-3 text-center text-blue-400 outline-none focus:border-blue-400"
                            />
                            <span className="text-4xl font-black text-zinc-600">%</span>
                        </div>
                    </div>

                    {/* Oferta Global (Eventual) */}
                    <div className="p-6 bg-[#ccff00]/5 border border-[#ccff00]/20 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Percent className="w-24 h-24 text-[#ccff00]" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <Banknote className="w-5 h-5 text-[#ccff00]" /> Oferta Global (Hot Sale)
                        </h3>
                        <p className="text-sm text-zinc-400 mb-6">Descuento extra aplicado a TODO el catálogo público (Eventos especiales). Dejar en 0 para desactivar.</p>
                        
                        <div className="flex items-center gap-4">
                            <input 
                                type="number" 
                                min="0" 
                                max="100"
                                value={localSiteContent.globalOfferDiscount || 0}
                                onChange={(e) => setLocalSiteContent({...localSiteContent, globalOfferDiscount: Number(e.target.value)})}
                                className="w-24 text-3xl font-black bg-black/50 border border-[#ccff00]/50 rounded-xl p-3 text-center text-[#ccff00] outline-none focus:border-[#ccff00]"
                            />
                            <span className="text-4xl font-black text-zinc-600">%</span>
                        </div>
                    </div>

                </div>
             </div>

             {/* 1. Logos Configuration Section */}
             <div>
                <div className="flex justify-between items-end mb-6">
                    <h1 className="text-3xl font-black text-white italic">LOGOS E <span className="text-[#ccff00]">IDENTIDAD</span></h1>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'In Forma', key: 'logoInforma', color: 'bg-[#ccff00]' },
                        { label: 'Phisis', key: 'logoPhisis', color: 'bg-emerald-500' },
                        { label: 'Iqual', key: 'logoIqual', color: 'bg-indigo-500' },
                        { label: 'BioFarma', key: 'logoBiofarma', color: 'bg-blue-500' },
                    ].map((brand) => (
                        <div key={brand.key} className="bg-zinc-900/40 backdrop-blur-md p-4 rounded-xl border border-white/5 shadow-xl space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                 <div className={`w-3 h-3 rounded-full ${brand.color}`}></div>
                                 <h3 className="font-bold text-white">{brand.label}</h3>
                            </div>
                            <div className="h-24 bg-black/50 rounded flex items-center justify-center border border-dashed border-white/10 mb-2 overflow-hidden">
                                {localSiteContent[brand.key as keyof SiteContent] ? (
                                    <img src={localSiteContent[brand.key as keyof SiteContent] as string} className="h-full object-contain" alt={brand.label} />
                                ) : (
                                    <span className="text-xs text-zinc-500">Sin Logo</span>
                                )}
                            </div>
                            <input 
                                type="text" 
                                placeholder="URL del logo" 
                                value={localSiteContent[brand.key as keyof SiteContent] as string || ''}
                                onChange={(e) => setLocalSiteContent({...localSiteContent, [brand.key]: e.target.value})}
                                className="w-full text-xs bg-black/50 border border-white/10 p-2 rounded text-white outline-none focus:border-white/20" 
                            />
                            <div className="relative">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => handleLogoUpload(e, brand.key as keyof SiteContent)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <button className="w-full bg-white/5 hover:bg-white/10 text-zinc-300 text-xs py-2 rounded flex items-center justify-center gap-2 transition-colors">
                                    <Upload className="w-3 h-3" /> Subir Archivo
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
             </div>

             {/* 1.5 Background Images Configuration Section */}
             <div>
                <h1 className="text-3xl font-black text-white italic mb-6">FONDOS DE <span className="text-[#ccff00]">PANTALLA</span></h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Fondo In Forma', key: 'sportsHeroBg', color: 'bg-[#ccff00]' },
                        { label: 'Fondo Phisis', key: 'beautyHeroBg', color: 'bg-emerald-500' },
                        { label: 'Fondo Iqual', key: 'fragranceHeroBg', color: 'bg-indigo-500' },
                        { label: 'Fondo BioFarma', key: 'bioHeroBg', color: 'bg-blue-500' },
                    ].map((brand) => (
                        <div key={brand.key} className="bg-zinc-900/40 backdrop-blur-md p-4 rounded-xl border border-white/5 shadow-xl space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                 <div className={`w-3 h-3 rounded-full ${brand.color}`}></div>
                                 <h3 className="font-bold text-white">{brand.label}</h3>
                            </div>
                            <div className="h-24 bg-black/50 rounded flex items-center justify-center border border-dashed border-white/10 mb-2 overflow-hidden relative group">
                                {localSiteContent[brand.key as keyof SiteContent] ? (
                                    <img src={localSiteContent[brand.key as keyof SiteContent] as string} className="w-full h-full object-cover opacity-60" alt={brand.label} />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Image className="w-6 h-6 text-zinc-600 mb-1" />
                                        <span className="text-xs text-zinc-500">Sin Fondo</span>
                                    </div>
                                )}
                            </div>
                            <input 
                                type="text" 
                                placeholder="URL de la imagen" 
                                value={localSiteContent[brand.key as keyof SiteContent] as string || ''}
                                onChange={(e) => setLocalSiteContent({...localSiteContent, [brand.key]: e.target.value})}
                                className="w-full text-xs bg-black/50 border border-white/10 p-2 rounded text-white outline-none focus:border-white/20" 
                            />
                            <div className="relative">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => handleLogoUpload(e, brand.key as keyof SiteContent)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <button className="w-full bg-white/5 hover:bg-white/10 text-zinc-300 text-xs py-2 rounded flex items-center justify-center gap-2 transition-colors">
                                    <Upload className="w-3 h-3" /> Subir Imagen Local
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
             </div>

             {/* 2. CMS Text Configuration */}
             <div>
                <h1 className="text-3xl font-black text-white italic mb-6">PERSONALIZAR <span className="text-[#ccff00]">TEXTOS</span></h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* In Forma */}
                    <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/5 space-y-4">
                        <h3 className="text-[#ccff00] font-bold uppercase tracking-widest text-sm border-b border-white/10 pb-2">Sección Deportes (In Forma)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Título 1</label>
                                <input type="text" value={localSiteContent.sportsHeroTitle1} onChange={(e) => setLocalSiteContent({...localSiteContent, sportsHeroTitle1: e.target.value})} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Título 2 (Color)</label>
                                <input type="text" value={localSiteContent.sportsHeroTitle2} onChange={(e) => setLocalSiteContent({...localSiteContent, sportsHeroTitle2: e.target.value})} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1">Descripción</label>
                            <textarea rows={3} value={localSiteContent.sportsHeroDescription} onChange={(e) => setLocalSiteContent({...localSiteContent, sportsHeroDescription: e.target.value})} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white outline-none" />
                        </div>
                    </div>

                    {/* Phisis */}
                    <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/5 space-y-4">
                        <h3 className="text-emerald-500 font-bold uppercase tracking-widest text-sm border-b border-white/10 pb-2">Sección Nutricosmética (Phisis)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Título 1</label>
                                <input type="text" value={localSiteContent.beautyHeroTitle1} onChange={(e) => setLocalSiteContent({...localSiteContent, beautyHeroTitle1: e.target.value})} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Título 2 (Italic)</label>
                                <input type="text" value={localSiteContent.beautyHeroTitle2} onChange={(e) => setLocalSiteContent({...localSiteContent, beautyHeroTitle2: e.target.value})} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1">Descripción</label>
                            <textarea rows={3} value={localSiteContent.beautyHeroDescription} onChange={(e) => setLocalSiteContent({...localSiteContent, beautyHeroDescription: e.target.value})} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white outline-none" />
                        </div>
                    </div>

                    {/* Iqual */}
                    <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/5 space-y-4">
                        <h3 className="text-indigo-500 font-bold uppercase tracking-widest text-sm border-b border-white/10 pb-2">Sección Fragancias (Iqual)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Título 1</label>
                                <input type="text" value={localSiteContent.fragranceHeroTitle1} onChange={(e) => setLocalSiteContent({...localSiteContent, fragranceHeroTitle1: e.target.value})} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Título 2 (Color)</label>
                                <input type="text" value={localSiteContent.fragranceHeroTitle2} onChange={(e) => setLocalSiteContent({...localSiteContent, fragranceHeroTitle2: e.target.value})} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1">Descripción</label>
                            <textarea rows={3} value={localSiteContent.fragranceHeroDescription} onChange={(e) => setLocalSiteContent({...localSiteContent, fragranceHeroDescription: e.target.value})} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white outline-none" />
                        </div>
                    </div>

                    {/* BioFarma */}
                    <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/5 space-y-4">
                        <h3 className="text-blue-500 font-bold uppercase tracking-widest text-sm border-b border-white/10 pb-2">Sección Salud (BioFarma)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Título 1</label>
                                <input type="text" value={localSiteContent.bioHeroTitle1} onChange={(e) => setLocalSiteContent({...localSiteContent, bioHeroTitle1: e.target.value})} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Título 2 (Color)</label>
                                <input type="text" value={localSiteContent.bioHeroTitle2} onChange={(e) => setLocalSiteContent({...localSiteContent, bioHeroTitle2: e.target.value})} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1">Descripción</label>
                            <textarea rows={3} value={localSiteContent.bioHeroDescription} onChange={(e) => setLocalSiteContent({...localSiteContent, bioHeroDescription: e.target.value})} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white outline-none" />
                        </div>
                    </div>

                </div>
             </div>

             {/* 3. Contact Info */}
             <div>
                <h1 className="text-3xl font-black text-white italic mb-6">DATOS DE <span className="text-[#ccff00]">CONTACTO</span></h1>
                <div className="bg-zinc-900/40 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Correo Electrónico</label>
                            <input 
                                type="email" 
                                value={localContactInfo.email}
                                onChange={(e) => setLocalContactInfo({...localContactInfo, email: e.target.value})}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#ccff00] focus:border-transparent outline-none text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Teléfono (WhatsApp)</label>
                            <input 
                                type="text" 
                                value={localContactInfo.phone}
                                onChange={(e) => setLocalContactInfo({...localContactInfo, phone: e.target.value})}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#ccff00] focus:border-transparent outline-none text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Dirección Comercial</label>
                            <input 
                                type="text" 
                                value={localContactInfo.address}
                                onChange={(e) => setLocalContactInfo({...localContactInfo, address: e.target.value})}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#ccff00] focus:border-transparent outline-none text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Instagram</label>
                            <input 
                                type="text" 
                                value={localContactInfo.instagram}
                                onChange={(e) => setLocalContactInfo({...localContactInfo, instagram: e.target.value})}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#ccff00] focus:border-transparent outline-none text-white"
                            />
                        </div>
                    </div>
                </div>
             </div>

             {/* 4. Payment Configuration */}
             <div>
                <h1 className="text-3xl font-black text-white italic mb-6">MÉTODOS DE <span className="text-[#ccff00]">PAGO</span></h1>
                <div className="bg-zinc-900/40 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/5 space-y-6">
                    
                    {/* Transfer Config */}
                    <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Banknote className="w-5 h-5 text-zinc-400" /> Transferencia Bancaria
                            </h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={localPaymentConfig.transfer.enabled} onChange={() => setLocalPaymentConfig({...localPaymentConfig, transfer: {...localPaymentConfig.transfer, enabled: !localPaymentConfig.transfer.enabled}})} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ccff00]"></div>
                            </label>
                        </div>
                        {localPaymentConfig.transfer.enabled && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Nombre Banco" value={localPaymentConfig.transfer.bankName} onChange={(e) => setLocalPaymentConfig({...localPaymentConfig, transfer: {...localPaymentConfig.transfer, bankName: e.target.value}})} className="bg-black/50 border border-white/10 p-2 rounded text-white text-sm" />
                                <input type="text" placeholder="Alias (CBU)" value={localPaymentConfig.transfer.alias} onChange={(e) => setLocalPaymentConfig({...localPaymentConfig, transfer: {...localPaymentConfig.transfer, alias: e.target.value}})} className="bg-black/50 border border-white/10 p-2 rounded text-white text-sm" />
                                <input type="text" placeholder="Titular" value={localPaymentConfig.transfer.holderName} onChange={(e) => setLocalPaymentConfig({...localPaymentConfig, transfer: {...localPaymentConfig.transfer, holderName: e.target.value}})} className="bg-black/50 border border-white/10 p-2 rounded text-white text-sm" />
                                <input type="text" placeholder="CBU numérico" value={localPaymentConfig.transfer.cbu} onChange={(e) => setLocalPaymentConfig({...localPaymentConfig, transfer: {...localPaymentConfig.transfer, cbu: e.target.value}})} className="bg-black/50 border border-white/10 p-2 rounded text-white text-sm" />
                            </div>
                        )}
                    </div>

                    {/* Card & Cash Toggles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-black/20 rounded-xl border border-white/5 flex items-center justify-between">
                            <h3 className="font-bold text-white flex items-center gap-2"><CreditCard className="w-5 h-5 text-zinc-400" /> Tarjetas</h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={localPaymentConfig.card.enabled} onChange={() => setLocalPaymentConfig({...localPaymentConfig, card: {...localPaymentConfig.card, enabled: !localPaymentConfig.card.enabled}})} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ccff00]"></div>
                            </label>
                        </div>
                        <div className="p-4 bg-black/20 rounded-xl border border-white/5 flex items-center justify-between">
                            <h3 className="font-bold text-white flex items-center gap-2"><Wallet className="w-5 h-5 text-zinc-400" /> Efectivo</h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={localPaymentConfig.cash.enabled} onChange={() => setLocalPaymentConfig({...localPaymentConfig, cash: {...localPaymentConfig.cash, enabled: !localPaymentConfig.cash.enabled}})} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ccff00]"></div>
                            </label>
                        </div>
                    </div>
                </div>
             </div>

          </div>
    );
};

export default SettingsTab;
