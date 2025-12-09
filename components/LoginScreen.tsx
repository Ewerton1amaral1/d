
import React, { useState, useEffect } from 'react';
import { Bike, Lock, User, ShoppingBag, ArrowRight, Store, ChefHat, UtensilsCrossed, Salad, Pizza } from 'lucide-react';
import { StoreAccount, UserSession } from '../types';

interface LoginScreenProps {
   onLogin: (session: UserSession) => void;
   onEnterClientMode: () => void;
}

// Imagens representando diferentes segmentos: Lanches, Pizza, Saudável, Japonês
const BACKGROUND_IMAGES = [
   "https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=2070&auto=format&fit=crop", // Burger
   "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop", // Pizza
   "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1780&auto=format&fit=crop", // Healthy/Salad
   "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070&auto=format&fit=crop"  // Sushi
];

import { api } from '../services/api';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onEnterClientMode }) => {
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');
   const [showLogin, setShowLogin] = useState(false); // For mobile toggle

   // Registration State
   const [isRegistering, setIsRegistering] = useState(false);
   const [storeName, setStoreName] = useState('');
   const [phone, setPhone] = useState('');
   const [loading, setLoading] = useState(false);

   // State for Background Carousel
   const [currentImageIndex, setCurrentImageIndex] = useState(0);

   // Carousel Effect
   useEffect(() => {
      const interval = setInterval(() => {
         setCurrentImageIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_IMAGES.length);
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
   }, []);

   const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
         if (isRegistering) {
            // Register Flow
            if (!storeName || !phone) {
               setError('Preencha os dados da loja.');
               setLoading(false);
               return;
            }
            const res = await api.register({ username, password, storeName, phone });
            // Auto login after register
            const loginRes = await api.login({ username, password });
            onLogin({
               role: 'store',
               storeId: loginRes.user.storeId, // Backend must return user with storeId
               storeName: storeName,
               username: username,
               token: loginRes.token
            });
         } else {
            // Login Flow
            const res = await api.login({ username, password });
            onLogin({
               role: res.user.role,
               storeId: res.user.storeId,
               storeName: res.user.username, // Backend might not send storeName on login, using username as fallback for now
               username: res.user.username,
               token: res.token
            });
         }
      } catch (err: any) {
         console.error(err);
         setError(err.message || 'Falha na autenticação');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen relative flex items-center justify-center font-sans overflow-hidden bg-black">

         {/* Background Carousel */}
         {BACKGROUND_IMAGES.map((img, index) => (
            <div
               key={index}
               className={`absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
               style={{ backgroundImage: `url("${img}")` }}
            ></div>
         ))}

         {/* Dark Overlay */}
         <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40"></div>

         {/* --- MAIN CONTENT (CENTER): CUSTOMER FOCUS --- */}
         <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/30 transform rotate-3 hover:rotate-6 transition">
               <Bike size={40} className="text-white" />
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg">
               Delivery<span className="text-indigo-400">Master</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl font-light leading-relaxed">
               A plataforma completa para todos os gostos.
               <span className="block text-indigo-300 font-medium mt-1">
                  {currentImageIndex === 0 && "O melhor Burger da cidade."}
                  {currentImageIndex === 1 && "Pizzas crocantes e saborosas."}
                  {currentImageIndex === 2 && "Opções saudáveis e frescas."}
                  {currentImageIndex === 3 && "Culinária oriental premium."}
               </span>
            </p>

            <button
               onClick={onEnterClientMode}
               className="group relative bg-white text-indigo-900 px-10 py-5 rounded-full font-bold text-xl shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 flex items-center gap-3 overflow-hidden"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
               <span className="relative z-10 flex items-center gap-3">
                  <ShoppingBag size={24} className="group-hover:-translate-y-1 transition-transform" />
                  Fazer um Pedido
                  <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
               </span>
            </button>

            {/* Feature Pills */}
            <div className="mt-12 flex flex-wrap justify-center gap-4 opacity-80">
               <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
                  <ChefHat size={16} /> Restaurantes Selecionados
               </div>
               <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
                  <Bike size={16} /> Entrega Rápida
               </div>
               <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
                  <UtensilsCrossed size={16} /> Diversas Opções
               </div>
            </div>
         </div>

         {/* --- MERCHANT LOGIN (CORNER CARD) --- */}
         <div className={`absolute top-4 right-4 md:top-8 md:right-8 z-20 transition-all duration-300 ${showLogin ? 'w-full md:w-80' : 'w-auto'}`}>

            {/* Toggle Button (Mobile/Collapsed State) */}
            {!showLogin && (
               <button
                  onClick={() => setShowLogin(true)}
                  className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium border border-white/20 flex items-center gap-2 transition hover:scale-105"
               >
                  <Store size={16} /> Área do Lojista
               </button>
            )}

            {/* Login Form Card */}
            {showLogin && (
               <div className="bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/50 animate-in slide-in-from-top-4">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Lock size={16} className="text-indigo-600" /> {isRegistering ? 'Nova Conta' : 'Acesso Administrativo'}
                     </h3>
                     <button onClick={() => setShowLogin(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-4">
                     {error && (
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 font-medium text-center">
                           {error}
                        </div>
                     )}

                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Usuário / Login</label>
                        <div className="relative">
                           <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                           <input
                              type="text"
                              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              placeholder="ex: admin"
                              value={username}
                              onChange={e => setUsername(e.target.value)}
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Senha</label>
                        <div className="relative">
                           <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                           <input
                              type="password"
                              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              placeholder="••••••"
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                           />
                        </div>
                     </div>

                     {isRegistering && (
                        <>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome da Loja</label>
                              <div className="relative">
                                 <Store className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                 <input
                                    type="text"
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Minha Hamburgueria"
                                    value={storeName}
                                    onChange={e => setStoreName(e.target.value)}
                                 />
                              </div>
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">WhatsApp da Loja</label>
                              <div className="relative">
                                 <Bike className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                 <input
                                    type="text"
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="11999990000"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                 />
                              </div>
                           </div>
                        </>
                     )}

                     <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 transition shadow-lg disabled:opacity-50"
                     >
                        {loading ? 'Processando...' : (isRegistering ? 'Criar Conta' : 'Entrar')}
                     </button>

                     <button
                        type="button"
                        onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                        className="w-full text-indigo-600 text-xs font-bold hover:underline"
                     >
                        {isRegistering ? 'Já tenho conta' : 'Criar nova conta de loja'}
                     </button>
                  </form>

                  <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                     <p className="text-[10px] text-gray-400">© 2024 DeliveryMaster SaaS</p>
                  </div>
               </div>
            )}
         </div>

         {/* Footer Info */}
         <div className="absolute bottom-4 left-0 right-0 text-center text-white/40 text-xs z-10 pointer-events-none">
            Plataforma de Gestão e Delivery
         </div>

      </div>
   );
};
