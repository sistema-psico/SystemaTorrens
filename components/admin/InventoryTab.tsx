import React, { useState, useRef } from 'react';
import { Product, Brand, Reseller } from '../../types';
import { 
    Search, Plus, Edit2, Trash2, Eye, EyeOff, Upload, Loader2, Image as ImageIcon
} from 'lucide-react';
import Toast, { ToastType } from '../Toast';
import { useImageUpload } from '../../hooks/useImageUpload';

interface InventoryTabProps {
    products: Product[];
    setProducts: (products: Product[]) => void;
    resellers: Reseller[];
}

const InventoryTab: React.FC<InventoryTabProps> = ({ products, setProducts, resellers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBrand, setFilterBrand] = useState<Brand | 'all'>('all');
    
    // Modal State
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

    // Hooks
    const { uploadImage, uploading } = useImageUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Toast State
    const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType } | null>(null);
    const showToast = (message: string, type: ToastType = 'error') => {
        setToast({ show: true, message, type });
    };

    // --- HANDLERS ---

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamaño (ej: máx 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showToast("La imagen es muy pesada (Máx 2MB)", 'error');
            return;
        }

        // CORRECCIÓN AQUÍ: Se eliminó el segundo argumento 'products'
        const url = await uploadImage(file);
        
        if (url) {
            setCurrentProduct(prev => ({ ...prev, image: url }));
            showToast("Imagen subida correctamente", 'success');
        } else {
            showToast("Error al subir imagen", 'error');
        }
    };

    const handleSaveProduct = () => {
        if (!currentProduct.name || !currentProduct.price) {
            showToast("Nombre y Precio son obligatorios", 'error');
            return;
        }
        
        const featuresArray = typeof currentProduct.features === 'string' 
            ? (currentProduct.features as string).split(',').map(s => s.trim()) 
            : currentProduct.features || [];
            
        const productToSave: Product = {
            id: currentProduct.id || Date.now().toString(),
            name: currentProduct.name,
            description: currentProduct.description || '',
            longDescription: currentProduct.longDescription || '',
            price: Number(currentProduct.price),
            brand: currentProduct.brand || 'informa',
            category: currentProduct.category || 'Todos',
            image: currentProduct.image || '/images/placeholder.jpg',
            features: featuresArray,
            stock: Number(currentProduct.stock) || 0,
            active: currentProduct.active ?? true
        };

        if (currentProduct.id) {
            setProducts(products.map(p => p.id === productToSave.id ? productToSave : p));
            showToast("Producto actualizado", 'success');
        } else {
            setProducts([...products, productToSave]);
            showToast("Producto creado", 'success');
        }
        
        setIsEditing(false);
        setCurrentProduct({});
    };

    const toggleProductActive = (id: string) => {
        setProducts(products.map(p => p.id === id ? { ...p, active: !p.active } : p));
    };

    const handleDeleteProduct = (id: string) => {
        const resellersWithStock = resellers.filter(r => r.stock.some(s => s.id === id && s.stock > 0));
        if (resellersWithStock.length > 0) {
            showToast(`No se puede borrar. ${resellersWithStock.length} revendedores tienen stock.`, 'error');
            return;
        }

        const hasPendingOrders = resellers.some(r => r.orders.some(o => (o.status === 'Pendiente' || o.status === 'En Camino') && o.items.some(i => i.id === id)));
        if (hasPendingOrders) {
             showToast("No se puede borrar. Hay pedidos activos con este producto.", 'error');
             return;
        }

        if (window.confirm('⚠️ ¿Estás seguro de eliminar este producto permanentemente?')) {
            setProducts(products.filter(p => p.id !== id));
            showToast("Producto eliminado", 'info');
        }
    };

    const filteredInventory = products.filter(p => {
        if (filterBrand !== 'all' && p.brand !== filterBrand) return false;
        if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="animate-fade-in">
            {toast?.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white italic">GESTIÓN DE <span className="text-[#ccff00]">INVENTARIO</span></h1>
                    <p className="text-sm text-zinc-500 mt-1">Administra tus productos y stock</p>
                </div>
                
                <div className="flex gap-3">
                    <div className="relative">
                        <select 
                            value={filterBrand}
                            onChange={(e) => setFilterBrand(e.target.value as any)}
                            className="bg-zinc-800 border border-white/10 text-white px-4 py-2 rounded-lg outline-none focus:border-[#ccff00] h-full"
                        >
                            <option value="all">Todas las Marcas</option>
                            <option value="informa">In Forma</option>
                            <option value="phisis">Phisis</option>
                            <option value="iqual">Iqual</option>
                            <option value="biofarma">BioFarma</option>
                        </select>
                    </div>
                    
                    <button 
                        onClick={() => { setCurrentProduct({ brand: 'informa', active: true, stock: 10, category: 'Alto Rendimiento' }); setIsEditing(true); }}
                        className="bg-[#ccff00] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#b3e600] flex items-center gap-2 hover:scale-105 transition-all"
                    >
                        <Plus className="w-5 h-5" /> Nuevo Producto
                    </button>
                </div>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                <input type="text" placeholder="Buscar producto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black/40 border border-white/10 pl-10 pr-4 py-3 rounded-xl text-white outline-none focus:border-[#ccff00]" />
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-black/40 text-zinc-400 text-sm">
                        <tr>
                            <th className="px-6 py-4">Producto</th>
                            <th className="px-6 py-4">Marca</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4">Precio</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredInventory.map(product => (
                            <tr key={product.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <img src={product.image} className="w-10 h-10 rounded-lg object-cover bg-zinc-800" alt={product.name} />
                                    <div className="font-bold text-white">{product.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${product.brand === 'informa' ? 'bg-zinc-800 text-zinc-400' : product.brand === 'iqual' ? 'bg-indigo-900/40 text-indigo-300' : product.brand === 'biofarma' ? 'bg-blue-900/40 text-blue-300' : 'bg-emerald-900/40 text-emerald-300'}`}>{product.brand}</span>
                                </td>
                                <td className="px-6 py-4 text-zinc-300 font-mono">{product.stock}</td>
                                <td className="px-6 py-4 text-[#ccff00] font-bold">${product.price.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => toggleProductActive(product.id)} className={`flex items-center gap-2 px-2 py-1 rounded text-[10px] font-bold border ${product.active ? 'bg-green-900/20 text-green-400 border-green-900/30' : 'bg-red-900/20 text-red-400 border-red-900/30'}`}>
                                        {product.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />} {product.active ? 'VISIBLE' : 'OCULTO'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => { setCurrentProduct({...product}); setIsEditing(true); }} className="text-blue-400 p-2 hover:bg-white/5 rounded"><Edit2 className="w-4 h-4"/></button>
                                        <button onClick={() => handleDeleteProduct(product.id)} className="text-red-400 p-2 hover:bg-white/5 rounded"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* PRODUCT MODAL */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-black text-white italic mb-6">EDITAR <span className="text-[#ccff00]">PRODUCTO</span></h3>
                        
                        <div className="space-y-4">
                            
                            {/* IMAGEN DEL PRODUCTO CON UPLOAD */}
                            <div className="flex items-center gap-4 mb-4 bg-black/40 p-4 rounded-xl border border-white/5">
                                <div className="w-20 h-20 bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden border border-white/10">
                                    {currentProduct.image ? (
                                        <img src={currentProduct.image} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-zinc-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-zinc-400 mb-1">Imagen del Producto</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Pegar URL o subir archivo..." 
                                            className="flex-1 bg-black/50 border border-white/10 p-2 rounded-lg text-white text-xs outline-none focus:border-[#ccff00]" 
                                            value={currentProduct.image || ''} 
                                            onChange={e => setCurrentProduct({...currentProduct, image: e.target.value})} 
                                        />
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
                                            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                                            title="Subir desde dispositivo"
                                        >
                                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-zinc-600 mt-1">Formatos: JPG, PNG, WEBP (Máx 2MB)</p>
                                </div>
                            </div>

                            {/* Resto de campos */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-1">Nombre del Producto</label>
                                <input type="text" placeholder="Nombre" className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#ccff00]" value={currentProduct.name || ''} onChange={e=>setCurrentProduct({...currentProduct, name: e.target.value})} />
                            </div>
                            
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold text-zinc-400 mb-1">Precio</label>
                                    <input type="number" placeholder="Precio" className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#ccff00]" value={currentProduct.price || 0} onChange={e=>setCurrentProduct({...currentProduct, price: Number(e.target.value)})} />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold text-zinc-400 mb-1">Stock</label>
                                    <input type="number" placeholder="Stock" className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#ccff00]" value={currentProduct.stock || 0} onChange={e=>setCurrentProduct({...currentProduct, stock: Number(e.target.value)})} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-1">Marca</label>
                                <select 
                                    value={currentProduct.brand} 
                                    onChange={e=>setCurrentProduct({...currentProduct, brand: e.target.value as any})}
                                    className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#ccff00]"
                                >
                                    <option value="informa">In Forma</option>
                                    <option value="phisis">Phisis</option>
                                    <option value="iqual">Iqual</option>
                                    <option value="biofarma">BioFarma</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-1">Categoría</label>
                                <input type="text" placeholder="Categoría" className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#ccff00]" value={currentProduct.category || ''} onChange={e=>setCurrentProduct({...currentProduct, category: e.target.value})} />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-1">Descripción Corta</label>
                                <textarea rows={2} placeholder="Descripción" className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#ccff00]" value={currentProduct.description || ''} onChange={e=>setCurrentProduct({...currentProduct, description: e.target.value})} />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-1">Descripción Detallada (Modal)</label>
                                <textarea rows={4} placeholder="Descripción completa que aparece en el detalle..." className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#ccff00]" value={currentProduct.longDescription || ''} onChange={e=>setCurrentProduct({...currentProduct, longDescription: e.target.value})} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-8">
                            <button onClick={()=>setIsEditing(false)} className="text-zinc-400 px-4 py-2 hover:bg-white/5 rounded-xl">Cancelar</button>
                            <button onClick={handleSaveProduct} className="bg-[#ccff00] text-black px-6 py-2 rounded-xl font-bold shadow-lg">Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryTab;
