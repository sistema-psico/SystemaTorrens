import React, { useState, useMemo, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail'; 
import RecommendationQuiz from './components/RecommendationQuiz'; 
import BioFarmaCatalog from './components/BioFarmaCatalog'; 
import CartSidebar from './components/CartSidebar';
import { AdminPanel } from './components/AdminPanel';
import ResellerPanel from './components/ResellerPanel';
import Login from './components/Login';
import SocialProof from './components/SocialProof';
import InstallAppButton from './components/InstallAppButton';
import { initialProducts, initialContactInfo, initialBanners, initialResellers, initialAdminClients, initialSiteContent, initialPaymentConfig, initialSocialReviews, initialCoupons } from './data';
import { Product, CartItem, Category, ContactInfo, Banner, Reseller, Client, SiteContent, User, PaymentConfig, SocialReview, Brand, PeptoneFormula, ResellerOrder, Sale, Coupon } from './types';
import { Sparkles, SlidersHorizontal, Lock, MapPin, Phone, Mail, Instagram, Bell } from 'lucide-react';

import { useFirestore } from './hooks/useFirestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';

const ADMIN_EMAILS = [
    'edur900@gmail.com', 
    'gabrieletorrens@gmail.com'     
];

function App() {
  const [products, setProducts] = useFirestore<Product[]>('products', initialProducts);
  const [contactInfo, setContactInfo] = useFirestore<ContactInfo>('contactInfo', initialContactInfo);
  const [paymentConfig, setPaymentConfig] = useFirestore<PaymentConfig>('paymentConfig', initialPaymentConfig);
  const [banners, setBanners] = useFirestore<Banner[]>('banners', initialBanners);
  const [resellers, setResellers] = useFirestore<Reseller[]>('resellers', initialResellers);
  const [adminClients, setAdminClients] = useFirestore<Client[]>('adminClients', initialAdminClients);
  const [siteContent, setSiteContent] = useFirestore<SiteContent>('siteContent', initialSiteContent);
  const [socialReviews, setSocialReviews] = useFirestore<SocialReview[]>('socialReviews', initialSocialReviews);
  const [coupons, setCoupons] = useFirestore<Coupon[]>('coupons', initialCoupons); // NUEVO HOOK CUPONES
  
  const [directOrders, setDirectOrders] = useFirestore<ResellerOrder[]>('directOrders', []);
  const [adminSales, setAdminSales] = useFirestore<Sale[]>('adminSales', []);
  
  const [currentView, setCurrentView] = useState<'shop' | 'admin' | 'reseller' | 'login'>('shop');

  const [activeBrand, setActiveBrand] = useState<Brand>(() => {
      const params = new URLSearchParams(window.location.search);
      const brandParam = params.get('brand');
      if (brandParam === 'informa' || brandParam === 'phisis' || brandParam === 'iqual' || brandParam === 'biofarma') {
          return brandParam as Brand;
      }
      return 'informa';
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [loggedReseller, setLoggedReseller] = useState<Reseller | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todos');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const lastNotifiedMsgId = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && ADMIN_EMAILS.includes(user.email || '')) {
        console.log("Sesión de Admin restaurada:", user.email);
        setCurrentView('admin');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (resellers.length > 0) {
      const savedResellerId = localStorage.getItem('loggedResellerId');
      if (savedResellerId) {
        const found = resellers.find(r => r.id === savedResellerId && r.active);
        if (found) {
          console.log("Sesión de Revendedor restaurada:", found.name);
          setLoggedReseller(found);
          setCurrentView('reseller');
        } else {
          localStorage.removeItem('loggedResellerId');
        }
      }
    }
  }, [resellers]);

  useEffect(() => {
      if (loggedReseller && currentView === 'reseller') {
          const updatedUser = resellers.find(r => r.id === loggedReseller.id);
          if (updatedUser) {
              if (JSON.stringify(updatedUser) !== JSON.stringify(loggedReseller)) {
                  setLoggedReseller(updatedUser);
              }

              const lastMsg = updatedUser.messages[updatedUser.messages.length - 1];
              if (lastMsg && lastMsg.sender === 'admin' && !lastMsg.read && lastMsg.id !== lastNotifiedMsgId.current) {
                  const isOrderUpdate = lastMsg.content.includes('pedido');
                  setToastMessage(isOrderUpdate ? "📦 Actualización de Pedido" : "💬 Nuevo mensaje del Administrador");
                  setShowToast(true);
                  lastNotifiedMsgId.current = lastMsg.id;
                  const timer = setTimeout(() => setShowToast(false), 4000);
                  return () => clearTimeout(timer);
              }
          }
      }
  }, [resellers, loggedReseller, currentView]);

  const filteredProducts = useMemo(() => {
      return products.filter(p => {
          const brandMatch = p.brand === activeBrand;
          const categoryMatch = selectedCategory === 'Todos' || p.category === selectedCategory;
          const isActive = p.active === true;
          return brandMatch && categoryMatch && isActive;
      });
  }, [products, activeBrand, selectedCategory]);

  const handleUnifiedLogin = (type: 'admin' | 'reseller' | 'client', data?: any) => {
      if (type === 'admin') {
          setCurrentView('admin');
      } else if (type === 'reseller' && data) {
          setLoggedReseller(data);
          setCurrentView('reseller');
          localStorage.setItem('loggedResellerId', data.id);
      } else if (type === 'client' && data) {
          setCurrentUser(data);
          setCurrentView('shop');
          setIsCartOpen(true);
      }
  };

  const handleLogoutAdmin = async () => {
      await signOut(auth); 
      setCurrentView('shop');
  };

  const handleLogoutReseller = () => {
      setLoggedReseller(null);
      localStorage.removeItem('loggedResellerId'); 
      setCurrentView('shop');
  };

  const handleGoogleAuthLogic = (googleUser: User) => {
      const foundReseller = resellers.find(r => r.email.toLowerCase() === googleUser.email.toLowerCase() && r.active);

      if (foundReseller) {
          setLoggedReseller(foundReseller);
          setCurrentView('reseller');
          localStorage.setItem('loggedResellerId', foundReseller.id); 
          setIsCartOpen(false);
          
          setToastMessage(`Bienvenido Partner: ${foundReseller.name}`);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
      } else {
          setCurrentUser(googleUser);
      }
  };

  const categories: Category[] = ['Todos', ...Array.from(new Set(
    products.filter(p => p.brand === activeBrand).map(p => p.category)
  ))].sort() as Category[];

  const addToCart = (product: Product, quantity: number = 1, discount: number = 0) => {
    if (product.stock < quantity) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity + quantity > product.stock) return prev;
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity, discount: Math.max(item.discount || 0, discount) } : item);
      }
      return [...prev, { ...product, quantity: quantity, discount: discount }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    const product = products.find(p => p.id === id) || cart.find(i => i.id === id);
    if (!product) return;
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty > product.stock) return item;
        const finalQty = Math.max(0, newQty);
        return { ...item, quantity: finalQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleSelectPeptone = (item: PeptoneFormula) => {
      const productPayload: Product = {
            id: `PEP-${item.code}`,
            name: `Linfar ${item.code} - ${item.name}`,
            brand: 'biofarma',
            category: 'Peptonas',
            price: 28900,
            description: item.recommendations,
            longDescription: item.description,
            features: [item.ingredients, ...item.presentations],
            image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop',
            stock: 100,
            active: true
      };
      setSelectedProduct(productPayload);
  };

  const handleDirectOrder = (order: ResellerOrder) => {
      setDirectOrders([order, ...directOrders]);
      setCart([]);
      setIsCartOpen(false);
  };

  const isSports = activeBrand === 'informa';
  const isIqual = activeBrand === 'iqual';
  const isBio = activeBrand === 'biofarma';

  const getBgClass = () => {
      if (isSports) return 'bg-[#0a0a0a]';
      if (isIqual) return 'bg-slate-900';
      if (isBio) return 'bg-white';
      return 'bg-stone-50';
  };

  const getCatBtnClass = (isActive: boolean) => {
      if (isActive) {
          if (isSports) return 'bg-[#ccff00] text-black font-bold shadow-[0_0_20px_rgba(204,255,0,0.3)]';
          if (isIqual) return 'bg-indigo-600 text-white font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)]';
          if (isBio) return 'bg-blue-900 text-white font-bold shadow-lg';
          return 'bg-emerald-800 text-white shadow-lg';
      } else {
          if (isSports) return 'bg-zinc-800/50 border border-white/10 text-gray-300 hover:bg-zinc-700/50 hover:border-[#ccff00]/50';
          if (isIqual) return 'bg-slate-800/50 border border-white/10 text-slate-300 hover:bg-slate-700/50 hover:border-indigo-500/50';
          if (isBio) return 'bg-blue-50 border border-blue-100 text-blue-900 hover:bg-blue-100';
          return 'bg-white/60 border border-stone-200 text-stone-600 hover:bg-white/80';
      }
  };

  if (currentView === 'login') {
      return (
          <Login 
            resellers={resellers}
            onLoginSuccess={handleUnifiedLogin}
            onClose={() => setCurrentView('shop')}
          />
      );
  }

  if (currentView === 'admin') {
      return (
        <AdminPanel 
            products={products}
            setProducts={setProducts}
            contactInfo={contactInfo}
            setContactInfo={setContactInfo}
            paymentConfig={paymentConfig}
            setPaymentConfig={setPaymentConfig}
            banners={banners}
            setBanners={setBanners}
            socialReviews={socialReviews}
            setSocialReviews={setSocialReviews}
            resellers={resellers}
            setResellers={setResellers}
            adminClients={adminClients}
            setAdminClients={setAdminClients}
            onClose={handleLogoutAdmin}
            siteContent={siteContent}
            setSiteContent={setSiteContent}
            directOrders={directOrders}
            setDirectOrders={setDirectOrders}
            adminSales={adminSales} 
            setAdminSales={setAdminSales}
            coupons={coupons} // Pasamos los cupones
            setCoupons={setCoupons}
        />
      );
  }

  if (currentView === 'reseller') {
    return (
        <>
            <ResellerPanel 
                resellers={resellers}
                setResellers={setResellers}
                onClose={handleLogoutReseller} 
                initialUser={loggedReseller}
                products={products}
                siteContent={siteContent}
            />
            {showToast && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-[#ccff00] text-black px-6 py-3 rounded-full shadow-2xl z-[100] animate-slide-up font-bold flex items-center gap-2 border border-black/10">
                    <Bell className="w-4 h-4" /> {toastMessage}
                </div>
            )}
        </>
    );
  }

  return (
    <div className={`min-h-screen relative transition-colors duration-700 ${getBgClass()}`}>
      {/* ... (resto del JSX del Hero, Main, Footer se mantiene igual) ... */}
      <div className="relative z-10">
        <Navbar 
            cart={cart} 
            onCartClick={() => setIsCartOpen(true)} 
            activeBrand={activeBrand}
            onBrandSwitch={(brand) => {
                setActiveBrand(brand);
                setSelectedCategory('Todos');
            }}
            currentUser={currentUser}
            siteContent={siteContent}
        />
        
        <Hero 
            activeBrand={activeBrand} 
            banners={banners}
            products={products}
            onAddBundleToCart={addToCart}
            siteContent={siteContent}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* ... (Contenido principal igual) ... */}
            {filteredProducts.length > 0 && (
                <div className="mb-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product, idx) => (
                        <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                            <ProductCard 
                                product={product} 
                                onAddToCart={(p) => addToCart(p, 1)} 
                                onClick={(p) => setSelectedProduct(p)}
                            />
                        </div>
                        ))}
                    </div>
                </div>
            )}
        </main>

        <CartSidebar 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)}
            cart={cart}
            onRemoveItem={removeFromCart}
            onUpdateQuantity={updateQuantity}
            activeBrand={activeBrand}
            contactInfo={contactInfo}
            paymentConfig={paymentConfig}
            currentUser={currentUser}
            onLoginRequest={() => { setIsCartOpen(false); setCurrentView('login'); }}
            onClientLogin={handleGoogleAuthLogic} 
            onOrderCreate={handleDirectOrder} 
            coupons={coupons} // Pasamos los cupones al carrito
        />

        {selectedProduct && (
            <ProductDetail 
                product={selectedProduct} 
                onClose={() => setSelectedProduct(null)}
                onAddToCart={(p, qty) => { addToCart(p, qty); setIsCartOpen(true); }}
            />
        )}
      </div>
    </div>
  );
}

export default App;
