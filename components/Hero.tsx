import React, { useState, useEffect } from 'react';
import { Brand, Product, Banner, SiteContent, PromotionItem } from '../types';
import { ChevronLeft, ChevronRight, ShoppingCart, Dumbbell, Sparkles, Droplet, Leaf, ArrowRight } from 'lucide-react';

interface HeroProps {
  activeBrand: Brand;
  banners: Banner[];
  products: Product[];
  onAddBundleToCart: (product: Product, quantity: number, discount: number) => void;
  siteContent: SiteContent;
}

const Hero: React.FC<HeroProps> = ({ activeBrand, banners, products, onAddBundleToCart, siteContent }) => {
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    // Filtrar banners activos por marca
    const brandBanners = banners.filter(b => b.brand === activeBrand && b.active);

    useEffect(() => {
        setCurrentBannerIndex(0);
    }, [activeBrand]);

    const nextBanner = () => {
        setCurrentBannerIndex((prev) => (prev + 1) % brandBanners.length);
    };

    const prevBanner = () => {
        setCurrentBannerIndex((prev) => (prev - 1 + brandBanners.length) % brandBanners.length);
    };

    const handleAddBundle = (banner: Banner) => {
        banner.relatedProducts.forEach((item: PromotionItem) => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                onAddBundleToCart(product, item.quantity, banner.discountPercentage || 0);
            }
        });
    };

    const currentBanner = brandBanners[currentBannerIndex];

    const getHeroContent = () => {
        switch (activeBrand) {
            case 'informa':
                return {
                    title1: siteContent.sportsHeroTitle1,
                    title2: siteContent.sportsHeroTitle2,
                    description: siteContent.sportsHeroDescription,
                    logo: siteContent.logoInforma,
                    bgImage: siteContent.sportsHeroBg,
                    title2Color: 'text-[#ccff00]',
                    bgColor: 'bg-black',
                    accentColor: 'bg-[#ccff00]',
                    textColor: 'text-black',
                    hoverBorder: 'hover:border-[#ccff00]/50',
                    icon: <Dumbbell className="w-12 h-12 text-[#ccff00] mb-8 animate-pulse" />
                };
            case 'phisis':
                return {
                    title1: siteContent.beautyHeroTitle1,
                    title2: siteContent.beautyHeroTitle2,
                    description: siteContent.beautyHeroDescription,
                    logo: siteContent.logoPhisis,
                    bgImage: siteContent.beautyHeroBg,
                    title2Color: 'text-emerald-400 italic',
                    bgColor: 'bg-stone-50',
                    accentColor: 'bg-emerald-600',
                    textColor: 'text-white',
                    hoverBorder: 'hover:border-emerald-300',
                    icon: <Sparkles className="w-12 h-12 text-emerald-600 mb-8 animate-pulse" />
                };
            case 'iqual':
                return {
                    title1: siteContent.fragranceHeroTitle1,
                    title2: siteContent.fragranceHeroTitle2,
                    description: siteContent.fragranceHeroDescription,
                    logo: siteContent.logoIqual,
                    bgImage: siteContent.fragranceHeroBg,
                    title2Color: 'text-indigo-400',
                    bgColor: 'bg-slate-900',
                    accentColor: 'bg-indigo-600',
                    textColor: 'text-white',
                    hoverBorder: 'hover:border-indigo-500/50',
                    icon: <Droplet className="w-12 h-12 text-indigo-500 mb-8 animate-pulse" />
                };
            case 'biofarma':
                return {
                    title1: siteContent.bioHeroTitle1,
                    title2: siteContent.bioHeroTitle2,
                    description: siteContent.bioHeroDescription,
                    logo: siteContent.logoBiofarma,
                    bgImage: siteContent.bioHeroBg,
                    title2Color: 'text-blue-500',
                    bgColor: 'bg-white',
                    accentColor: 'bg-blue-600',
                    textColor: 'text-white',
                    hoverBorder: 'hover:border-blue-300',
                    icon: <Leaf className="w-12 h-12 text-blue-600 mb-8 animate-pulse" />
                };
        }
    };

    const content = getHeroContent();

    return (
        <div className={`relative overflow-hidden transition-colors duration-700 ${content.bgColor}`}>
            {/* Background Image Overlay */}
            {content.bgImage && (
                <div className="absolute inset-0 z-0">
                    <img src={content.bgImage} alt="Hero background" className="w-full h-full object-cover opacity-40 filter blur-sm scale-105" />
                    <div className={`absolute inset-0 ${activeBrand === 'informa' || activeBrand === 'iqual' ? 'bg-black/60' : 'bg-white/40'} mix-blend-multiply`}></div>
                </div>
            )}
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 relative z-10">
                <div className="text-center lg:text-left lg:w-1/2 relative z-10 animate-fade-in">
                    {content.logo && <img src={content.logo} alt={activeBrand} className="h-16 mb-8 mx-auto lg:mx-0 animate-slide-up" />}
                    {!content.logo && content.icon}
                    
                    <h1 className={`text-5xl lg:text-7xl font-black mb-6 tracking-tight ${activeBrand === 'informa' || activeBrand === 'iqual' ? 'text-white' : 'text-stone-900'} leading-none`}>
                        <span className="block animate-slide-up" style={{animationDelay: '0.1s'}}>{content.title1}</span>
                        <span className={`block mt-2 animate-slide-up ${content.title2Color}`} style={{animationDelay: '0.2s'}}>{content.title2}</span>
                    </h1>
                    <p className={`text-xl mb-10 leading-relaxed ${activeBrand === 'informa' || activeBrand === 'iqual' ? 'text-gray-300' : 'text-stone-600'} max-w-xl mx-auto lg:mx-0 animate-slide-up`} style={{animationDelay: '0.3s'}}>
                        {content.description}
                    </p>
                </div>

                {/* --- BOTONES SUPERIORES MODIFICADOS --- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 relative z-10 animate-fade-in" style={{animationDelay: '0.6s'}}>
                    
                    {/* Botón 1: In Forma (Ya estaba correcto) */}
                    <a href="#shop" className={`group p-6 ${activeBrand === 'informa' ? 'bg-[#ccff00]/10 border-[#ccff00]' : 'bg-white/5 border-white/10'} backdrop-blur-md rounded-2xl border hover:border-[#ccff00]/50 transition-all duration-300 relative overflow-hidden`}>
                        <div className={`absolute inset-0 bg-gradient-to-br from-[#ccff00]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                        <Dumbbell className={`w-8 h-8 mb-4 ${activeBrand === 'informa' ? 'text-[#ccff00]' : 'text-gray-400 group-hover:text-[#ccff00]'} transition-colors`} />
                        <h3 className={`text-lg font-bold mb-2 ${activeBrand === 'informa' ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>In Forma</h3>
                        <p className="text-sm text-gray-500 font-medium flex items-center gap-2">Explorar <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" /></p>
                    </a>

                    {/* Botón 2: Antes "Nutricosmética", ahora "Fhisis Nutricosmetica" */}
                    <a href="#shop" className={`group p-6 ${activeBrand === 'phisis' ? 'bg-emerald-500/10 border-emerald-400' : 'bg-white/60 border-stone-200'} backdrop-blur-md rounded-2xl border hover:border-emerald-300 transition-all duration-300 relative overflow-hidden`}>
                        <div className={`absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                        <Sparkles className={`w-8 h-8 mb-4 ${activeBrand === 'phisis' ? 'text-emerald-600' : 'text-stone-400 group-hover:text-emerald-600'} transition-colors`} />
                        <h3 className={`text-lg font-bold mb-2 ${activeBrand === 'phisis' ? 'text-stone-900' : 'text-stone-600 group-hover:text-stone-900'}`}>Fhisis Nutricosmetica</h3>
                        <p className="text-sm text-stone-500 font-medium flex items-center gap-2">Explorar <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" /></p>
                    </a>

                    {/* Botón 3: Antes "Fragancias", ahora "Fhisis Fragancias" */}
                    <a href="#shop" className={`group p-6 ${activeBrand === 'iqual' ? 'bg-indigo-500/10 border-indigo-400' : 'bg-white/5 border-white/10'} backdrop-blur-md rounded-2xl border hover:border-indigo-500/50 transition-all duration-300 relative overflow-hidden`}>
                         <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                        <Droplet className={`w-8 h-8 mb-4 ${activeBrand === 'iqual' ? 'text-indigo-400' : 'text-gray-400 group-hover:text-indigo-400'} transition-colors`} />
                        <h3 className={`text-lg font-bold mb-2 ${activeBrand === 'iqual' ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>Fhisis Fragancias</h3>
                        <p className="text-sm text-gray-500 font-medium flex items-center gap-2">Explorar <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" /></p>
                    </a>

                    {/* Botón 4: Antes "Salud Integral", ahora "BioFarma Natural" */}
                    <a href="#shop" className={`group p-6 ${activeBrand === 'biofarma' ? 'bg-blue-500/10 border-blue-400' : 'bg-white/60 border-stone-200'} backdrop-blur-md rounded-2xl border hover:border-blue-300 transition-all duration-300 relative overflow-hidden`}>
                         <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                        <Leaf className={`w-8 h-8 mb-4 ${activeBrand === 'biofarma' ? 'text-blue-600' : 'text-stone-400 group-hover:text-blue-600'} transition-colors`} />
                        <h3 className={`text-lg font-bold mb-2 ${activeBrand === 'biofarma' ? 'text-stone-900' : 'text-stone-600 group-hover:text-stone-900'}`}>BioFarma Natural</h3>
                        <p className="text-sm text-stone-500 font-medium flex items-center gap-2">Explorar <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" /></p>
                    </a>
                </div>
            </div>

            {/* Banners Slider */}
            {brandBanners.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-20 animate-slide-up" style={{animationDelay: '0.8s'}}>
                    <div className="relative rounded-[2rem] overflow-hidden shadow-2xl group">
                        <div className="relative h-[300px] md:h-[400px]">
                            <img src={currentBanner.image} alt={currentBanner.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                            <div className={`absolute inset-0 bg-gradient-to-r ${activeBrand === 'informa' ? 'from-black/80 via-black/40 to-transparent' : activeBrand === 'iqual' ? 'from-slate-900/80 via-slate-900/40 to-transparent' : activeBrand === 'biofarma' ? 'from-blue-900/60 via-blue-900/20 to-transparent' : 'from-emerald-900/60 via-emerald-900/20 to-transparent'}`}></div>
                            <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16">
                                <div className="max-w-xl animate-fade-in">
                                    <span className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 ${content.accentColor} ${content.textColor} shadow-lg`}>
                                        Oferta Especial
                                    </span>
                                    <h2 className={`text-4xl md:text-5xl font-black mb-4 leading-none ${activeBrand === 'informa' || activeBrand === 'iqual' ? 'text-white' : 'text-white'}`}>
                                        {currentBanner.title}
                                    </h2>
                                    <p className={`text-lg mb-8 ${activeBrand === 'informa' || activeBrand === 'iqual' ? 'text-gray-200' : 'text-white/90'}`}>
                                        {currentBanner.description}
                                    </p>
                                    <button 
                                        onClick={() => handleAddBundle(currentBanner)}
                                        className={`px-8 py-4 rounded-xl font-bold flex items-center gap-3 group ${content.accentColor} ${content.textColor} shadow-lg hover:scale-105 transition-transform`}
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        <span className="flex flex-col text-left leading-none">
                                            <span className="text-xs opacity-80">Comprar Pack</span>
                                            <span className="text-lg">Aprovechar Oferta</span>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {brandBanners.length > 1 && (
                            <>
                                <button onClick={prevBanner} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button onClick={nextBanner} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {brandBanners.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentBannerIndex(idx)}
                                            className={`w-3 h-3 rounded-full transition-all ${
                                                currentBannerIndex === idx 
                                                ? content.accentColor + ' w-8' 
                                                : 'bg-white/40 hover:bg-white/60'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Hero;
