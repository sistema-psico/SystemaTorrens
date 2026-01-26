
import React, { useState, useEffect } from 'react';
import { Product, Sale, Client, CartItem } from '../../types';
import { Plus, Trash2, X, User, Phone, Mail, CreditCard, ShoppingCart } from 'lucide-react';

interface AdminSalesProps {
    products: Product[];
    setProducts: (products: Product[]) => void;
    adminClients: Client[];
    setAdminClients: (clients: Client[]) => void; // Para actualizar saldo si es necesario
    adminSales: Sale[];
    setAdminSales: (sales: Sale[]) => void;
}

const AdminSales: React.FC<AdminSalesProps> = ({ 
    products, setProducts, adminClients, setAdminClients, adminSales, setAdminSales 
}) => {
    const [isMakingSale, setIsMakingSale] = useState(false);
    const [saleCart, setSaleCart] = useState<CartItem[]>([]);
    
    // Configuración de Venta
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedClientData, setSelectedClientData] = useState<Client | null>(null);
    const [salePaymentMethod, setSalePaymentMethod] = useState<string>('Efectivo');

    // Precargar datos del cliente al seleccionar
    useEffect(() => {
        if (selectedClientId) {
            const client = adminClients.find(c => c.id === selectedClientId);
            if (client) {
                setSelectedClientData(client);
                setSalePaymentMethod(client.paymentMethod);
            }
        } else {
            setSelectedClientData(null);
            setSalePaymentMethod('Efectivo');
        }
    }, [selectedClientId, adminClients]);

    // Lógica de Carrito
    const addToSaleCart = (product: Product) => {
        if (product.stock <= 0) return;
        setSaleCart(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) return prev;
                return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromSaleCart = (id: string) => {
        setSaleCart(prev => prev.filter(p => p.id !== id));
    };

    const confirmSale = () => {
        if (!selectedClientData || saleCart.length === 0) return;
        
        const totalAmount = saleCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        // 1. Crear Venta
        const newSale: Sale = {
            id: `V-ADM-${Date.now()}`,
            clientId: selectedClientData.id,
            clientName: selectedClientData.name,
            date: new Date().toLocaleDateString(),
            items: [...saleCart],
            total: totalAmount,
            paymentMethod: salePaymentMethod
        };

        // 2. Descontar Stock Global
        const updatedProducts = products.map(prod => {
            const cartItem = saleCart.find(c => c.id === prod.id);
            if (cartItem) {
                return { ...prod, stock: Math.max(0, prod.stock - cartItem.quantity) };
            }
            return prod;
        });

        // 3. Guardar
        setAdminSales([newSale, ...adminSales]);
        setProducts(updatedProducts);

        // Reset
        setIsMakingSale(false);
        setSaleCart([]);
        setSelectedClientId('');
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white italic">VENTAS <span className="text-[#ccff00]">DIRECTAS</span></h1>
                    <p className="text-zinc-400 text-sm">Genera ventas manuales descontando del stock global.</p>
                </div>
                <button 
                    onClick={() => setIsMakingSale(true)} 
                    className="bg-[#ccff00] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#b3e600] flex items-center gap-2 hover:scale-105 transition-transform"
                >
                    <Plus className="w-5 h-5" /> Nueva Venta
                </button>
            </div>

            {/* Historial de Ventas Admin */}
            <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-black/40 text-zinc-400 text-sm">
                        <tr>
                            <th className="px-6 py-4">ID Venta</th>
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4">Items</th>
                            <th className="px-6 py-4">Método</th>
                            <th className="px-6 py-4 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {adminSales.map(sale => (
                            <tr key={sale.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-mono text-zinc-500 text-xs">{sale.id}</td>
                                <td className="px-6 py-4 font-bold text-white">{sale.clientName}</td>
                                <td className="px-6 py-4 text-zinc-400">{sale.date}</td>
                                <td className="px-6 py-4 text-zinc-300 text-sm">{sale.items.length} productos</td>
                                <td className="px-6 py-4 text-zinc-400 text-sm">{sale.paymentMethod}</td>
                                <td className="px-6 py-4 text-right font-bold text-[#ccff00]">${sale.total.toLocaleString()}</td>
                            </tr>
                        ))}
                        {adminSales.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                    No hay ventas directas registradas por el administrador.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL NUEVA VENTA */}
            {isMakingSale && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-5xl h-[85vh] flex overflow-hidden animate-scale-in shadow-2xl">
                        
                        {/* IZQUIERDA: Stock Global */}
                        <div className="w-3/5 border-r border-white/10 flex flex-col">
                            <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
                                <h3 className="text-white font-bold">1. Seleccionar Productos (Stock Global)</h3>
                                <input type="text" placeholder="Buscar..." className="bg-black/50 border border-white/10 p-2 rounded-lg text-white outline-none focus:border-[#ccff00] text-sm w-48" />
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
                                {products.map(product => (
                                    <button 
                                        key={product.id} 
                                        onClick={() => addToSaleCart(product)}
                                        disabled={product.stock === 0}
                                        className={`text-left p-3 rounded-xl border transition-all flex gap-3 group relative overflow-hidden ${
                                            product.stock === 0 
                                            ? 'opacity-50 border-white/5 bg-black/20 cursor-not-allowed' 
                                            : 'border-white/10 bg-black/40 hover:border-[#ccff00]/50 hover:bg-white/5'
                                        }`}
                                    >
                                        <img src={product.image} className="w-12 h-12 rounded bg-zinc-800 object-cover" alt={product.name} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-bold text-sm truncate group-hover:text-[#ccff00] transition-colors">{product.name}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-zinc-400 text-xs font-mono">${product.price.toLocaleString()}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${product.stock < 10 ? 'bg-red-500/20 text-red-400' : 'bg-zinc-700 text-zinc-300'}`}>
                                                    Stock: {product.stock}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* DERECHA: Checkout */}
                        <div className="w-2/5 flex flex-col bg-black/40">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-white font-bold">2. Detalle de Venta</h3>
                                <button onClick={() => setIsMakingSale(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                {/* Selección Cliente */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Cliente</label>
                                    <select 
                                        value={selectedClientId}
                                        onChange={(e) => setSelectedClientId(e.target.value)}
                                        className="w-full bg-zinc-800 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#ccff00] transition-colors"
                                    >
                                        <option value="">-- Seleccionar Cliente --</option>
                                        {adminClients.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>

                                    {selectedClientData && (
                                        <div className="bg-[#ccff00]/5 border border-[#ccff00]/20 rounded-xl p-3 animate-fade-in space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                                                <User className="w-3 h-3 text-[#ccff00]" /> <span className="font-bold text-white">{selectedClientData.name}</span>
                                            </div>
                                            {selectedClientData.email && <div className="flex items-center gap-2 text-xs text-zinc-400"><Mail className="w-3 h-3" /> {selectedClientData.email}</div>}
                                            {selectedClientData.phone && <div className="flex items-center gap-2 text-xs text-zinc-400"><Phone className="w-3 h-3" /> {selectedClientData.phone}</div>}
                                        </div>
                                    )}
                                </div>

                                {/* Carrito */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Productos ({saleCart.length})</label>
                                    <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden max-h-48 overflow-y-auto">
                                        {saleCart.length === 0 ? <p className="text-zinc-600 text-xs text-center py-4">Carrito vacío</p> : 
                                            saleCart.map(item => (
                                                <div key={item.id} className="flex justify-between items-center p-2 border-b border-white/5 last:border-0 hover:bg-white/5">
                                                    <div className="flex-1 min-w-0 mr-2">
                                                        <p className="text-white text-xs truncate">{item.name}</p>
                                                        <p className="text-zinc-500 text-[10px]">x{item.quantity}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[#ccff00] text-xs font-mono">${(item.price * item.quantity).toLocaleString()}</span>
                                                        <button onClick={() => removeFromSaleCart(item.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>

                                {/* Pago */}
                                {selectedClientData && (
                                    <div className="space-y-2 animate-fade-in">
                                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Forma de Pago</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                            <select 
                                                value={salePaymentMethod}
                                                onChange={(e) => setSalePaymentMethod(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white outline-none focus:border-[#ccff00]"
                                            >
                                                <option value="Efectivo">Efectivo</option>
                                                <option value="Transferencia">Transferencia</option>
                                                <option value="Tarjeta">Tarjeta</option>
                                                <option value="Cuenta Corriente">Cuenta Corriente</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-white/10 bg-zinc-900">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-zinc-400">Total</span>
                                    <span className="text-3xl font-black text-[#ccff00]">${saleCart.reduce((acc, i) => acc + (i.price * i.quantity), 0).toLocaleString()}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setIsMakingSale(false)} className="py-3 rounded-xl border border-white/10 text-zinc-400 hover:bg-white/5 font-bold text-sm">Cancelar</button>
                                    <button 
                                        onClick={confirmSale}
                                        disabled={!selectedClientId || saleCart.length === 0}
                                        className="py-3 rounded-xl bg-[#ccff00] text-black font-black hover:bg-[#b3e600] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm uppercase tracking-wide"
                                    >
                                        Confirmar Venta
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSales;
