import React, { useState } from 'react';
import { Product, ContactInfo, Banner, Reseller, Client, SiteContent, PaymentConfig, SocialReview, ResellerOrder, Sale, Coupon } from '../types';
import { 
  X, Settings, Package, LayoutDashboard, 
  Tag, Users, UserCircle, Bell, BarChart3, 
  Truck, DollarSign, Menu
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
  // Cupones
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
  const [activeTab, setActiveTab] = useState<'inventory' | 'settings' | 'promotions' | 'resellers' | 'clients' | 'messages' | 'analytics' | 'orders' | 'adminSales'>('orders');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!products || !contactInfo || !siteContent) {
      return <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">Cargando...</div>;
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
      {/* ... (Sidebar y Header móvil se mantienen igual) ... */}
      
      {/* MAIN CONTENT */}
      <div className="flex-1 p-4 md:p-8 z-10 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        {activeTab === 'inventory' && <InventoryTab products={products} setProducts={setProducts} resellers={resellers} />}
        {activeTab === 'orders' && <OrdersTab resellers={resellers} setResellers={setResellers} directOrders={directOrders} setDirectOrders={setDirectOrders!} products={products} setProducts={setProducts} adminClients={adminClients} setAdminClients={setAdminClients} coupons={coupons} />}
        {activeTab === 'promotions' && <PromotionsTab banners={banners} setBanners={setBanners} products={products} coupons={coupons} setCoupons={setCoupons!} />}
        {activeTab === 'resellers' && <ResellersTab resellers={resellers} setResellers={setResellers} products={products} />}
        {activeTab === 'clients' && <ClientsTab adminClients={adminClients} setAdminClients={setAdminClients} />}
        {activeTab === 'messages' && <MessagesTab resellers={resellers} setResellers={setResellers} />}
        {activeTab === 'analytics' && <AnalyticsTab products={products} resellers={resellers} adminSales={adminSales!} setResellers={setResellers} />}
        {activeTab === 'settings' && <SettingsTab siteContent={siteContent} setSiteContent={setSiteContent} contactInfo={contactInfo} setContactInfo={setContactInfo} paymentConfig={paymentConfig} setPaymentConfig={setPaymentConfig} />}
        {activeTab === 'adminSales' && <AdminSales products={products} setProducts={setProducts} adminClients={adminClients} setAdminClients={setAdminClients} adminSales={adminSales} setAdminSales={setAdminSales!} coupons={coupons} />}
      </div>
    </div>
  );
};
