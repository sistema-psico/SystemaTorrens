import React, { useState } from 'react';
import { Reseller } from '../types';
import { ShieldCheck, LogIn, ChevronLeft } from 'lucide-react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'; // Importamos signOut
import { auth } from '../lib/firebase'; 

// --- LISTA DE ADMINISTRADORES AUTORIZADOS ---
const ADMIN_EMAILS = [
    'edur900@gmail.com', 
    'gabrieletorrens@gmail.com'     
];

interface LoginProps {
    resellers: Reseller[];
    onLoginSuccess: (type: 'admin' | 'reseller' | 'client', data?: any) => void;
    onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ resellers, onLoginSuccess, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();

        try {
            // 1. INTENTAR LOGIN COMO ADMINISTRADOR (FIREBASE AUTH)
            if (ADMIN_EMAILS.includes(cleanEmail)) {
                // SOLUCIÓN AL PROBLEMA DE LOGIN:
                // Si existe una sesión previa (ej: cliente con Google), la cerramos antes
                // de intentar loguear como admin.
                if (auth.currentUser) {
                    await signOut(auth);
                }

                await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
                onLoginSuccess('admin');
                return;
            }

            // 2. INTENTAR LOGIN COMO REVENDEDOR (BASE DE DATOS)
            const foundReseller = resellers.find(r => 
                r.email.trim().toLowerCase() === cleanEmail && 
                r.password.trim() === cleanPassword && 
                r.active
            );

            if (foundReseller) {
                onLoginSuccess('reseller', foundReseller);
                return;
            }

            // 3. CLIENTE (Simulación para compra rápida)
            if (cleanEmail.includes('@') && cleanPassword.length >= 4) {
                onLoginSuccess('client', { 
                    id: `C-${Date.now()}`,
                    name: cleanEmail.split('@')[0],
                    email: cleanEmail,
                    avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=200&auto=format&fit=crop'
                });
                return;
            }

            throw new Error('Credenciales no válidas');

        } catch (err: any) {
            console.error("Login Error:", err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Correo o contraseña de administrador incorrectos.');
            } else if (err.message === 'Credenciales no válidas') {
                setError('Usuario no encontrado o contraseña incorrecta.');
            } else {
                setError('Ocurrió un error al intentar ingresar.');
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative bg-[#0a0a0a] flex items-center justify-center p-4 overflow-hidden font-sans">
            
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#ccff00]/10 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-900/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <button 
                    onClick={onClose}
                    className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Volver a la tienda
                </button>

                <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl animate-scale-in">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                            <ShieldCheck className="w-8 h-8 text-[#ccff00]" />
                        </div>
                        <h2 className="text-2xl font-black text-white italic">INICIAR <span className="text-[#ccff00]">SESIÓN</span></h2>
                        <p className="text-zinc-500 text-sm mt-2">Acceso Seguro</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Email</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white focus:border-[#ccff00] outline-none transition-colors" 
                                placeholder="usuario@email.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Contraseña</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white focus:border-[#ccff00] outline-none transition-colors" 
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-900/20 border border-red-900/30 rounded-lg text-red-400 text-xs text-center">
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-[#ccff00] text-black font-bold py-3 rounded-xl hover:bg-[#b3e600] flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Verificando...' : (
                                <>INGRESAR <LogIn className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-xs text-zinc-600">
                            ¿Problemas para ingresar? Contacta a soporte técnico.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
