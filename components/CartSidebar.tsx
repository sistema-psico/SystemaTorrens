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

  const handleGoogleLogin = async () => {
      setIsAuthenticating(true);
      try {
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          const user = result.user;
          const clientUser: User = {
              id: user.uid,
              name: user.displayName || 'Cliente',
              email: user.email || '',
              avatar: user.photoURL || 'https://via.placeholder.com/150'
          };
          onClientLogin(clientUser);
          showToast(`¡Hola ${clientUser.name}!`, 'success');
          setCheckoutStep('payment');
      } catch (error: any) {
          console.error("Error Google Login:", error);
          showToast("No se pudo iniciar sesión con Google", 'error');
      } finally {
          setIsAuthenticating(false);
      }
  };

  const handleInitialCheckoutClick = () => {
      if (currentUser) {
          setCheckoutStep('payment');
      } else {
          setCheckoutStep('login');
      }
  };

  const handleCopyAlias = () => {
      if (paymentConfig.transfer.alias) {
          navigator.clipboard.writeText(paymentConfig.transfer.alias);
          setCopiedAlias(true);
          showToast("Alias copiado al portapapeles", "success");
          setTimeout(() => setCopiedAlias(false), 2000);
      }
  };

  const handleConfirmAndWhatsApp = () => {
    const cleanStorePhone = contactInfo.phone.replace(/[^\d]/g, '');
    if (!cleanStorePhone) { showToast("Error: Teléfono tienda inválido."); return; }
    if (!paymentMethod) { showToast("Selecciona un método de pago."); return; }
    if (!customerAddress.trim()) { showToast("Ingresa la dirección."); return; }
    if (!customerPhone.trim()) { showToast("Ingresa un teléfono."); return; }

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

  const resetFlow = () => {
      setCheckoutStep('cart');
      onClose();
  };

  return (
    <>
      {toast?.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={resetFlow} />
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[480px] z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${bgMain}`}>
         {/* HEADER IGUAL */}
         <div className={`px-6 py-5 border-b flex items-center justify-between ${borderCol}`}>
            <div className="flex items-center gap-3"><ShoppingBag className={`w-5 h-5 ${isDark ? 'text-white' : 'text-blue-900'}`} /><h2 className={`text-lg font-bold ${textMain}`}>{checkoutStep === 'cart' && "Tu Carrito"}{checkoutStep === 'login' && "Identificación"}{checkoutStep === 'payment' && "Finalizar Pedido"}</h2></div>
            <button onClick={resetFlow} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><X className="w-5 h-5" /></button>
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
                    {cart.length === 0 && <p className={textMuted + " text-center"}>Carrito Vacío</p>}
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
             <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                 <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-white/5' : isBio ? 'bg-blue-50' : 'bg-emerald-50'}`}><ShieldCheck className={`w-10 h-10 ${isSports ? 'text-[#ccff00]' : isIqual ? 'text-indigo-400' : isBio ? 'text-blue-600' : 'text-emerald-600'}`} /></div>
                 <h3 className={`text-2xl font-bold mb-2 ${textMain}`}>Identifícate</h3>
                 <p className={`mb-8 max-w-xs ${textMuted}`}>Usa tu cuenta de Google para autocompletar tus datos y finalizar la compra rápido y seguro.</p>
                 <button onClick={handleGoogleLogin} disabled={isAuthenticating} className="w-full max-w-sm py-3 px-4 rounded-xl flex items-center justify-center gap-3 font-bold bg-white text-gray-800 shadow-lg hover:bg-gray-100 transition-all border border-gray-200">
                     {isAuthenticating ? 'Conectando...' : (<><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5" />Ingresar con Google</>)}
                 </button>
                 <button onClick={onLoginRequest} className={`mt-6 text-xs hover:underline ${textMuted}`}>¿Eres Revendedor o Administrador? Ingresa aquí</button>
                 <button onClick={() => setCheckoutStep('cart')} className={`mt-4 text-sm font-medium ${isSports ? 'text-[#ccff00]' : 'text-blue-600'}`}>Volver al carrito</button>
            </div>
        )}

        {checkoutStep === 'payment' && (
            <div className="flex-1 flex flex-col h-full animate-fade-in overflow-y-auto">
                 <div className="p-6 space-y-8">
                     <div className={`p-4 rounded-xl flex items-center gap-3 ${isDark ? 'bg-white/5' : isBio ? 'bg-blue-50' : 'bg-emerald-50'}`}>
                         <img src={currentUser?.avatar} className="w-10 h-10 rounded-full" alt="" />
                         <div><p className={`text-sm font-bold ${textMain}`}>{currentUser?.name}</p><p className={`text-xs ${isSports ? 'text-gray-400' : isIqual ? 'text-indigo-200' : isBio ? 'text-blue-700' : 'text-emerald-700'}`}>{currentUser?.email}</p></div>
                     </div>
                     <div>
                        <h3 className={`font-bold mb-3 ${textMain}`}>1. Datos de Entrega</h3>
                        <div className="space-y-3">
                            <div><label className={`block text-xs font-bold mb-1 ml-1 ${textMuted}`}>Dirección Completa</label><div className={`flex items-center px-3 py-2 rounded-lg border ${isDark ? 'bg-black/40 border-white/10' : 'bg-white border-gray-200'}`}><MapPin className={`w-4 h-4 mr-2 ${textMuted}`} /><input type="text" placeholder="Ej: Av. San Martín 123, Piso 2A" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className={`flex-1 bg-transparent outline-none text-sm ${textMain}`} /></div></div>
                            <div><label className={`block text-xs font-bold mb-1 ml-1 ${textMuted}`}>Teléfono de Contacto</label><div className={`flex items-center px-3 py-2 rounded-lg border ${isDark ? 'bg-black/40 border-white/10' : 'bg-white border-gray-200'}`}><Phone className={`w-4 h-4 mr-2 ${textMuted}`} /><input type="tel" placeholder="Ej: 11 1234 5678" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className={`flex-1 bg-transparent outline-none text-sm ${textMain}`} /></div></div>
                            <div><label className={`block text-xs font-bold mb-1 ml-1 ${textMuted}`}>Notas (Opcional)</label><div className={`flex items-start px-3 py-2 rounded-lg border ${isDark ? 'bg-black/40 border-white/10' : 'bg-white border-gray-200'}`}><FileText className={`w-4 h-4 mr-2 mt-0.5 ${textMuted}`} /><textarea rows={2} placeholder="Ej: El timbre no funciona..." value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} className={`flex-1 bg-transparent outline-none text-sm ${textMain} resize-none`} /></div></div>
                        </div>
                     </div>
                     <div><h3 className={`font-bold mb-3 ${textMain}`}>2. Modalidad de Pago</h3><div className="grid grid-cols-2 gap-3"><button onClick={() => setPaymentType('full')} className={`p-4 rounded-xl border-2 transition-all text-left relative ${paymentType === 'full' ? (isSports ? 'border-[#ccff00] bg-[#ccff00]/10' : isIqual ? 'border-indigo-500 bg-indigo-500/10' : isBio ? 'border-blue-600 bg-blue-50' : 'border-emerald-600 bg-emerald-50') : (isDark ? 'border-white/10 bg-black/40' : 'border-gray-200 bg-white')}`}>{paymentType === 'full' && <div className={`absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center ${isSports ? 'bg-[#ccff00] text-black' : isIqual ? 'bg-indigo-500 text-white' : isBio ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}><Check className="w-3 h-3" /></div>}<span className={`block text-xs font-bold uppercase mb-1 ${textMuted}`}>Recomendado</span><span className={`block font-bold text-lg mb-1 ${textMain}`}>100%</span></button><button onClick={() => setPaymentType('deposit')} className={`p-4 rounded-xl border-2 transition-all text-left relative ${paymentType === 'deposit' ? (isSports ? 'border-[#ccff00] bg-[#ccff00]/10' : isIqual ? 'border-indigo-500 bg-indigo-500/10' : isBio ? 'border-blue-600 bg-blue-50' : 'border-emerald-600 bg-emerald-50') : (isDark ? 'border-white/10 bg-black/40' : 'border-gray-200 bg-white')}`}>{paymentType === 'deposit' && <div className={`absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center ${isSports ? 'bg-[#ccff00] text-black' : isIqual ? 'bg-indigo-500 text-white' : isBio ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}><Check className="w-3 h-3" /></div>}<span className={`block text-xs font-bold uppercase mb-1 ${textMuted}`}>Seña</span><span className={`block font-bold text-lg mb-1 ${textMain}`}>50%</span></button></div></div>
                     <div><h3 className={`font-bold mb-3 ${textMain}`}>3. Medio de Pago</h3><div className="space-y-2">{paymentConfig.transfer.enabled && (<div className="space-y-2"><button onClick={() => setPaymentMethod('transfer')} className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${paymentMethod === 'transfer' ? (isSports ? 'bg-[#ccff00] text-black font-bold' : isIqual ? 'bg-indigo-600 text-white font-bold' : isBio ? 'bg-blue-900 text-white font-bold' : 'bg-emerald-800 text-white font-bold') : (isDark ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}`}><Banknote className="w-5 h-5" /> Transferencia Bancaria</button>{paymentMethod === 'transfer' && (<div className={`p-4 rounded-lg border text-sm space-y-3 animate-fade-in ${isDark ? 'bg-black/40 border-white/10' : 'bg-blue-50 border-blue-100'}`}><div className="flex justify-between items-center"><span className={textMuted}>Banco:</span><span className={`font-bold ${textMain}`}>{paymentConfig.transfer.bankName}</span></div><div className="p-3 bg-black/10 rounded flex items-center justify-between border border-black/5"><div className="flex flex-col"><span className="text-[10px] uppercase text-gray-500 font-bold">Alias</span><span className={`font-mono text-lg font-bold ${activeBrand === 'informa' ? 'text-[#ccff00]' : activeBrand === 'iqual' ? 'text-indigo-400' : activeBrand === 'biofarma' ? 'text-blue-800' : 'text-emerald-700'}`}>{paymentConfig.transfer.alias}</span></div><button onClick={handleCopyAlias} className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white hover:bg-gray-50 text-emerald-800 shadow-sm'}`}>{copiedAlias ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}</button></div></div>)}</div>)}{paymentConfig.card.enabled && <button onClick={() => setPaymentMethod('card')} className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${paymentMethod === 'card' ? (isSports ? 'bg-[#ccff00] text-black font-bold' : isIqual ? 'bg-indigo-600 text-white font-bold' : isBio ? 'bg-blue-900 text-white font-bold' : 'bg-emerald-800 text-white font-bold') : (isDark ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}`}><CreditCard className="w-5 h-5" /> Tarjeta Crédito / Débito</button>}{paymentConfig.cash.enabled && <button onClick={() => setPaymentMethod('cash')} className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${paymentMethod === 'cash' ? (isSports ? 'bg-[#ccff00] text-black font-bold' : isIqual ? 'bg-indigo-600 text-white font-bold' : isBio ? 'bg-blue-900 text-white font-bold' : 'bg-emerald-800 text-white font-bold') : (isDark ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}`}><Wallet className="w-5 h-5" /> Efectivo</button>}</div></div>
                     <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'border-white/10 bg-black/20' : 'border-gray-200 bg-gray-50'}`}>
                         <div className="flex justify-between text-sm"><span className={textMuted}>Total Carrito</span><span className={textMain}>${total.toLocaleString()}</span></div>
                         {paymentType === 'deposit' && (
                             <>
                                <div className="flex justify-between text-sm text-yellow-500 border-t border-white/5 pt-2 mt-2">
                                    <span>Pendiente (Contra entrega)</span>
                                    <span className="font-bold">${payLaterAmount.toLocaleString()}</span>
                                </div>
                             </>
                         )}
                         <div className={`border-t pt-2 mt-2 flex justify-between font-bold text-lg ${isDark ? 'border-white/10 ' + (activeBrand === 'informa' ? 'text-[#ccff00]' : 'text-indigo-400') : isBio ? 'border-gray-200 text-blue-800' : 'border-gray-200 text-emerald-700'}`}><span>A Pagar Ahora</span><span>${payNowAmount.toLocaleString()}</span></div>
                     </div>
                 </div>
                 <div className={`p-6 mt-auto border-t ${isDark ? 'border-white/10 bg-black/40' : 'border-gray-100 bg-white'}`}>
                     <button onClick={handleConfirmAndWhatsApp} disabled={!paymentMethod || !customerAddress.trim() || !customerPhone.trim()} className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-lg shadow-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${accentBg} ${accentTextBtn}`}>
                         {paymentMethod === 'transfer' ? "CONFIRMAR Y ENVIAR COMPROBANTE" : "CONFIRMAR PEDIDO"} <ArrowRight className="w-5 h-5" />
                     </button>
                     <button onClick={() => setCheckoutStep('cart')} className={`w-full mt-3 text-sm hover:underline ${textMuted}`}>Volver</button>
                 </div>
            </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
