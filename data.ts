import { Product, ContactInfo, Banner, Reseller, Client, SiteContent, PaymentConfig, SocialReview, PeptoneFormula } from './types';

export const linfarCatalog: PeptoneFormula[] = [
    // ... (Mantén tu catálogo de peptonas aquí, lo omito para brevedad pero NO lo borres)
    { 
        code: 'APG', 
        name: 'Arteriotrófica Potenciada', 
        ingredients: 'Páncreas, Arterias, Nicotinamida, B6, C', 
        recommendations: 'Arteriosclerosis, metabolismo lipídico, potencia.', 
        description: 'Actúa sobre la pared de los vasos y sobre el metabolismo en general...',
        presentations: ['Ampollas', 'Comprimidos', 'Gotas'] 
    },
    // ... resto de peptonas ...
];

export const initialSiteContent: SiteContent = {
  sportsHeroTitle1: "ALTO",
  sportsHeroTitle2: "RENDIMIENTO",
  sportsHeroDescription: "Elegí avanzar con seguridad, sin riesgos ni falsas promesas. Natural. Seguro. Efectivo.",
  logoInforma: "",
  sportsHeroBg: "",
  
  beautyHeroTitle1: "Belleza que nace",
  beautyHeroTitle2: "desde adentro",
  beautyHeroDescription: "Fórmulas diseñadas para actuar desde el interior de cada célula. Ciencia y naturaleza en perfecto equilibrio.",
  logoPhisis: "",
  beautyHeroBg: "",
  
  fragranceHeroTitle1: "Tu misma",
  fragranceHeroTitle2: "Esencia",
  fragranceHeroDescription: "Fragancias genderless y cuidado personal que conectan con quien realmente sos. Sin etiquetas, solo aroma.",
  logoIqual: "",
  fragranceHeroBg: "",

  bioHeroTitle1: "Ciencia y Naturaleza",
  bioHeroTitle2: "para una Salud Integral",
  bioHeroDescription: "Nutrición biológica y genética de vanguardia. Restauramos el equilibrio orgánico desde el núcleo celular.",
  logoBiofarma: "",
  bioHeroBg: "",

  // --- NUEVA CONFIGURACIÓN INICIAL ---
  resellerDiscount: 30, // 30% por defecto
  globalOfferDiscount: 0 // 0% por defecto (apagado)
};

// ... El resto del archivo data.ts se mantiene igual (ContactInfo, PaymentConfig, Products, etc.)
export const initialContactInfo: ContactInfo = {
  email: "contacto@informa-phisis.com",
  phone: "+54 9 11 1234 5678",
  address: "Av. Corrientes 1234, Buenos Aires",
  instagram: "@iqualargentina"
};

export const initialPaymentConfig: PaymentConfig = {
    cash: { enabled: true },
    card: { enabled: true },
    transfer: { 
        enabled: true, 
        alias: "INFORMA.PHISIS.MP", 
        cbu: "0000003100000000000000", 
        bankName: "Mercado Pago",
        holderName: "In Forma S.A."
    }
};

export const initialSocialReviews: SocialReview[] = [
    { id: 'rev-1', imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=300&auto=format&fit=crop', brand: 'informa' },
    { id: 'rev-2', imageUrl: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=300&auto=format&fit=crop', brand: 'phisis' },
];

export const initialProducts: Product[] = [
  // ... Tus productos actuales ...
  {
    id: 'IF-001',
    name: 'Max Training',
    brand: 'informa',
    category: 'Alto Rendimiento',
    price: 18500,
    description: 'Bebida completa hidratante y energizante.',
    image: '/images/products/max-training.jpg',
    stock: 50,
    active: true
  },
  // ... etc ...
];

export const initialBanners: Banner[] = [
    {
        id: 'B-001',
        title: 'PACK FUERZA TOTAL',
        description: 'Llevá tu entrenamiento al límite con Max Training + Whey Protein. ¡15% OFF en el pack!',
        image: '/images/banners/banner-sports.jpg',
        brand: 'informa',
        active: true,
        discountPercentage: 15,
        relatedProducts: [
            { productId: 'IF-001', quantity: 1, discountPercentage: 15 },
        ]
    },
];

export const initialResellers: Reseller[] = [
    {
        id: 'R-001',
        name: 'Distribuidora Norte',
        email: 'vendedor@informa.com',
        password: '1234',
        region: 'Zona Norte',
        active: true,
        stock: [],
        clients: [],
        orders: [],
        sales: [],
        messages: [],
        points: 1250
    }
];

export const initialAdminClients: Client[] = [];
