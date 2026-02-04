import React, { useState, useEffect } from 'react';
import { Product, Sale, Client, CartItem, Coupon } from '../../types';
import { Plus, Trash2, X, User, Phone, Mail, CreditCard, ShoppingCart, Tag } from 'lucide-react';

interface AdminSalesProps {
    products: Product[];
    setProducts: (products: Product[]) => void;
    adminClients: Client[];
    setAdminClients: (clients: Client[]) => void;
    adminSales: Sale[];
    setAdminSales: (sales: Sale[]) => void;
    coupons?: Coupon[]; // Recibimos cupones
}

const AdminSales: React.FC<AdminSalesProps> = ({ 
    products, setProducts, adminClients, setAdminClients, adminSales, setAdminSales, coupons = [] 
}) => {
    const [isMakingSale, setIsMakingSale] = useState(false);
    const [saleCart, setSaleCart] = useState<CartItem[]>([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedClientData, setSelectedClientData] = useState<Client | null>(null);
    const [salePaymentMethod, setSalePaymentMethod] = useState<string>('Efectivo');
    
    // Estado Cupón
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

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

    // Handlers
    const addToSaleCart = (product: Product) => { 
        if (product.stock <= 0) return;
        setSaleCart(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) { if (existing.quantity >= product.stock) return prev; return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p); }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromSaleCart = (id: string) => { setSaleCart(prev => prev.filter(p => p.id !== id)); };

    const handleApplyCoupon = () => {
        const found = coupons.find(c => c.code === couponCode.toUpperCase().trim() && c.active);
        if (found) setAppliedCoupon(found);
        else alert('Cupón inválido');
    };

    const confirmSale = () => {
        if (!selectedClientData || saleCart.length === 0) return;
        
        const subtotal = saleCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const totalAmount = appliedCoupon ? subtotal - (subtotal * (appliedCoupon.discountPercentage / 100)) : subtotal;

        const newSale: Sale = {
            id: `V-ADM-${Date.now()}`,
            clientId: selectedClientData.id,
            clientName: selectedClientData.name,
            date: new Date().toLocaleDateString(),
            items: [...saleCart],
            total: totalAmount,
            paymentMethod: salePaymentMethod,
            appliedCoupon: appliedCoupon?.code // Guardamos el código usado
        };

        // ... Descontar Stock y Guardar (Igual que antes) ...
        const updatedProducts = products.map(prod => {
            const cartItem = saleCart.find(c => c.id === prod.id);
            if (cartItem) return { ...prod, stock: Math.max(0, prod.stock - cartItem.quantity) };
            return prod;
        });

        if (salePaymentMethod === 'Cuenta Corriente') {
            const updatedClients = adminClients.map(c => c.id === selectedClientData.id ? { ...c, currentAccountBalance: (c.currentAccountBalance || 0) + totalAmount, lastOrderDate: new Date().toLocaleDateString() } : c);
            setAdminClients(updatedClients);
        }

        setAdminSales([newSale, ...adminSales]);
        setProducts(updatedProducts);
        
        // Reset
        setIsMakingSale(false);
        setSaleCart([]);
        setSelectedClientId('');
        setAppliedCoupon(null);
        setCouponCode('');
    };

    const subtotal = saleCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = appliedCoupon ? subtotal - (subtotal * (appliedCoupon.discountPercentage / 100)) : subtotal;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div><h1 className="text-3xl font-black text-white italic">VENTAS <span className="text-[#ccff00]">DIRECTAS</span></h1></div>
                <button onClick={() => setIsMakingSale(true)} className="bg-[#ccff00] text-black px-6 py-2 rounded-lg font-bold"><Plus className="w-5 h-5 inline mr-2"/> Nueva Venta</button>
            </div>

            {/* TABLA HISTORIAL (IGUAL) */}
            <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-x-auto shadow-xl">
                 <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-black/40 text-zinc-400 text-sm">
                        <tr>
                            <th className="px-6 py-4">ID</th>
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
                                <td className="px-6 py-4 text-zinc-300 text-sm">{sale.items.length}</td>
                                <td className="px-6 py-4 text-zinc-400 text-sm">{sale.paymentMethod}</td>
                                <td className="px-6 py-4 text-right font-bold text-[#ccff00]">${sale.total.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {isMakingSale && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-5xl h-[85vh] flex overflow-hidden animate-scale-in">
                        {/* IZQUIERDA: Catálogo (Igual) */}
                        <div className="w-3/5 border-r border-white/10 flex flex-col">
                             <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
                                <h3 className="text-white font-bold text-sm md:text-xl">1. Productos</h3>
                                <input type="text" placeholder="Buscar..." className="bg-black/50 border border-white/10 p-2 rounded-lg text-white outline-none focus:border-[#ccff00] text-sm w-32 md:w-48" />
                                <button onClick={() => setIsMakingSale(false)} className="lg:hidden text-white"><X /></button>
                            </div>
                             <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
                                {products.map(product => (
                                    <button key={product.id} onClick={() => addToSaleCart(product)} disabled={product.stock === 0} className={`text-left p-3 rounded-xl border transition-all flex gap-3 group relative overflow-hidden ${product.stock === 0 ? 'opacity-50 border-white/5 bg-black/20 cursor-not-allowed' : 'border-white/10 bg-black/40 hover:border-[#ccff00]/50 hover:bg-white/5'}`}>
                                        <img src={product.image} className="w-12 h-12 rounded bg-zinc-800 object-cover" alt={product.name} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-bold text-sm truncate">{product.name}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-zinc-400 text-xs font-mono">${product.price.toLocaleString()}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${product.stock < 10 ? 'bg-red-500/20 text-red-400' : 'bg-zinc-700 text-zinc-300'}`}>Stock: {product.stock}</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                             </div>
                        </div>

                        {/* DERECHA: Checkout */}
                        <div className="w-2/5 flex flex-col bg-black/40">
                             <div className="p-4 border-b border-white/10 flex justify-between"><h3 className="text-white font-bold">Detalle</h3><button onClick={() => setIsMakingSale(false)}><X className="text-zinc-500"/></button></div>
                             
                             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {/* Cliente */}
                                <div className="space-y-2">
                                     <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full bg-zinc-800 border border-white/10 p-2 rounded text-white">{adminClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                                </div>
                                <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden max-h-32">
                                     {saleCart.map(item => (<div key={item.id} className="flex justify-between p-2 border-b border-white/5"><span className="text-white">{item.name}</span><button onClick={() => removeFromSaleCart(item.id)}><Trash2 className="text-red-400 w-3 h-3"/></button></div>))}
                                </div>

                                {/* SECCIÓN CUPÓN */}
                                <div className="bg-zinc-800/50 p-3 rounded-xl border border-white/5">
                                    <label className="text-xs font-bold text-zinc-500">APLICAR CUPÓN</label>
                                    <div className="flex gap-2 mt-1">
                                        <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="CÓDIGO" className="flex-1 bg-black/50 border border-white/10 rounded px-2 text-white text-sm" disabled={!!appliedCoupon} />
                                        {appliedCoupon ? (
                                            <button onClick={() => {setAppliedCoupon(null); setCouponCode('')}} className="bg-red-500/20 text-red-400 p-2 rounded"><X className="w-4 h-4"/></button>
                                        ) : (
                                            <button onClick={handleApplyCoupon} className="bg-[#ccff00]/20 text-[#ccff00] p-2 rounded"><Check className="w-4 h-4"/></button>
                                        )}
                                    </div>
                                    {appliedCoupon && <p className="text-green-400 text-xs mt-1">Descuento aplicado: {appliedCoupon.discountPercentage}%</p>}
                                </div>
                             </div>

                             {/* TOTALES */}
                             <div className="p-4 border-t border-white/10 bg-zinc-900">
                                <div className="flex justify-between text-zinc-400 text-sm"><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
                                {appliedCoupon && (
                                    <div className="flex justify-between text-green-400 text-sm"><span>Descuento</span><span>-${(subtotal * (appliedCoupon.discountPercentage/100)).toLocaleString()}</span></div>
                                )}
                                <div className="flex justify-between items-center mb-4 mt-2">
                                    <span className="text-white font-bold">Total</span>
                                    <span className="text-2xl font-black text-[#ccff00]">${total.toLocaleString()}</span>
                                </div>
                                <button onClick={confirmSale} className="w-full py-3 rounded-xl bg-[#ccff00] text-black font-bold">CONFIRMAR VENTA</button>
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSales;
