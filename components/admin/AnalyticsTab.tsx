import React, { useState, useMemo } from 'react';
import { Product, Reseller, Sale } from '../../types';
import { 
    DollarSign, Users, Package, Trophy, Medal, Calendar, Crown, TrendingUp, BarChart3, AlertCircle, RefreshCw
} from 'lucide-react';

interface AnalyticsTabProps {
    products: Product[];
    resellers: Reseller[];
    adminSales: Sale[];
    setResellers: (resellers: Reseller[]) => void;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ products, resellers, adminSales, setResellers }) => {
    const [rankingPeriod, setRankingPeriod] = useState<'month' | 'year' | 'all'>('month');

    // 1. LÓGICA DE RANKING DINÁMICO (Basada en Ventas)
    const calculateRanking = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const ranked = resellers.map(reseller => {
            let periodPoints = 0;
            let periodSalesCount = 0;

            if (rankingPeriod === 'all') {
                // En histórico mostramos el TOTAL de ventas de por vida
                periodSalesCount = reseller.sales.length;
                periodPoints = reseller.sales.reduce((acc, s) => acc + Math.floor(s.total / 1000), 0);
            } else {
                // Mensual o Anual: Calculamos sumando las ventas de ese periodo
                reseller.sales.forEach(sale => {
                    const [day, month, year] = sale.date.split('/').map(Number);
                    const saleDate = new Date(year, month - 1, day);

                    const isSameYear = saleDate.getFullYear() === currentYear;
                    const isSameMonth = saleDate.getMonth() === currentMonth;

                    let shouldCount = false;
                    if (rankingPeriod === 'year' && isSameYear) shouldCount = true;
                    if (rankingPeriod === 'month' && isSameYear && isSameMonth) shouldCount = true;

                    if (shouldCount) {
                        periodPoints += Math.floor(sale.total / 1000);
                        periodSalesCount += 1;
                    }
                });
            }

            return {
                ...reseller,
                periodPoints,
                periodSalesCount
            };
        });

        return ranked.sort((a, b) => b.periodPoints - a.periodPoints);
    }, [resellers, rankingPeriod]);

    const top1 = calculateRanking[0];
    const top2 = calculateRanking[1];
    const top3 = calculateRanking[2];
    const restOfRanking = calculateRanking.slice(3);

    // 2. PRODUCTOS MÁS VENDIDOS
    const bestSellers = useMemo(() => {
        const productCounts: Record<string, { name: string, count: number, brand: string }> = {};

        // Sumar ventas de revendedores
        resellers.forEach(r => r.sales.forEach(s => s.items.forEach(i => {
            if (!productCounts[i.id]) productCounts[i.id] = { name: i.name, count: 0, brand: i.brand };
            productCounts[i.id].count += i.quantity;
        })));
        
        // Sumar ventas directas del admin
        adminSales.forEach(s => s.items.forEach(i => {
             if (!productCounts[i.id]) productCounts[i.id] = { name: i.name, count: 0, brand: i.brand };
             productCounts[i.id].count += i.quantity;
        }));

        return Object.values(productCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Top 5
    }, [resellers, adminSales]);

    // 3. RESETEO DE PUNTOS
    const handleResetPoints = () => {
        if (!window.confirm('¿Estás seguro de cerrar el mes? Esto pondrá en 0 los puntos acumulados de TODOS los revendedores para canjes, pero mantendrá el historial de ventas para el ranking anual.')) return;

        const updatedResellers = resellers.map(r => ({
            ...r,
            points: 0 // Reseteamos solo la "billetera" de puntos
        }));
        setResellers(updatedResellers);
        alert("Ciclo cerrado exitosamente. Puntos reiniciados.");
    };

    return (
        <div className="animate-fade-in space-y-10 pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-white italic">ESTADÍSTICAS Y <span className="text-[#ccff00]">RANKING</span></h1>
                
                {/* BOTÓN DE RESET MENSUAL */}
                <button 
                    onClick={handleResetPoints}
                    className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-500/20 transition-colors text-sm font-bold"
                >
                    <RefreshCw className="w-4 h-4" /> Cerrar Mes (Reset Puntos)
                </button>
            </div>
            
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900/40 p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                    <div className="flex gap-4 items-center relative z-10">
                        <div className="p-3 bg-green-500/20 text-green-500 rounded-lg"><DollarSign className="w-6 h-6" /></div>
                        <div>
                            <p className="text-zinc-500 text-sm">Valor Inventario</p>
                            <h3 className="text-2xl font-bold text-white">${products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-zinc-900/40 p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                    <div className="flex gap-4 items-center relative z-10">
                        <div className="p-3 bg-blue-500/20 text-blue-500 rounded-lg"><Users className="w-6 h-6" /></div>
                        <div>
                            <p className="text-zinc-500 text-sm">Revendedores Activos</p>
                            <h3 className="text-2xl font-bold text-white">{resellers.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-zinc-900/40 p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                    <div className="flex gap-4 items-center relative z-10">
                        <div className="p-3 bg-purple-500/20 text-purple-500 rounded-lg"><Package className="w-6 h-6" /></div>
                        <div>
                            <p className="text-zinc-500 text-sm">Productos Activos</p>
                            <h3 className="text-2xl font-bold text-white">{products.filter(p => p.active).length}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- SECCIÓN DE RANKING (2/3 ancho) --- */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Trophy className="text-[#ccff00]" /> Ranking de Partners
                            </h2>
                            <p className="text-zinc-400 text-sm">Calculado según ventas del periodo.</p>
                        </div>
                        
                        <div className="bg-black/40 p-1 rounded-xl border border-white/10 flex">
                            <button onClick={() => setRankingPeriod('month')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${rankingPeriod === 'month' ? 'bg-[#ccff00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}>Este Mes</button>
                            <button onClick={() => setRankingPeriod('year')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${rankingPeriod === 'year' ? 'bg-[#ccff00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}>Este Año</button>
                            <button onClick={() => setRankingPeriod('all')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${rankingPeriod === 'all' ? 'bg-[#ccff00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}>Histórico</button>
                        </div>
                    </div>

                    {/* PODIO */}
                    <div className="grid grid-cols-3 gap-4 items-end min-h-[200px]">
                        {/* Puesto 2 */}
                        <div className="bg-zinc-900/60 border border-zinc-700 p-4 rounded-xl flex flex-col items-center text-center order-1 h-3/4 justify-end">
                            <div className="w-10 h-10 rounded-full bg-gray-400 text-black font-black flex items-center justify-center mb-2">2</div>
                            <h3 className="text-white font-bold text-sm truncate w-full">{top2?.name || '-'}</h3>
                            <span className="text-gray-400 font-mono font-bold text-xs">{top2?.periodPoints || 0} pts</span>
                        </div>
                        {/* Puesto 1 */}
                        <div className="bg-gradient-to-b from-yellow-900/40 to-black border border-yellow-500/50 p-4 rounded-xl flex flex-col items-center text-center order-2 h-full justify-end relative shadow-lg shadow-yellow-500/10">
                            <Crown className="w-8 h-8 text-yellow-400 absolute -top-4 animate-bounce" />
                            <div className="w-14 h-14 rounded-full bg-yellow-400 text-black font-black flex items-center justify-center mb-2 text-xl">1</div>
                            <h3 className="text-white font-bold text-lg truncate w-full">{top1?.name || '-'}</h3>
                            <span className="text-yellow-400 font-mono font-black text-xl">{top1?.periodPoints || 0} pts</span>
                        </div>
                        {/* Puesto 3 */}
                        <div className="bg-zinc-900/60 border border-orange-900/50 p-4 rounded-xl flex flex-col items-center text-center order-3 h-2/3 justify-end">
                            <div className="w-10 h-10 rounded-full bg-orange-600 text-black font-black flex items-center justify-center mb-2">3</div>
                            <h3 className="text-white font-bold text-sm truncate w-full">{top3?.name || '-'}</h3>
                            <span className="text-orange-400 font-mono font-bold text-xs">{top3?.periodPoints || 0} pts</span>
                        </div>
                    </div>

                    {/* TABLA RESTANTE */}
                    <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-black/40 text-zinc-400 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-3">#</th>
                                    <th className="px-6 py-3">Revendedor</th>
                                    <th className="px-6 py-3 text-right">Puntos (Periodo)</th>
                                    <th className="px-6 py-3 text-right text-[#ccff00]">Billetera Actual</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {restOfRanking.map((reseller, idx) => (
                                    <tr key={reseller.id} className="hover:bg-white/5">
                                        <td className="px-6 py-3 text-zinc-500 font-mono">{idx + 4}</td>
                                        <td className="px-6 py-3 font-bold text-white">{reseller.name}</td>
                                        <td className="px-6 py-3 text-right font-bold">{reseller.periodPoints} pts</td>
                                        <td className="px-6 py-3 text-right text-[#ccff00] font-mono">{reseller.points} pts</td>
                                    </tr>
                                ))}
                                {calculateRanking.slice(0, 3).map((reseller, idx) => (
                                     <tr key={reseller.id} className="hover:bg-white/5 bg-white/5">
                                        <td className="px-6 py-3 text-yellow-500 font-bold">{idx + 1}</td>
                                        <td className="px-6 py-3 font-bold text-white">{reseller.name}</td>
                                        <td className="px-6 py-3 text-right font-bold">{reseller.periodPoints} pts</td>
                                        <td className="px-6 py-3 text-right text-[#ccff00] font-mono">{reseller.points} pts</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- SECCIÓN PRODUCTOS TOP (1/3 ancho) --- */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <BarChart3 className="text-blue-500" /> Productos Top
                    </h2>
                    <div className="space-y-4">
                        {bestSellers.map((item, idx) => (
                            <div key={idx} className="bg-zinc-900/60 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                        idx === 0 ? 'bg-yellow-400 text-black' : 'bg-zinc-800 text-zinc-400'
                                    }`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm line-clamp-1">{item.name}</p>
                                        <span className="text-[10px] text-zinc-500 uppercase">{item.brand}</span>
                                    </div>
                                </div>
                                <span className="text-blue-400 font-mono font-bold">{item.count} un.</span>
                            </div>
                        ))}
                        {bestSellers.length === 0 && (
                            <p className="text-zinc-500 text-center py-10">Sin datos de ventas.</p>
                        )}
                    </div>
                    
                    <div className="mt-8 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl text-xs text-yellow-200/70">
                        <AlertCircle className="w-4 h-4 mb-2" />
                        <p>Los rankings se calculan automáticamente con cada venta confirmada. El botón "Cerrar Mes" reinicia la billetera de puntos canjeables de los revendedores a 0.</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AnalyticsTab;
