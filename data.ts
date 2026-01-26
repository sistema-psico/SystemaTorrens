import { Product, ContactInfo, Banner, Reseller, Client, SiteContent, PaymentConfig, SocialReview, PeptoneFormula } from './types';

export const linfarCatalog: PeptoneFormula[] = [
    { 
        code: 'APG', 
        name: 'Arteriotrófica Potenciada', 
        ingredients: 'Páncreas, Arterias, Nicotinamida, B6, C', 
        recommendations: 'Arteriosclerosis, metabolismo lipídico, potencia.', 
        description: 'Actúa sobre la pared de los vasos y sobre el metabolismo en general. Produce espasmolisis arterial, recuperación de la permeabilidad selectiva del endotelio vascular, normalización y regulación del metabolismo lipídico. Geriátrico por excelencia. Arteriosclerosis en todas sus formas. Poderoso coadyuvante en impotencia.',
        presentations: ['Ampollas', 'Comprimidos', 'Gotas'] 
    },
    { 
        code: 'ART', 
        name: 'Articular', 
        ingredients: 'Colágeno, Cartílago', 
        recommendations: 'Artrosis, Artritis, Fracturas, Lupus.', 
        description: 'Revitaliza los elementos constitutivos de las articulaciones y el tejido colágeno en general. Indicado en Colagenosis, Artritis reumatoidea, Poliartritis, Lupus eritematoso, Esclerodermia, Artrosis, Artrogénesis imperfecta, Fracturas y Luxaciones.',
        presentations: ['Ampollas', 'Comprimidos', 'Gotas'] 
    },
    // ... Puedes agregar el resto del catálogo aquí si lo necesitas completo ...
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

  resellerDiscount: 30,
  globalOfferDiscount: 0
};

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
    {
        id: 'rev-1',
        imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=300&auto=format&fit=crop', 
        brand: 'informa'
    },
    {
        id: 'rev-2',
        imageUrl: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=300&auto=format&fit=crop', 
        brand: 'phisis'
    }
];

export const initialProducts: Product[] = [
  {
    id: 'IF-001',
    name: 'Max Training',
    brand: 'informa',
    category: 'Alto Rendimiento',
    price: 18500,
    description: 'Bebida completa hidratante y energizante.',
    longDescription: 'Diseñado para atletas de alto rendimiento, Max Training combina electrolitos esenciales con una matriz de carbohidratos de liberación sostenida.',
    image: '/images/products/max-training.jpg',
    features: ['Hidratación', 'Energía', 'Recuperación'],
    stock: 50,
    active: true
  },
  // ... Resto de productos iniciales ...
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
    }
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
