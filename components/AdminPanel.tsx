import React, { useState } from 'react';
import { Product, ContactInfo, Banner, Reseller, Client, SiteContent, PaymentConfig, SocialReview, ResellerOrder, Sale, Coupon } from '../types';
import { 
  X, Settings, Package, LayoutDashboard, 
  Tag, Users, UserCircle, Bell, BarChart3, 
  Truck, Menu, Star // Importamos Star para el icono
} from 'lucide-react';

import InventoryTab from './admin/InventoryTab';
import PromotionsTab from './admin/PromotionsTab';
import ResellersTab from './admin/ResellersTab';
import ClientsTab from './admin/ClientsTab';
import MessagesTab from './admin/MessagesTab';
import AnalyticsTab from './admin/AnalyticsTab';
import SettingsTab from './admin/SettingsTab';
import OrdersTab from './admin/OrdersTab';
import AdminSales from './admin/AdminSales';
import SocialReviewsTab from './admin/SocialReviewsTab'; // IMPORTAMOS LA NUEVA PESTAÑA

interface AdminPanelProps {
  products: Product[];
  setProducts: (products: Product[]) => void;
  contactInfo: ContactInfo;
  setContactInfo: (info: ContactInfo) => void;
  paymentConfig: PaymentConfig;
  setPaymentConfig: (config: PaymentConfig) => void;
  banners: Banner[];
  setBanners: (banners: Banner[]) => void;
  socialReviews: SocialReview[];
  setSocialReviews: (reviews: SocialReview[]) => void;
  resellers: Reseller[];
  setResellers: (resellers: Reseller[]) => void;
  adminClients: Client[];
  setAdminClients: (clients: Client[]) => void;
  onClose: () => void;
  siteContent: SiteContent;
  setSiteContent: (content: SiteContent) => void;
  directOrders?: ResellerOrder[];
  setDirectOrders?: (orders: ResellerOrder[]) => void;
  adminSales?: Sale[];
  setAdminSales?: (sales: Sale[]) => void;
  coupons?: Coupon[];
  setCoupons?: (coupons: Coupon[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  products = [], setProducts, contactInfo, setContactInfo, paymentConfig, setPaymentConfig,
  banners = [], setBanners, socialReviews = [], setSocialReviews, resellers = [], setResellers,
  adminClients = [], setAdminClients, onClose, siteContent, setSiteContent,
  directOrders = [], setDirectOrders, adminSales = [], setAdminSales,
  coupons = [], setCoupons
}) => {
  // AGREGAMOS 'reviews' AL ESTADO DE PESTAÑAS
  const [activeTab, setActiveTab] = useState<'inventory' | 'settings' | 'promotions' | 'resellers' | 'clients' | 'messages' | 'analytics' | 'orders' | 'reviews'>('orders');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!products || !contactInfo || !siteContent) {
      return <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">Cargando panel...</div>;
  }

  const totalUnreadMessages = resellers.reduce((acc, r) => acc + r.messages.filter(m => m.sender === 'reseller' && !m.read).length, 0);
  const pendingResellerOrders = resellers.reduce((acc, r) => acc + r.orders.filter(o => o.status === 'Pendiente').length, 0);
  const pendingDirectOrders = directOrders ? directOrders.filter(o => o.status === 'Pendiente').length : 0;
  const totalPending = pendingResellerOrders + pendingDirectOrders;

  const handleTabChange = (tab: any) => {
      setActiveTab(tab);
      setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen relative bg-[#0a0a0a] font-sans text-gray-200 selection:bg-[#ccff00] selection:text-black overflow-hidden flex flex-col md:flex-row">
      
      {/* Background Decorativo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#ccff00]/10 rounded-full blur-[100px] animate-blob"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-900/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      </div>
      
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-zinc-900/90 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center z-50 sticky top-0">
          <h2 className="text-lg font-bold flex items-center gap-2 text-white italic">
            <LayoutDashboard className="text-[#ccff00] w-5 h-5" /> Panel <span className="text-[#ccff00]">Admin</span>
          </h2>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-white hover:bg-white/10 rounded-lg">
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/80 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-zinc-900/95 backdrop-blur-xl border-r border-white/10 shadow-2xl flex flex-col z-50 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:bg-black/60`}>
        <div className="p-6 border-b border-white/10 hidden md:block">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white italic">
            <LayoutDashboard className="text-[#ccff00]" /> Panel <span className="text-[#ccff00]">Admin</span>
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: 'orders', icon: Truck, label: 'Pedidos', badge: totalPending, badgeColor: 'bg-blue-600' },
            { id: 'inventory', icon: Package, label: 'Inventario' },
            { id: 'promotions', icon: Tag, label: 'Promociones' },
            { id: 'reviews', icon: Star, label: 'Reseñas' }, // <--- NUEVO BOTÓN
            { id: 'analytics', icon: BarChart3, label: 'Estadísticas' },
            { id: 'messages', icon: Bell, label: 'Mensajes', badge: totalUnreadMessages, badgeColor: 'bg-red-500' },
            { id: 'resellers', icon: Users, label: 'Revendedores' },
            { id: 'clients', icon: UserCircle, label: 'Clientes' },
            { id: 'settings', icon: Settings, label: 'Configuración' },
          ].map(item => (
            <button 
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                activeTab === item.id 
                    ? 'bg-[#ccff00] text-black font-bold shadow-[0_0_20px_rgba(204,255,0,0.3)]' 
                    : 'text-zinc-400 hover:bg-white/10 hover:text-white'
                }`}
            >
                <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    {item.label}
                </div>
                {item.badge && item.badge > 0 ? (
                    <span className={`${item.badgeColor || 'bg-red-500'} text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse`}>
                        {item.badge}
                    </span>
                ) : null}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={onClose} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-colors text-sm text-zinc-300">
            <X className="w-4 h-4" /> Volver a Tienda
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-4 md:p-8 z-10 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        {activeTab === 'inventory' && <InventoryTab products={products} setProducts={setProducts} resellers={resellers} />}
        {activeTab === 'orders' && <OrdersTab resellers={resellers} setResellers={setResellers} directOrders={directOrders} setDirectOrders={setDirectOrders!} products={products} setProducts={setProducts} adminClients={adminClients} setAdminClients={setAdminClients} />}
        {activeTab === 'promotions' && <PromotionsTab banners={banners} setBanners={setBanners} products={products} coupons={coupons} setCoupons={setCoupons!} />}
        {/* RENDERIZAR LA NUEVA PESTAÑA */}
        {activeTab === 'reviews' && <SocialReviewsTab reviews={socialReviews} setReviews={setSocialReviews} />}
        {activeTab === 'resellers' && <ResellersTab resellers={resellers} setResellers={setResellers} products={products} />}
        {activeTab === 'clients' && <ClientsTab adminClients={adminClients} setAdminClients={setAdminClients} />}
        {activeTab === 'messages' && <MessagesTab resellers={resellers} setResellers={setResellers} />}
        {activeTab === 'analytics' && <AnalyticsTab products={products} resellers={resellers} adminSales={adminSales!} setResellers={setResellers} />}
        {activeTab === 'settings' && <SettingsTab siteContent={siteContent} setSiteContent={setSiteContent} contactInfo={contactInfo} setContactInfo={setContactInfo} paymentConfig={paymentConfig} setPaymentConfig={setPaymentConfig} />}
      </div>
    </div>
  );
};
