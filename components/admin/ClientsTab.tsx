import React, { useState } from 'react';
import { Client } from '../../types';
import { 
    Plus, Edit2, MapPin, Phone, Mail, X, Save
} from 'lucide-react';

interface ClientsTabProps {
    adminClients: Client[];
    setAdminClients: (clients: Client[]) => void;
}

const ClientsTab: React.FC<ClientsTabProps> = ({ adminClients, setAdminClients }) => {
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClientId, setEditingClientId] = useState<string | null>(null);
    
    const [formData, setFormData] = useState<Partial<Client>>({
        name: '',
        email: '',
        phone: '',
        address: '',
        paymentMethod: 'Efectivo',
        currentAccountBalance: 0
    });

    // --- HANDLERS ---
    const handleOpenModal = () => {
        setEditingClientId(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            paymentMethod: 'Efectivo',
            currentAccountBalance: 0
        });
        setIsModalOpen(true);
    };

    const handleEditClient = (client: Client) => {
        setEditingClientId(client.id);
        setFormData({
            name: client.name,
            email: client.email || '',
            phone: client.phone,
            address: client.address,
            paymentMethod: client.paymentMethod,
            currentAccountBalance: client.currentAccountBalance
        });
        setIsModalOpen(true);
    };

    const handleSaveClient = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;
        
        let updatedClients: Client[];

        if (editingClientId) {
            // EDITAR EXISTENTE
            updatedClients = adminClients.map(c => 
                c.id === editingClientId 
                ? {
                    ...c,
                    name: formData.name!,
                    email: formData.email || '',
                    phone: formData.phone || '',
                    address: formData.address || '',
                    paymentMethod: (formData.paymentMethod as any) || 'Efectivo',
                    currentAccountBalance: Number(formData.currentAccountBalance) || 0
                }
                : c
            );
        } else {
            // CREAR NUEVO
            const newClient: Client = {
                id: `C-${Date.now()}`,
                name: formData.name,
                phone: formData.phone || '',
                email: formData.email || '',
                address: formData.address || '',
                paymentMethod: (formData.paymentMethod as any) || 'Efectivo',
                currentAccountBalance: Number(formData.currentAccountBalance) || 0,
                lastOrderDate: new Date().toLocaleDateString()
            };
            updatedClients = [...adminClients, newClient];
        }

        setAdminClients(updatedClients);
        setIsModalOpen(false);
    };

    return (
        <div className="animate-fade-in relative">
             <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black text-white italic">CLIENTES <span className="text-[#ccff00]">ADMINISTRADOS</span></h1>
                <button 
                    onClick={handleOpenModal}
                    className="bg-[#ccff00] text-black px-6 py-2 rounded-lg hover:bg-[#b3e600] flex items-center gap-2 font-bold hover:scale-105 transition-transform"
                >
                    <Plus className="w-5 h-5" /> Nuevo Cliente
                </button>
            </div>

            {/* GRID DE TARJETAS (Diseño igual al de Revendedores) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminClients.map(client => (
                    <div key={client.id} className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 hover:border-[#ccff00]/30 transition-colors shadow-lg group relative">
                        
                        {/* Botón Editar Flotante */}
                        <button 
                            onClick={() => handleEditClient(client)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>

                        <div className="flex flex-col items-start mb-4 pr-10">
                            <h3 className="text-white font-bold text-lg group-hover:text-[#ccff00] transition-colors">{client.name}</h3>
                            <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-zinc-300 mt-1">{client.paymentMethod}</span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-zinc-400">
                            {client.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-zinc-600" /> {client.phone}</div>}
                            {client.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-zinc-600" /> {client.email}</div>}
                            {client.address && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-zinc-600" /> {client.address}</div>}
                            {!client.phone && !client.email && !client.address && <p className="italic text-zinc-600">Sin datos de contacto adicionales</p>}
                        </div>

                        <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-4">
                            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Saldo Cta.</span>
                            <span className={`font-mono font-bold ${client.currentAccountBalance < 0 ? 'text-red-500' : 'text-green-400'}`}>
                                ${client.currentAccountBalance.toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}

                {adminClients.length === 0 && (
                    <div className="col-span-full py-12 text-center text-zinc-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <p>No tienes clientes directos registrados.</p>
                        <button onClick={handleOpenModal} className="mt-4 text-[#ccff00] text-sm hover:underline">Agregar el primero</button>
                    </div>
                )}
            </div>

            {/* MODAL DE EDICIÓN / CREACIÓN */}
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                     <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-scale-in">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">{editingClientId ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                         </div>

                         <form onSubmit={handleSaveClient} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase ml-1">Nombre Completo *</label>
                                <input type="text" required className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#ccff00]" placeholder="Ej: Juan Pérez" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase ml-1">Teléfono</label>
                                    <input type="tel" className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#ccff00]" placeholder="Ej: 11 5555 4444" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase ml-1">Email</label>
                                    <input type="email" className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#ccff00]" placeholder="ejemplo@mail.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase ml-1">Dirección / Localidad</label>
                                <input type="text" className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#ccff00]" placeholder="Ej: Av. Principal 123" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase ml-1">Método de Pago Preferido</label>
                                <select 
                                    className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#ccff00]"
                                    value={formData.paymentMethod}
                                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as any})}
                                >
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Transferencia">Transferencia</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase ml-1">Saldo Cta. Cte.</label>
                                <input type="number" className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#ccff00]" placeholder="0" value={formData.currentAccountBalance} onChange={(e) => setFormData({...formData, currentAccountBalance: Number(e.target.value)})} />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-zinc-400 hover:bg-white/5 transition-colors font-medium">Cancelar</button>
                                <button type="submit" className="bg-[#ccff00] text-black px-6 py-2 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                                    <Save className="w-4 h-4" /> {editingClientId ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                         </form>
                     </div>
                 </div>
            )}
        </div>
    );
};

export default ClientsTab;
