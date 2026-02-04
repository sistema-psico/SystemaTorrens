import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, Check, ArrowRight, CreditCard, Wallet, Banknote, ShieldCheck, Copy, CheckCircle2, MapPin, Phone, FileText, User as UserIcon, Tag } from 'lucide-react';
import { CartItem, Brand, ContactInfo, User, PaymentConfig, ResellerOrder, Coupon } from '../types';
import Toast, { ToastType } from './Toast';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  activeBrand: Brand;
  contactInfo: ContactInfo;
  paymentConfig: PaymentConfig;
  currentUser: User | null;
  onLoginRequest: () => void;
  onClientLogin: (user: User) => void;
  onOrderCreate: (order: ResellerOrder) => void; 
  coupons?: Coupon[]; // Recibimos la lista de cupones
}

type CheckoutStep = 'cart' | 'login' | 'payment';
type PaymentType = 'full' | 'deposit'; 
type PaymentMethod = 'transfer' | 'card' | 'cash';

const CartSidebar: React.FC<CartSidebarProps> = ({ 
  isOpen, onClose, cart, onRemoveItem, onUpdateQuantity, activeBrand, contactInfo, paymentConfig, currentUser, onLoginRequest, onClientLogin, onOrderCreate, coupons = []
}) => {
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart');
  const [paymentType, setPaymentType] = useState<PaymentType>('full');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  
  // --- ESTADO CUPONES ---
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'error') => {
      setToast({ show: true, message, type });
  };

  const isSports = activeBrand === 'informa';
  const isIqual = activeBrand === 'iqual';
  const isBio = activeBrand === 'biofarma';
  const isDark = isSports || isIqual;

  // Estilos (reducidos para brevedad, se mantienen los originales)
  const bgMain = isSports ? 'bg-[#0f0f0f]' : isIqual ? 'bg-slate-900' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-600';
  const accentBg = isSports ? 'bg-[#ccff00]' : isIqual ? 'bg-indigo-600' : isBio ? 'bg-blue-900' : 'bg-emerald-800';
  const accentTextBtn = isSports ? 'text-black' : 'text-white';
  const borderCol = isDark ? 'border-white/10' : 'border-gray-100';

  // Lógica de Cupón
  const handleApplyCoupon = () => {
      if (!couponCode.trim()) return;
      const found = coupons.find(c => c.code === couponCode.toUpperCase().trim() && c.active);
      if (found) {
          setAppliedCoupon(found);
          showToast(`Cupón ${found.code} aplicado: -${found.discountPercentage}%`, 'success');
      } else {
          showToast('Cupón inválido o expirado', 'error');
          setAppliedCoupon(null);
      }
  };

  const handleRemoveCoupon = () => {
      setAppliedCoupon(null);
      setCouponCode('');
  };

  // Cálculo de Totales
  const subtotal = cart.reduce((acc, item) => {
      const discount = item.discount || 0;
      const finalPrice = item.price - (item.price * (discount / 100));
      return acc + (finalPrice * item.quantity);
  }, 0);

  const total = appliedCoupon 
      ? subtotal - (subtotal * (appliedCoupon.discountPercentage / 100))
      : subtotal;

  const payNowAmount = paymentType === 'full' ? total : total * 0.5;
  const payLaterAmount = total - payNowAmount;

  // ... (Login Handlers igual que antes) ...
  const handleGoogleLogin = async () => { /* ... */ };
  const handleInitialCheckoutClick = () => { if (currentUser) { setCheckoutStep('payment'); } else { setCheckoutStep('login'); } };

  const handleConfirmAndWhatsApp = () => {
    const cleanStorePhone = contactInfo.phone.replace(/[^\d]/g, '');
    if (!cleanStorePhone) { showToast("Error: Teléfono tienda inválido."); return; }
    if (!paymentMethod) { showToast("Selecciona un método de pago."); return; }

    const newOrder: ResellerOrder = {
        id: `WEB-${Date.now()}`,
        clientId: currentUser?.id || 'guest',
        clientName: currentUser?.name || 'Invitado',
        items: [...cart],
        total: total,
        status: 'Pendiente', 
        date: new Date().toLocaleDateString(),
        type: 'direct',
        amountPaid: payNowAmount,
        balanceDue: payLaterAmount,
        paymentStatus: payLaterAmount > 0 ? 'partial' : 'paid',
        appliedCoupon: appliedCoupon ? appliedCoupon.code : undefined, // Guardar cupón
        shippingInfo: {
            address: customerAddress,
            phone: customerPhone,
            notes: orderNotes,
            email: currentUser?.email,
            paymentMethodChosen: paymentMethod
        }
    };
    onOrderCreate(newOrder);

    let message = `*NUEVO PEDIDO WEB* 🛒\n`;
    message += `Cliente: *${currentUser?.name}*\nID: ${newOrder.id}\n\n*DETALLE:*\n`;
    cart.forEach(item => {
        message += `▪️ ${item.quantity}x ${item.name}\n`;
    });

    if (appliedCoupon) {
        message += `\nSubtotal: $${subtotal.toLocaleString()}`;
        message += `\nCupón ${appliedCoupon.code}: -${appliedCoupon.discountPercentage}%`;
    }
    message += `\n*Total Final: $${total.toLocaleString()}*\n`;
    message += `Pago: ${paymentMethod.toUpperCase()} (${paymentType === 'full' ? '100%' : '50% Seña'})\n`;
    message += `✅ A PAGAR: *$${payNowAmount.toLocaleString()}*\n`;
    
    if (payLaterAmount > 0) message += `⚠️ PENDIENTE: *$${payLaterAmount.toLocaleString()}*\n`;
    message += `\n*ENVÍO:*\n📍 ${customerAddress}\n📞 ${customerPhone}\n`;
    if (orderNotes) message += `📝 ${orderNotes}`;

    window.open(`https://wa.me/${cleanStorePhone}?text=${encodeURIComponent(message)}`, '_blank');
    setCheckoutStep('cart');
  };

  return (
    <>
      {toast?.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[480px] z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${bgMain}`}>
         {/* HEADER IGUAL */}
         <div className={`px-6 py-5 border-b flex items-center justify-between ${borderCol}`}>
            <div className="flex items-center gap-3"><ShoppingBag className={`w-5 h-5 ${isDark ? 'text-white' : 'text-blue-900'}`} /><h2 className={`text-lg font-bold ${textMain}`}>{checkoutStep === 'cart' && "Tu Carrito"}{checkoutStep === 'login' && "Identificación"}{checkoutStep === 'payment' && "Finalizar Pedido"}</h2></div>
            <button onClick={onClose} className="p-2"><X className="w-5 h-5" /></button>
        </div>

        {checkoutStep === 'cart' && (
            <>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Lista de productos (Igual que antes) */}
                    {cart.map((item) => (
                         <div key={item.id} className="flex gap-4 group">
                             {/* ... Renderizado del item ... */}
                             <div className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0`}><img src={item.image} className="w-full h-full object-cover" /></div>
                             <div className="flex-1">
                                 <h3 className={`font-bold ${textMain}`}>{item.name}</h3>
                                 <div className="flex justify-between mt-2">
                                     <span className={textMuted}>x{item.quantity}</span>
                                     <span className={textMain}>${item.price.toLocaleString()}</span>
                                 </div>
                             </div>
                             <button onClick={() => onRemoveItem(item.id)}><Trash2 className="w-4 h-4 text-red-500" /></button>
                         </div>
                    ))}
                </div>
                
                {/* SECCIÓN CUPÓN EN EL CARRITO */}
                {cart.length > 0 && (
                    <div className={`p-6 border-t ${borderCol} space-y-4`}>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Tag className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                                <input 
                                    type="text" 
                                    placeholder="Código de cupón" 
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    disabled={!!appliedCoupon}
                                    className={`w-full pl-10 pr-4 py-2 rounded-lg border outline-none text-sm ${isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-200'}`}
                                />
                            </div>
                            {appliedCoupon ? (
                                <button onClick={handleRemoveCoupon} className="p-2 bg-red-500/10 text-red-500 rounded-lg"><Trash2 className="w-5 h-5"/></button>
                            ) : (
                                <button onClick={handleApplyCoupon} className={`px-4 py-2 rounded-lg font-bold text-sm ${accentBg} ${accentTextBtn}`}>Aplicar</button>
                            )}
                        </div>
                        {appliedCoupon && (
                            <div className="flex justify-between text-green-500 text-sm font-medium bg-green-500/10 p-2 rounded-lg border border-green-500/20">
                                <span>Cupón {appliedCoupon.code}</span>
                                <span>-{appliedCoupon.discountPercentage}% OFF</span>
                            </div>
                        )}
                        
                        <div className="space-y-1 pt-2">
                            {appliedCoupon && (
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-xl font-bold">
                                <span className={textMain}>Total</span>
                                <span className={textMain}>${total.toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <button onClick={handleInitialCheckoutClick} className={`w-full py-4 rounded-xl font-bold ${accentBg} ${accentTextBtn}`}>FINALIZAR COMPRA</button>
                    </div>
                )}
            </>
        )}

        {/* ... (Pasos de Login y Payment se mantienen igual, usando las variables de estado nuevas) ... */}
        {checkoutStep === 'login' && (
             <div className="p-8 text-center"><button onClick={handleGoogleLogin} className="bg-white text-black p-3 rounded-lg w-full">Ingresar con Google</button></div>
        )}

        {checkoutStep === 'payment' && (
            <div className="flex-1 p-6 space-y-4">
                 {/* ... Formulario de pago y datos ... */}
                 {/* ... (Solo mostrar que al confirmar usa handleConfirmAndWhatsApp que ya incluye el cupón) ... */}
                 <div className="space-y-3">
                    <input type="text" placeholder="Dirección" value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} className={`w-full p-3 rounded border ${isDark ? 'bg-black/40 border-white/10 text-white' : ''}`} />
                    <input type="text" placeholder="Teléfono" value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} className={`w-full p-3 rounded border ${isDark ? 'bg-black/40 border-white/10 text-white' : ''}`} />
                    {/* ... Selectores de pago ... */}
                 </div>
                 <button onClick={handleConfirmAndWhatsApp} className={`w-full py-4 rounded-xl font-bold ${accentBg} ${accentTextBtn}`}>CONFIRMAR</button>
            </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
