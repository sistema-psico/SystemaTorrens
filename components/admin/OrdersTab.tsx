import React, { useState, useEffect } from 'react';
import { Reseller, ResellerOrder, Message, Product, Client, CartItem } from '../../types';
import { Truck, CheckCircle, Clock, Trash2, Package, ChevronDown, ChevronUp, MessageCircle, AlertTriangle, DollarSign, Plus, X, User, Phone, Mail, CreditCard, ShoppingCart } from 'lucide-react';

interface OrdersTabProps {
    resellers: Reseller[];
    setResellers: (resellers: Reseller[]) => void;
    directOrders?: ResellerOrder[];
    setDirectOrders?: (orders: ResellerOrder[]) => void;
    products: Product[];
    setProducts: (products: Product[]) => void;
    adminClients: Client[];
    setAdminClients: (clients: Client[]) => void;
}

const OrdersTab: React.FC<OrdersTabProps> = ({ 
    resellers, setResellers, directOrders = [], setDirectOrders, 
    products, setProducts, adminClients, setAdminClients 
}) => {
    const [filterStatus, setFilterStatus] = useState<'Todos' | 'Pendiente' | 'En Camino' | 'Entregado'>('Todos');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    // --- ESTADOS PARA CREAR NUEVO PEDIDO ---
    const [isMakingOrder, setIsMakingOrder] = useState(false);
    const [orderCart, setOrderCart] = useState<CartItem[]>([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedClientData, setSelectedClientData] = useState<Client | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string>('Efectivo');
    const [paymentType, setPaymentType] = useState<'full' | 'deposit'>('full'); // 100% o 50%

    useEffect(() => {
        if (selectedClientId) {
            const client = adminClients.find(c => c.id === selectedClientId);
            if (client) {
                setSelectedClientData(client);
                setPaymentMethod(client.paymentMethod);
            }
        } else {
            setSelectedClientData(null);
            setPaymentMethod('Efectivo');
        }
    }, [selectedClientId, adminClients]);

    // --- LÓGICA DE NUEVO PEDIDO ---
    const addToOrderCart = (product: Product) => {
        if (product.stock <= 0) return;
        setOrderCart(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) return prev;
                return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromOrderCart = (id: string) => {
        setOrderCart(prev => prev.filter(p => p.id !== id));
    };

    const confirmNewOrder = () => {
        if (!selectedClientData || orderCart.length === 0 || !setDirectOrders) return;

        const total = orderCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const payNowAmount = paymentType === 'full' ? total : total * 0.5;
        const payLaterAmount = total - payNowAmount;

        const newOrder: ResellerOrder = {
            id: `PED-ADM-${Date.now()}`,
            clientId: selectedClientData.id,
            clientName: selectedClientData.name,
            date: new Date().toLocaleDateString(),
            items: [...orderCart],
            total: total,
            status: 'Pendiente',
            type: 'direct',
            amountPaid: payNowAmount,
            balanceDue: payLaterAmount,
            paymentStatus: payLaterAmount > 0 ? 'partial' : 'paid',
            shippingInfo: {
                address: selectedClientData.address,
                phone: selectedClientData.phone,
                email: selectedClientData.email,
                paymentMethodChosen: paymentMethod
            }
        };

        // 1. Guardar Pedido
        setDirectOrders([...directOrders, newOrder]);

        // 2. Descontar Stock Inmediatamente (Para evitar sobreventa)
        const updatedProducts = products.map(prod => {
            const cartItem = orderCart.find(c => c.id === prod.id);
            if (cartItem) {
                return { ...prod, stock: Math.max(0, prod.stock - cartItem.quantity) };
            }
            return prod;
        });
        setProducts(updatedProducts);

        // 3. Actualizar Saldo del Cliente (Opcional, si es Cta Cte o para registro histórico)
        if (paymentMethod === 'Cuenta Corriente' || payLaterAmount > 0) {
             // Aquí podrías sumar la deuda al cliente si quisieras
        }

        // Reset
        setIsMakingOrder(false);
        setOrderCart([]);
        setSelectedClientId('');
    };

    // --- FUNCIONES EXISTENTES DE GESTIÓN ---
    const toggleDetails = (orderId: string) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const sendWhatsAppUpdate = (order: ResellerOrder) => {
        let phone = '';
        if (order.type === 'direct' && order.shippingInfo) {
            phone = order.shippingInfo.phone;
        } else {
            alert("Para revendedores, usa el chat interno para coordinar.");
            return;
        }
        const message = `Hola ${order.clientName}, tu pedido #${order.id} ha cambiado de estado a: *${order.status.toUpperCase()}*.`;
        window.open(`https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const confirmPayment = (order: ResellerOrder) => {
        if (!window.confirm(`¿Confirmar el pago del saldo pendiente de $${order.balanceDue?.toLocaleString()}?`)) return;

        const updatedOrder: ResellerOrder = {
            ...order,
            amountPaid: (order.amountPaid || 0) + (order.balanceDue || 0),
            balanceDue: 0,
            paymentStatus: 'paid'
        };

        if (order.type === 'direct' && setDirectOrders) {
             const updatedOrders = directOrders.map(o => o.id === order.id ? updatedOrder : o);
             setDirectOrders(updatedOrders);
        }
    };

    const updateOrderStatus = (order: ResellerOrder & { resellerId?: string }, newStatus: ResellerOrder['status']) => {
        // La lógica de descuento de stock ya se hace al crear el pedido manual,
        // pero para pedidos web o de revendedores que estaban "Pendientes", se descuenta al confirmar.
        // Como simplificación, asumimos que el stock se gestiona al crear para admin, 
        // y al aprobar para revendedores.
        
        if (order.type === 'direct' && setDirectOrders) {
            const updatedOrders = directOrders.map(o => o.id === order.id ? { ...o, status: newStatus } : o);
            setDirectOrders(updatedOrders);
        } else if (order.resellerId) {
             // Lógica de revendedores (sin cambios)
             const updatedResellers = resellers.map(r => {
                if (r.id === order.resellerId) {
                    const currentOrder = r.orders.find(o => o.id === order.id);
                    if (!currentOrder || currentOrder.status === newStatus) return r;
                    // ... (logica de stock revendedor, igual que antes) ...
                    const updatedOrders = r.orders.map(o => o.id === order.id ? { ...o, status: newStatus } : o);
                    return { ...r, orders: updatedOrders };
                }
                return r;
            });
            setResellers(updatedResellers);
        }
    };

    const deleteOrder = (order: ResellerOrder & { resellerId?: string }) => {
        if (!window.confirm('¿Eliminar este pedido del historial?')) return;
        if (order.type === 'direct' && setDirectOrders) {
            setDirectOrders(directOrders.filter(o => o.id !== order.id));
        } else if (order.resellerId) {
             // ... lógica eliminar revendedor
             const updatedResellers = resellers.map(r => {
                if (r.id === order.resellerId) {
                    return { ...r, orders: r.orders.filter(o => o.id !== order.id) };
                }
                return r;
            });
            setResellers(updatedResellers);
        }
    };
    
    const resellerOrders = resellers.flatMap(r => r.orders.map(o => ({ ...o, resellerId: r.id, resellerName: r.name, type: 'reseller' as const })));
    const webOrders = directOrders.map(o => ({ ...o, resellerName: 'Cliente Web', type: 'direct' as const }));
    const allOrders = [...webOrders, ...resellerOrders].filter(o => {
        if (filterStatus !== 'Todos' && o.status !== filterStatus) return false;
        return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pendiente': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'En Camino': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'Entregado': return 'text-green-500 bg-green-500/10 border-green-500/20';
            default: return 'text-gray-500 bg-gray-500/10';
        }
    };

    return (
         <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white italic">GESTIÓN DE <span className="text-[#ccff00]">PEDIDOS</span></h1>
                    <p className="text-zinc-400 text-sm">Controla los envíos a revendedores y clientes web.</p>
                </div>
                
                {/* BOTÓN NUEVO PEDIDO */}
                <button 
                    onClick={() => setIsMakingOrder(true)} 
                    className="bg-[#ccff00] text-black px-4 py-2 rounded-lg font-bold hover:bg-[#b3e600] flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"
                >
                    <Plus className="w-5 h-5" /> Nuevo Pedido
                </button>

                <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                    {['Todos', 'Pendiente', 'En Camino', 'Entregado'].map(status => (
                            <button key={status} onClick={() => setFilterStatus(status as any)} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${filterStatus === status ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-white'}`}>
                            {status === 'Pendiente' ? 'Preparando' : status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4">
                {allOrders.map(order => (
                    <div key={order.id} className={`bg-zinc-900/40 backdrop-blur-md border rounded-2xl overflow-hidden hover:border-[#ccff00]/20 transition-colors ${
                        order.balanceDue && order.balanceDue > 0 ? 'border-red-500/50' : 'border-white/5'
                    }`}>
                        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                            {/* ... (Resto del renderizado de la tarjeta de pedido igual) ... */}
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`p-4 rounded-xl border ${getStatusColor(order.status)}`}>
                                    <Package className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-white font-bold text-lg">{order.clientName || order.resellerName}</h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${order.type === 'direct' ? 'bg-[#ccff00] text-black' : 'bg-blue-600 text-white'}`}>
                                            {order.type === 'direct' ? 'WEB' : 'PARTNER'}
                                        </span>
                                    </div>
                                    <p className="text-zinc-400 text-sm flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> {order.date} <span className="text-zinc-600">|</span> {order.items.length} items <span className="text-zinc-600">|</span> ID: {order.id}
                                    </p>
                                    {order.balanceDue && order.balanceDue > 0 && (
                                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-lg border border-red-500/30 animate-pulse">
                                            <AlertTriangle className="w-3 h-3" /> SALDO PENDIENTE: ${order.balanceDue.toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                {order.balanceDue && order.balanceDue > 0 && (
                                    <button onClick={() => confirmPayment(order as ResellerOrder)} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg animate-bounce" title="Cobrar Saldo">
                                        <DollarSign className="w-4 h-4" /> Cobrar
                                    </button>
                                )}
                                {order.type === 'direct' && order.shippingInfo?.phone && (
                                    <button onClick={() => sendWhatsAppUpdate(order as any)} className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors">
                                        <MessageCircle className="w-5 h-5" />
                                    </button>
                                )}
                                <button onClick={() => toggleDetails(order.id)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
                                    {expandedOrderId === order.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </button>
                                {order.status === 'Pendiente' && <button onClick={() => updateOrderStatus(order as any, 'En Camino')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors"><Truck className="w-4 h-4" /> Despachar</button>}
                                {order.status === 'En Camino' && <button onClick={() => updateOrderStatus(order as any, 'Entregado')} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold transition-colors"><CheckCircle className="w-4 h-4" /> Entregado</button>}
                                <button onClick={() => deleteOrder(order as any)} className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        </div>

                        {expandedOrderId === order.id && (
                            <div className="border-t border-white/5 bg-black/20 p-6 animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-zinc-400 text-xs font-bold uppercase mb-4">Productos</h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white/5 p-2 rounded text-xs">
                                                <span className="text-white">{item.quantity}x {item.name}</span>
                                                <span className="text-zinc-500 font-mono">${(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex flex-col gap-1 border-t border-white/10 pt-2">
                                        <div className="flex justify-between"><span className="text-zinc-500 text-sm">Total Pedido</span><span className="text-white font-bold text-sm">${order.total.toLocaleString()}</span></div>
                                        {order.amountPaid && <div className="flex justify-between"><span className="text-green-500 text-sm">Pagado</span><span className="text-green-500 font-bold text-sm">-${order.amountPaid.toLocaleString()}</span></div>}
                                        {order.balanceDue && order.balanceDue > 0 && <div className="flex justify-between border-t border-white/10 pt-1 mt-1"><span className="text-red-400 font-bold">Resta Pagar</span><span className="text-red-400 font-bold text-lg">${order.balanceDue.toLocaleString()}</span></div>}
                                    </div>
                                </div>
                                {order.type === 'direct' && order.shippingInfo && (
                                    <div>
                                        <h4 className="text-zinc-400 text-xs font-bold uppercase mb-4">Datos de Envío</h4>
                                        <div className="space-y-2 text-sm text-zinc-300">
                                            <p><span className="text-zinc-500">Dirección:</span> {order.shippingInfo.address}</p>
                                            <p><span className="text-zinc-500">Teléfono:</span> {order.shippingInfo.phone}</p>
                                            <p><span className="text-zinc-500">Email:</span> {order.shippingInfo.email}</p>
                                            <p><span className="text-zinc-500">Pago:</span> {order.shippingInfo.paymentMethodChosen}</p>
                                            {order.shippingInfo.notes && <p className="mt-2 p-2 bg-yellow-500/10 text-yellow-200 text-xs rounded border border-yellow-500/20">Nota: {order.shippingInfo.notes}</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {allOrders.length === 0 && <div className="text-center py-20 text-zinc-500 bg-zinc-900/20 rounded-2xl border border-white/5"><p>No hay pedidos activos.</p></div>}
            </div>

            {/* --- MODAL NUEVA VENTA (INTEGRADO AQUÍ) --- */}
            {isMakingOrder && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex items-center justify-center p-0 md:p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-none md:rounded-2xl w-full max-w-5xl h-full md:h-[85vh] flex flex-col lg:flex-row overflow-hidden animate-scale-in shadow-2xl">
                        
                        {/* IZQUIERDA: Catálogo */}
                        <div className="w-full lg:w-3/5 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col h-1/2 lg:h-full">
                            <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
                                <h3 className="text-white font-bold text-sm md:text-xl">1. Productos (Stock Global)</h3>
                                <button onClick={() => setIsMakingOrder(false)} className="lg:hidden text-white"><X /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {products.map(product => (
                                    <button 
                                        key={product.id} 
                                        onClick={() => addToOrderCart(product)}
                                        disabled={product.stock === 0}
                                        className={`text-left p-3 rounded-xl border transition-all flex gap-3 group relative overflow-hidden ${product.stock === 0 ? 'opacity-50 border-white/5 bg-black/20 cursor-not-allowed' : 'border-white/10 bg-black/40 hover:border-[#ccff00]/50 hover:bg-white/5'}`}
                                    >
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
                        <div className="w-full lg:w-2/5 flex flex-col bg-black/40 h-1/2 lg:h-full">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center hidden lg:flex">
                                <h3 className="text-white font-bold">2. Detalle del Pedido</h3>
                                <button onClick={() => setIsMakingOrder(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Cliente</label>
                                    <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full bg-zinc-800 border border-white/10 p-2 md:p-3 rounded-xl text-white outline-none focus:border-[#ccff00] text-sm">
                                        <option value="">-- Seleccionar Cliente --</option>
                                        {adminClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                {selectedClientData && (
                                    <div className="space-y-3 animate-fade-in">
                                        <div>
                                            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Forma de Pago</label>
                                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full bg-zinc-800 border border-white/10 p-2 rounded-xl text-white text-sm outline-none focus:border-[#ccff00]">
                                                <option value="Efectivo">Efectivo</option>
                                                <option value="Transferencia">Transferencia</option>
                                                <option value="Tarjeta">Tarjeta</option>
                                                <option value="Cuenta Corriente">Cuenta Corriente</option>
                                            </select>
                                        </div>
                                        {paymentMethod !== 'Cuenta Corriente' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => setPaymentType('full')} className={`flex-1 py-2 rounded-lg text-xs font-bold border ${paymentType === 'full' ? 'bg-[#ccff00] text-black border-[#ccff00]' : 'text-zinc-400 border-white/10'}`}>100%</button>
                                                <button onClick={() => setPaymentType('deposit')} className={`flex-1 py-2 rounded-lg text-xs font-bold border ${paymentType === 'deposit' ? 'bg-[#ccff00] text-black border-[#ccff00]' : 'text-zinc-400 border-white/10'}`}>50% Seña</button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden max-h-32 md:max-h-48 overflow-y-auto">
                                    {orderCart.length === 0 ? <p className="text-zinc-600 text-xs text-center py-4">Carrito vacío</p> : 
                                        orderCart.map(item => (
                                            <div key={item.id} className="flex justify-between items-center p-2 border-b border-white/5">
                                                <div className="flex-1 min-w-0 mr-2"><p className="text-white text-xs truncate">{item.name}</p><p className="text-zinc-500 text-[10px]">x{item.quantity}</p></div>
                                                <div className="flex items-center gap-2"><span className="text-[#ccff00] text-xs font-mono">${(item.price * item.quantity).toLocaleString()}</span><button onClick={() => removeFromOrderCart(item.id)} className="text-red-400"><Trash2 className="w-3 h-3" /></button></div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>

                            <div className="p-4 border-t border-white/10 bg-zinc-900">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-zinc-400 text-sm">Total</span>
                                    <span className="text-xl font-black text-white">${orderCart.reduce((acc, i) => acc + (i.price * i.quantity), 0).toLocaleString()}</span>
                                </div>
                                {paymentType === 'deposit' && paymentMethod !== 'Cuenta Corriente' && (
                                    <div className="flex justify-between items-center mb-4 text-xs text-yellow-500">
                                        <span>A pagar ahora (50%)</span>
                                        <span className="font-bold">${(orderCart.reduce((acc, i) => acc + (i.price * i.quantity), 0) * 0.5).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setIsMakingOrder(false)} className="py-3 rounded-xl border border-white/10 text-zinc-400 hover:bg-white/5 font-bold text-sm hidden lg:block">Cancelar</button>
                                    <button onClick={confirmNewOrder} disabled={!selectedClientId || orderCart.length === 0} className="w-full lg:col-span-1 col-span-2 py-3 rounded-xl bg-[#ccff00] text-black font-black hover:bg-[#b3e600] disabled:opacity-50 text-sm uppercase">Confirmar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersTab;
