import React, { useState, useMemo } from 'react';
import { Product, Reseller, Sale } from '../../types';
import { 
    DollarSign, Users, Package, Trophy, Medal, Calendar, Crown, TrendingUp 
} from 'lucide-react';

interface AnalyticsTabProps {
    products: Product[];
    resellers: Reseller[];
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ products, resellers }) => {
    const [rankingPeriod, setRankingPeriod] = useState<'month' | 'year' | 'all'>('month');

    // --- LÓGICA DE CÁLCULO DE PUNTOS ---
    const calculateRanking = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Mapeamos los revendedores y calculamos sus puntos según el periodo
        const ranked = resellers.map(reseller => {
            let periodPoints = 0;
            let periodSalesCount = 0;

            if (rankingPeriod === 'all') {
                // Histórico: Usamos el acumulado total guardado
                periodPoints = reseller.points || 0;
                periodSalesCount = reseller.sales.length;
            } else {
                // Mensual o Anual: Calculamos sumando las ventas de ese periodo
                reseller.sales.forEach(sale => {
                    // Convertir fecha string "DD/MM/YYYY" a objeto Date
                    const [day, month, year] = sale.date.split('/').map(Number);
                    const saleDate = new Date(year, month - 1, day);

                    const isSameYear = saleDate.getFullYear() === currentYear;
                    const isSameMonth = saleDate.getMonth() === currentMonth;

                    let shouldCount = false;
                    if (rankingPeriod === 'year' && isSameYear) shouldCount = true;
                    if (rankingPeriod === 'month' && isSameYear && isSameMonth) shouldCount = true;

                    if (shouldCount) {
                        // 1 Punto cada $1000
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

        // Ordenar de mayor a menor puntaje
        return ranked.sort((a, b) => b.periodPoints - a.periodPoints);
    }, [resellers, rankingPeriod]);

    // Top 3
    const top1 = calculateRanking[0];
    const top2 = calculateRanking[1];
    const top3 = calculateRanking[2];
    const restOfRanking = calculateRanking.slice(3);

    return (
        <div className="animate-fade-in space-y-10 pb-20">
            <h1 className="text-3xl font-black text-white italic">ESTADÍSTICAS Y <span className="text-[#ccff00]">RANKING</span></h1>
            
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900/40 p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <DollarSign className="w-16 h-16 text-green-500" />
                    </div>
                    <div className="flex gap-4 items-center relative z-10">
                        <div className="p-3 bg-green-500/20 text-green-500 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
                        <div>
                            <p className="text-zinc-500 text-sm">Valor Inventario</p>
                            <h3 className="text-2xl font-bold text-white">${products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-zinc-900/40 p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Users className="w-16 h-16 text-blue-500" />
                    </div>
                    <div className="flex gap-4 items-center relative z-10">
                        <div className="p-3 bg-blue-500/20 text-blue-500 rounded-lg"><Users className="w-6 h-6" /></div>
                        <div>
                            <p className="text-zinc-500 text-sm">Revendedores Activos</p>
                            <h3 className="text-2xl font-bold text-white">{resellers.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-zinc-900/40 p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Package className="w-16 h-16 text-purple-500" />
                    </div>
                    <div className="flex gap-4 items-center relative z-10">
                        <div className="p-3 bg-purple-500/20 text-purple-500 rounded-lg"><Package className="w-6 h-6" /></div>
                        <div>
                            <p className="text-zinc-500 text-sm">Productos Activos</p>
                            <h3 className="text-2xl font-bold text-white">{products.filter(p => p.active).length}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN DE RANKING --- */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Trophy className="text-[#ccff00]" /> Ranking de Partners
                        </h2>
                        <p className="text-zinc-400 text-sm">Premia a tus mejores vendedores. 1 Punto = $1.000 vendidos.</p>
                    </div>
                    
                    {/* Selector de Periodo */}
                    <div className="bg-black/40 p-1 rounded-xl border border-white/10 flex">
                        <button 
                            onClick={() => setRankingPeriod('month')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${rankingPeriod === 'month' ? 'bg-[#ccff00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Este Mes
                        </button>
                        <button 
                            onClick={() => setRankingPeriod('year')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${rankingPeriod === 'year' ? 'bg-[#ccff00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Este Año
                        </button>
                        <button 
                            onClick={() => setRankingPeriod('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${rankingPeriod === 'all' ? 'bg-[#ccff00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Histórico
                        </button>
                    </div>
                </div>

                {/* PODIO (TOP 3) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    
                    {/* Puesto 2 */}
                    {top2 && (
                        <div className="bg-zinc-900/60 border border-zinc-700 p-6 rounded-2xl flex flex-col items-center text-center transform hover:scale-105 transition-transform order-2 md:order-1">
                            <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(200,200,200,0.2)]">
                                <span className="text-2xl font-black text-gray-800">2</span>
                            </div>
                            <h3 className="text-white font-bold text-lg">{top2.name}</h3>
                            <p className="text-zinc-500 text-xs mb-2">{top2.region}</p>
                            <div className="bg-black/40 px-4 py-2 rounded-lg border border-white/5">
                                <span className="text-gray-300 font-mono font-bold text-xl">{top2.periodPoints} pts</span>
                            </div>
                        </div>
                    )}

                    {/* Puesto 1 (Central y más grande) */}
                    {top1 && (
                        <div className="bg-gradient-to-b from-yellow-900/20 to-black border border-yellow-500/50 p-8 rounded-2xl flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform shadow-[0_0_30px_rgba(234,179,8,0.1)] order-1 md:order-2 h-full justify-end relative">
                            <div className="absolute -top-6">
                                <Crown className="w-12 h-12 text-yellow-400 fill-yellow-400 animate-bounce" />
                            </div>
                            <div className="w-24 h-24 rounded-full bg-yellow-400 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                                <span className="text-4xl font-black text-yellow-900">1</span>
                            </div>
                            <h3 className="text-white font-bold text-2xl mb-1">{top1.name}</h3>
                            <p className="text-yellow-500/80 text-sm mb-4 font-bold uppercase tracking-widest">Líder {rankingPeriod === 'month' ? 'del Mes' : 'del Año'}</p>
                            <div className="bg-yellow-500/10 px-6 py-3 rounded-xl border border-yellow-500/30 w-full">
                                <span className="text-yellow-400 font-mono font-black text-3xl">{top1.periodPoints} pts</span>
                                <p className="text-[10px] text-yellow-200/50 mt-1">{top1.periodSalesCount} ventas realizadas</p>
                            </div>
                        </div>
                    )}

                    {/* Puesto 3 */}
                    {top3 && (
                        <div className="bg-zinc-900/60 border border-orange-900 p-6 rounded-2xl flex flex-col items-center text-center transform hover:scale-105 transition-transform order-3">
                            <div className="w-16 h-16 rounded-full bg-orange-700 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(194,65,12,0.2)]">
                                <span className="text-2xl font-black text-orange-200">3</span>
                            </div>
                            <h3 className="text-white font-bold text-lg">{top3.name}</h3>
                            <p className="text-zinc-500 text-xs mb-2">{top3.region}</p>
                            <div className="bg-black/40 px-4 py-2 rounded-lg border border-white/5">
                                <span className="text-orange-400 font-mono font-bold text-xl">{top3.periodPoints} pts</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* RESTO DE LA TABLA */}
                {restOfRanking.length > 0 && (
                    <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-xl mt-8">
                        <table className="w-full text-left">
                            <thead className="bg-black/40 text-zinc-400 text-sm">
                                <tr>
                                    <th className="px-6 py-4">Puesto</th>
                                    <th className="px-6 py-4">Revendedor</th>
                                    <th className="px-6 py-4">Región</th>
                                    <th className="px-6 py-4">Ventas (Cant.)</th>
                                    <th className="px-6 py-4 text-right">Puntos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {restOfRanking.map((reseller, idx) => (
                                    <tr key={reseller.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-zinc-500">#{idx + 4}</td>
                                        <td className="px-6 py-4 font-bold text-white">{reseller.name}</td>
                                        <td className="px-6 py-4 text-zinc-400 text-sm">{reseller.region}</td>
                                        <td className="px-6 py-4 text-zinc-400">{reseller.periodSalesCount}</td>
                                        <td className="px-6 py-4 text-right font-bold text-[#ccff00]">{reseller.periodPoints}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {calculateRanking.length === 0 && (
                    <div className="text-center py-20 text-zinc-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No hay datos de ventas para el periodo seleccionado.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsTab;
