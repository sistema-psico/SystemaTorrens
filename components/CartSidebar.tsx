import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, Check, ArrowRight, CreditCard, Wallet, Banknote, ShieldCheck, Copy, CheckCircle2, MapPin, Phone, FileText, User as UserIcon, Tag } from 'lucide-react';
import { CartItem, Brand, ContactInfo, User, PaymentConfig, ResellerOrder, Coupon } from '../types';
import Toast, { ToastType } from './Toast';

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
  coupons?: Coupon[];
}

type CheckoutStep = 'cart' | 'customer-info' | 'payment';
type PaymentType = 'full' | 'deposit'; 
type PaymentMethod = 'transfer' | 'card' | 'cash';

const CartSidebar: React.FC<CartSidebarProps> = ({ 
  isOpen, onClose, cart, onRemoveItem, onUpdateQuantity, activeBrand, contactInfo, paymentConfig, onOrderCreate, coupons = []
}) => {
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart');
  const [paymentType, setPaymentType] = useState<PaymentType>('full');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [copiedAlias, setCopiedAlias] = useState(false);
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  
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

  const bgMain = isSports ? 'bg-[#0f0f0f]' : isIqual ? 'bg-slate-900' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-600';
  const accentBg = isSports ? 'bg-[#ccff00]' : isIqual ? 'bg-indigo-600' : isBio ? 'bg-blue-900' : 'bg-emerald-800';
  const accentTextBtn = isSports ? 'text-black' : 'text-white';
  const borderCol = isDark ? 'border-white/10' : 'border-gray-100';

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

  const handleApplyCoupon = () => {
      if (!couponCode.trim()) return;
      const found = coupons.find(c => c.code === couponCode.toUpperCase().trim() && c.active);
      if (found) {
          setAppliedCoupon(found);
          showToast(`Cupón aplicado: -${found.discountPercentage}%`, 'success');
      } else {
          showToast('Cupón inválido', 'error');
          setAppliedCoupon(null);
      }
  };

  const handleConfirmAndWhatsApp = () => {
    const cleanStorePhone = contactInfo.phone.replace(/[^\d]/g, '');
    if (!paymentMethod) { showToast("Selecciona un método de pago."); return; }
    if (!customerName.trim() || !customerAddress.trim() || !customerPhone.trim()) { showToast("Completa los datos de envío."); return; }

    const newOrder: ResellerOrder = {
        id: `WEB-${Date.now()}`,
        clientId: 'guest-manual',
        clientName: customerName,
        items: [...cart],
        total: total,
        status: 'Pendiente', 
        date: new Date().toLocaleDateString(),
        type: 'direct',
        amountPaid: payNowAmount,
        balanceDue: payLaterAmount,
        paymentStatus: payLaterAmount > 0 ? 'partial' : 'paid',
        appliedCoupon: appliedCoupon ? appliedCoupon.code : undefined,
        shippingInfo: {
            address: customerAddress,
            phone: customerPhone,
            notes: orderNotes,
            paymentMethodChosen: paymentMethod
        }
    };
    onOrderCreate(newOrder);

    let message = `*NUEVO PEDIDO WEB* 🛒\n`;
    message += `Cliente: *${customerName}*\n\n*DETALLE:*\n`;
    cart.forEach(item => { message += `▪️ ${item.quantity}x ${item.name}\n`; });

    if (appliedCoupon) message += `\nCupón ${appliedCoupon.code}: -${appliedCoupon.discountPercentage}%`;
    message += `\n*Total Final: $${total.toLocaleString()}*\n`;
    message += `Pago: ${paymentMethod.toUpperCase()} (${paymentType === 'full' ? '100%' : '50% Seña'})\n`;
    message += `✅ A PAGAR AHORA: *$${payNowAmount.toLocaleString()}*\n`;
    
    // Si elige transferencia, agregamos el Alias y la instrucción del comprobante
    if (paymentMethod === 'transfer') {
        message += `\n*DATOS PARA TRANSFERENCIA:* 🏦\n`;
        message += `Alias: *${paymentConfig.transfer.alias}*\n`;
        message += `Banco: *${paymentConfig.transfer.bankName}*\n`;
        message += `\n⚠️ *IMPORTANTE:* Por favor, una vez realizado el pago, envíe el comprobante a este número para confirmar su pedido.`;
    } else {
        message += `\n⚠️ Por favor, envíe este mensaje para que podamos procesar su pedido.`;
    }

    if (payLaterAmount > 0) message += `\n\n⚠️ PENDIENTE ENTREGA: *$${payLaterAmount.toLocaleString()}*`;
    message += `\n\n*DATOS DE ENVÍO:*\n📍 ${customerAddress}\n📞 ${customerPhone}`;
    if (orderNotes) message += `\n📝 Nota: ${orderNotes}`;

    window.open(`https://wa.me/${cleanStorePhone}?text=${encodeURIComponent(message)}`, '_blank');
    resetFlow();
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
         
         <div className={`px-6 py-5 border-b flex items-center justify-between ${borderCol}`}>
            <div className="flex items-center gap-3">
                <ShoppingBag className={`w-5 h-5 ${isDark ? 'text-white' : 'text-blue-900'}`} />
                <h2 className={`text-lg font-bold ${textMain}`}>
                    {checkoutStep === 'cart' && "Tu Carrito"}
                    {checkoutStep === 'customer-info' && "Datos Personales"}
                    {checkoutStep === 'payment' && "Finalizar Pedido"}
                </h2>
            </div>
            <button onClick={resetFlow} className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
            {checkoutStep === 'cart' && (
                <div className="p-6 space-y-6">
                    {cart.map((item) => (
                         <div key={item.id} className="flex gap-4">
                             <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"><img src={item.image} className="w-full h-full object-cover" /></div>
                             <div className="flex-1">
                                 <h3 className={`font-bold text-sm ${textMain}`}>{item.name}</h3>
                                 <div className="flex justify-between mt-2">
                                     <span className={textMuted}>x{item.quantity}</span>
                                     <span className={textMain}>${item.price.toLocaleString()}</span>
                                 </div>
                             </div>
                             <button onClick={() => onRemoveItem(item.id)}><Trash2 className="w-4 h-4 text-red-500" /></button>
                         </div>
                    ))}
                    {cart.length === 0 && <p className={`${textMuted} text-center mt-10`}>Tu carrito está vacío</p>}
                </div>
            )}

            {checkoutStep === 'customer-info' && (
                <div className="p-6 space-y-5 animate-fade-in">
                    <div>
                        <label className={`block text-xs font-bold mb-1 uppercase ${textMuted}`}>Nombre y Apellido *</label>
                        <div className={`flex items-center px-3 py-2 rounded-lg border ${isDark ? 'bg-black/40 border-white/10' : 'bg-white border-gray-200'}`}>
                            <UserIcon className={`w-4 h-4 mr-2 ${textMuted}`} />
                            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={`flex-1 bg-transparent outline-none text-sm ${textMain}`} placeholder="Ej: Juan Pérez" />
                        </div>
                    </div>
                    <div>
                        <label className={`block text-xs font-bold mb-1 uppercase ${textMuted}`}>WhatsApp de contacto *</label>
                        <div className={`flex items-center px-3 py-2 rounded-lg border ${isDark ? 'bg-black/40 border-white/10' : 'bg-white border-gray-200'}`}>
                            <Phone className={`w-4 h-4 mr-2 ${textMuted}`} />
                            <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className={`flex-1 bg-transparent outline-none text-sm ${textMain}`} placeholder="Ej: 11 1234 5678" />
                        </div>
                    </div>
                    <div>
                        <label className={`block text-xs font-bold mb-1 uppercase ${textMuted}`}>Dirección de Entrega *</label>
                        <div className={`flex items-center px-3 py-2 rounded-lg border ${isDark ? 'bg-black/40 border-white/10' : 'bg-white border-gray-200'}`}>
                            <MapPin className={`w-4 h-4 mr-2 ${textMuted}`} />
                            <input type="text" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className={`flex-1 bg-transparent outline-none text-sm ${textMain}`} placeholder="Calle, Número, Piso/Apto, Localidad" />
                        </div>
                    </div>
                    <div>
                        <label className={`block text-xs font-bold mb-1 uppercase ${textMuted}`}>Notas adicionales</label>
                        <div className={`flex items-start px-3 py-2 rounded-lg border ${isDark ? 'bg-black/40 border-white/10' : 'bg-white border-gray-200'}`}>
                            <FileText className={`w-4 h-4 mr-2 mt-1 ${textMuted}`} />
                            <textarea rows={2} value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} className={`flex-1 bg-transparent outline-none text-sm ${textMain} resize-none`} placeholder="Indicaciones para el repartidor..." />
                        </div>
                    </div>
                </div>
            )}

            {checkoutStep === 'payment' && (
                <div className="p-6 space-y-8 animate-fade-in">
                     <div className={`p-4 rounded-xl border-2 transition-all ${isDark ? 'border-white/10 bg-black/40' : 'border-gray-200 bg-gray-50'}`}>
                         <p className={`text-xs font-bold uppercase mb-1 ${textMuted}`}>Enviando a:</p>
                         <p className={`text-sm font-bold ${textMain}`}>{customerName}</p>
                         <p className={`text-xs ${textMuted}`}>{customerAddress}</p>
                     </div>

                     <div>
                        <h3 className={`font-bold mb-3 ${textMain}`}>1. Modalidad de Pago</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setPaymentType('full')} className={`p-4 rounded-xl border-2 transition-all text-left relative ${paymentType === 'full' ? (isSports ? 'border-[#ccff00] bg-[#ccff00]/10' : 'border-blue-600 bg-blue-50') : (isDark ? 'border-white/10' : 'border-gray-200')}`}>
                                <span className={`block text-[10px] font-bold uppercase ${textMuted}`}>Total</span>
                                <span className={`block font-bold text-lg ${textMain}`}>100%</span>
                            </button>
                            <button onClick={() => setPaymentType('deposit')} className={`p-4 rounded-xl border-2 transition-all text-left relative ${paymentType === 'deposit' ? (isSports ? 'border-[#ccff00] bg-[#ccff00]/10' : 'border-blue-600 bg-blue-50') : (isDark ? 'border-white/10' : 'border-gray-200')}`}>
                                <span className={`block text-[10px] font-bold uppercase ${textMuted}`}>Seña</span>
                                <span className={`block font-bold text-lg ${textMain}`}>50%</span>
                            </button>
                        </div>
                     </div>

                     <div>
                        <h3 className={`font-bold mb-3 ${textMain}`}>2. Medio de Pago</h3>
                        <div className="space-y-2">
                            {paymentConfig.transfer.enabled && (
                                <button onClick={() => setPaymentMethod('transfer')} className={`w-full p-3 rounded-lg flex items-center gap-3 border ${paymentMethod === 'transfer' ? (isSports ? 'bg-[#ccff00] text-black' : 'bg-blue-900 text-white') : (isDark ? 'border-white/10 text-gray-300' : 'border-gray-200 text-gray-700')}`}>
                                    <Banknote className="w-5 h-5" /> Transferencia Bancaria
                                </button>
                            )}
                            <button onClick={() => setPaymentMethod('cash')} className={`w-full p-3 rounded-lg flex items-center gap-3 border ${paymentMethod === 'cash' ? (isSports ? 'bg-[#ccff00] text-black' : 'bg-blue-900 text-white') : (isDark ? 'border-white/10 text-gray-300' : 'border-gray-200 text-gray-700')}`}>
                                <Wallet className="w-5 h-5" /> Efectivo / Contra-entrega
                            </button>
                        </div>
                     </div>
                </div>
            )}
        </div>

        <div className={`p-6 border-t ${borderCol} space-y-4`}>
            {checkoutStep === 'cart' && cart.length > 0 && (
                <>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Cupón" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className={`flex-1 p-2 rounded-lg border text-sm ${isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-200'}`} />
                        <button onClick={handleApplyCoupon} className={`px-4 py-2 rounded-lg font-bold text-xs ${accentBg} ${accentTextBtn}`}>Aplicar</button>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold">
                        <span className={textMain}>Total</span>
                        <span className={textMain}>${total.toLocaleString()}</span>
                    </div>
                    <button onClick={() => setCheckoutStep('customer-info')} className={`w-full py-4 rounded-xl font-bold ${accentBg} ${accentTextBtn}`}>CONTINUAR</button>
                </>
            )}

            {checkoutStep === 'customer-info' && (
                <div className="flex gap-3">
                    <button onClick={() => setCheckoutStep('cart')} className={`flex-1 py-4 rounded-xl font-bold border ${isDark ? 'border-white/10 text-white' : 'border-gray-200 text-gray-700'}`}>VOLVER</button>
                    <button onClick={() => setCheckoutStep('payment')} disabled={!customerName || !customerPhone || !customerAddress} className={`flex-[2] py-4 rounded-xl font-bold ${accentBg} ${accentTextBtn} disabled:opacity-50`}>SIGUIENTE</button>
                </div>
            )}

            {checkoutStep === 'payment' && (
                <div className="space-y-4">
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-black/40' : 'bg-gray-50'}`}>
                        <div className="flex justify-between text-sm mb-1"><span className={textMuted}>Total a pagar ahora:</span><span className={`font-bold ${textMain}`}>${payNowAmount.toLocaleString()}</span></div>
                        {payLaterAmount > 0 && <div className="flex justify-between text-xs text-yellow-600"><span>Pendiente entrega:</span><span>${payLaterAmount.toLocaleString()}</span></div>}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setCheckoutStep('customer-info')} className={`flex-1 py-4 rounded-xl font-bold border ${isDark ? 'border-white/10 text-white' : 'border-gray-200 text-gray-700'}`}>VOLVER</button>
                        <button onClick={handleConfirmAndWhatsApp} disabled={!paymentMethod} className={`flex-[2] py-4 rounded-xl font-bold ${accentBg} ${accentTextBtn} disabled:opacity-50`}>CONFIRMAR</button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
