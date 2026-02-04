import React, { useState } from 'react';
import { Reseller, ResellerOrder, Message } from '../../types';
import { Truck, CheckCircle, Clock, Trash2, Package, ChevronDown, ChevronUp, MessageCircle, AlertTriangle } from 'lucide-react';

interface OrdersTabProps {
    resellers: Reseller[];
    setResellers: (resellers: Reseller[]) => void;
    directOrders?: ResellerOrder[];
    setDirectOrders?: (orders: ResellerOrder[]) => void;
}

const OrdersTab: React.FC<OrdersTabProps> = ({ resellers, setResellers, directOrders = [], setDirectOrders }) => {
    const [filterStatus, setFilterStatus] = useState<'Todos' | 'Pendiente' | 'En Camino' | 'Entregado'>('Todos');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const toggleDetails = (orderId: string) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const sendWhatsAppUpdate = (order: ResellerOrder) => {
        let phone = '';
        if (order.type === 'direct' && order.shippingInfo) {
            phone = order.shippingInfo.phone;
        } else {
            alert("Para revendedores, usa el chat interno.");
            return;
        }

        const message = `Hola ${order.clientName}, tu pedido #${order.id} ha cambiado de estado a: *${order.status.toUpperCase()}*.`;
        window.open(`https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const updateOrderStatus = (order: ResellerOrder & { resellerId?: string }, newStatus: ResellerOrder['status']) => {
        
        // A. SI ES PEDIDO DIRECTO (WEB)
        if (order.type === 'direct' && setDirectOrders) {
            const updatedOrders = directOrders.map(o => o.id === order.id ? { ...o, status: newStatus } : o);
            setDirectOrders(updatedOrders);
            return;
        }

        // B. SI ES PEDIDO DE REVENDEDOR
        if (order.resellerId) {
            const updatedResellers = resellers.map(r => {
                if (r.id === order.resellerId) {
                    const currentOrder = r.orders.find(o => o.id === order.id);
                    if (!currentOrder || currentOrder.status === newStatus) return r;

                    // Lógica de Stock Inteligente
                    let updatedStock = [...r.stock];
                    if (newStatus === 'Entregado' && currentOrder.status !== 'Entregado') {
                        currentOrder.items.forEach(item => {
                             const prodIndex = updatedStock.findIndex(p => p.id === item.id);
                             if (prodIndex >= 0) {
                                 updatedStock[prodIndex] = { ...updatedStock[prodIndex], stock: updatedStock[prodIndex].stock + item.quantity };
                             } else {
                                 const { quantity, ...productData } = item;
                                 updatedStock.push({ ...productData, stock: quantity } as any);
                             }
                        });
                    } else if (currentOrder.status === 'Entregado' && newStatus !== 'Entregado') {
                         currentOrder.items.forEach(item => {
                             const prodIndex = updatedStock.findIndex(p => p.id === item.id);
                             if (prodIndex >= 0) {
                                 updatedStock[prodIndex] = { ...updatedStock[prodIndex], stock: Math.max(0, updatedStock[prodIndex].stock - item.quantity) };
                             }
                        });
                    }

                    const updatedOrders = r.orders.map(o => o.id === order.id ? { ...o, status: newStatus } : o);
                    
                    const notificationMsg: Message = {
                        id: `SYS-${Date.now()}`,
                        sender: 'admin',
                        content: `ℹ️ El estado de tu pedido #${order.id} ha cambiado a: ${newStatus}`,
                        timestamp: new Date().toLocaleString(),
                        read: false
                    };

                    return { ...r, orders: updatedOrders, messages: [...r.messages, notificationMsg], stock: updatedStock };
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
            const updatedResellers = resellers.map(r => {
                if (r.id === order.resellerId) {
                    return { ...r, orders: r.orders.filter(o => o.id !== order.id) };
                }
                return r;
            });
            setResellers(updatedResellers);
        }
    };
    
    const resellerOrders = resellers.flatMap(r => r.orders.map(o => ({ ...o, resellerId: r.id, resellerName: r.name, type: 'reseller' })));
    const webOrders = directOrders.map(o => ({ ...o, resellerName: 'Cliente Web', type: 'direct' }));

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
                                    
                                    {/* ALERTA DE PAGO PENDIENTE */}
                                    {order.balanceDue && order.balanceDue > 0 && (
                                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-lg border border-red-500/30 animate-pulse">
                                            <AlertTriangle className="w-3 h-3" /> SALDO PENDIENTE: ${order.balanceDue.toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Actions & Status */}
                            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                {order.type === 'direct' && order.shippingInfo?.phone && (
                                    <button onClick={() => sendWhatsAppUpdate(order as any)} className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors" title="Enviar WhatsApp al Cliente">
                                        <MessageCircle className="w-5 h-5" />
                                    </button>
                                )}

                                <button onClick={() => toggleDetails(order.id)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors" title="Ver detalle">
                                    {expandedOrderId === order.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </button>

                                {order.status === 'Pendiente' && (
                                    <button onClick={() => updateOrderStatus(order as any, 'En Camino')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors">
                                        <Truck className="w-4 h-4" /> Despachar
                                    </button>
                                )}
                                {order.status === 'En Camino' && (
                                    <button onClick={() => updateOrderStatus(order as any, 'Entregado')} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold transition-colors">
                                        <CheckCircle className="w-4 h-4" /> Entregado
                                    </button>
                                )}
                                <button onClick={() => deleteOrder(order as any)} className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* DETALLE EXPANDIDO */}
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
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500 text-sm">Total Pedido</span>
                                            <span className="text-white font-bold text-sm">${order.total.toLocaleString()}</span>
                                        </div>
                                        {order.amountPaid && (
                                            <div className="flex justify-between">
                                                <span className="text-green-500 text-sm">Pagado</span>
                                                <span className="text-green-500 font-bold text-sm">-${order.amountPaid.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {order.balanceDue && order.balanceDue > 0 && (
                                            <div className="flex justify-between border-t border-white/10 pt-1 mt-1">
                                                <span className="text-red-400 font-bold">Resta Pagar</span>
                                                <span className="text-red-400 font-bold text-lg">${order.balanceDue.toLocaleString()}</span>
                                            </div>
                                        )}
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
        </div>
    );
};

export default OrdersTab;
