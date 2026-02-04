export type Brand = 'informa' | 'phisis' | 'iqual' | 'biofarma';

export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
}

export interface SocialReview {
    id: string;
    imageUrl: string;
    brand: Brand | 'both';
}

export interface PaymentMethodConfig {
    enabled: boolean;
    alias?: string;
    cbu?: string;
    bankName?: string;
    holderName?: string;
}

export interface PaymentConfig {
    cash: PaymentMethodConfig;
    transfer: PaymentMethodConfig;
    card: PaymentMethodConfig;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  usageMode?: string;
  price: number;
  brand: Brand;
  category: string;
  image: string;
  features?: string[];
  stock: number;
  active: boolean;
}

export interface PeptoneFormula {
    code: string;
    name: string;
    ingredients: string;
    recommendations: string;
    description: string;
    presentations: ('Ampollas' | 'Comprimidos' | 'Gotas')[];
}

export interface CartItem extends Product {
  quantity: number;
  discount?: number;
  selectedPresentation?: string;
}

export interface SiteContent {
  sportsHeroTitle1: string;
  sportsHeroTitle2: string;
  sportsHeroDescription: string;
  logoInforma?: string;
  sportsHeroBg?: string;
  
  beautyHeroTitle1: string;
  beautyHeroTitle2: string;
  beautyHeroDescription: string;
  logoPhisis?: string;
  beautyHeroBg?: string;
  
  fragranceHeroTitle1: string;
  fragranceHeroTitle2: string;
  fragranceHeroDescription: string;
  logoIqual?: string;
  fragranceHeroBg?: string;

  bioHeroTitle1: string;
  bioHeroTitle2: string;
  bioHeroDescription: string;
  logoBiofarma?: string;
  bioHeroBg?: string;

  resellerDiscount: number; 
  globalOfferDiscount: number; 
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  instagram: string;
}

export interface PromotionItem {
  productId: string;
  quantity: number;
  discountPercentage?: number;
}

export interface Banner {
  id: string;
  title: string;
  description: string;
  image: string;
  brand: Brand;
  active: boolean;
  discountPercentage?: number;
  relatedProducts: PromotionItem[];
}

export type Category = 'Todos' | 'Alto Rendimiento' | 'Adelgazantes' | 'Energizantes' | 'Nutricosmética' | 'Cuidado Piel' | 'Fragancias' | 'Cuidado Corporal' | 'Facial' | 'Salud Integral' | 'Peptonas' | 'Revitalización' | 'Genética';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  paymentMethod: 'Efectivo' | 'Transferencia' | 'Tarjeta';
  currentAccountBalance: number;
  lastOrderDate?: string;
}

export interface Message {
  id: string;
  sender: 'admin' | 'reseller';
  content: string;
  timestamp: string;
  read: boolean;
}

export interface ShippingInfo {
    address: string;
    phone: string;
    notes?: string;
    email?: string;
    paymentMethodChosen: string;
}

export interface ResellerOrder {
  id: string;
  clientId: string; 
  clientName: string;
  items: CartItem[];
  total: number;
  status: 'Pendiente' | 'En Camino' | 'Entregado' | 'Cancelado';
  date: string;
  deliveryTimeEstimate?: string;
  shippingInfo?: ShippingInfo;
  type?: 'reseller' | 'direct';
  
  // --- NUEVOS CAMPOS FINANCIEROS ---
  amountPaid?: number; // Cuanto pagó realmente (el 50% o el 100%)
  balanceDue?: number; // Cuanto debe (el otro 50% o 0)
  paymentStatus?: 'paid' | 'partial' | 'pending';
}

export interface Sale {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
}

export interface Reseller {
  id: string;
  name: string;
  email: string;
  password: string;
  region: string;
  active: boolean;
  stock: Product[];
  clients: Client[];
  orders: ResellerOrder[];
  sales: Sale[];
  messages: Message[];
  points: number;
}
