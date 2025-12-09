import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { LogOut, Shield, CheckCircle, XCircle, Loader2, Store as StoreIcon } from 'lucide-react';

interface AdminStore {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    logoUrl?: string;
    users: { username: string, role: string }[];
}

interface AdminDashboardProps {
    onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const [stores, setStores] = useState<AdminStore[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStores();
    }, []);

    const loadStores = async () => {
        try {
            const data = await api.getAdminStores();
            if (Array.isArray(data)) {
                setStores(data);
            }
        } catch (error) {
            console.error('Failed to load stores', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (store: AdminStore) => {
        const newStatus = !store.isActive;
        // Optimistic update
        setStores(prev => prev.map(s => s.id === store.id ? { ...s, isActive: newStatus } : s));

        try {
            await api.toggleStoreStatus(store.id, newStatus);
        } catch (error) {
            console.error('Failed to toggle status', error);
            // Revert
            setStores(prev => prev.map(s => s.id === store.id ? { ...s, isActive: !newStatus } : s));
            alert('Falha ao atualizar status.');
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-indigo-900 text-white p-4 shadow-lg">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Shield className="text-yellow-400" size={28} />
                        <div>
                            <h1 className="text-xl font-bold">Delivery Master</h1>
                            <span className="text-xs text-indigo-300 font-mono uppercase tracking-wider">Super Admin</span>
                        </div>
                    </div>
                    <button onClick={onLogout} className="flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-lg transition">
                        <LogOut size={18} /> Sair
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-6xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Lojas</h2>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm text-gray-500">
                        Total: <strong>{stores.length}</strong>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Loja</th>
                                <th className="p-4 font-semibold text-gray-600">Responsável</th>
                                <th className="p-4 font-semibold text-gray-600">Data Cadastro</th>
                                <th className="p-4 font-semibold text-gray-600 text-center">Status</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stores.map(store => (
                                <tr key={store.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {store.logoUrl ? (
                                                <img src={store.logoUrl} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                                    <StoreIcon size={20} />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-gray-800">{store.name}</p>
                                                <p className="text-xs text-gray-400 font-mono">{store.id.substring(0, 8)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {store.users?.[0]?.username || '-'}
                                        <span className="block text-xs text-gray-400">@{store.users?.[0]?.role}</span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {new Date(store.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-center">
                                        {store.isActive ? (
                                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                                <CheckCircle size={12} /> Ativo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                                <Loader2 size={12} className={store.isActive ? "" : "animate-spin-slow"} /> Pendente
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleToggleStatus(store)}
                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition ${store.isActive
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200'
                                                }`}
                                        >
                                            {store.isActive ? 'Bloquear' : 'Aprovar Loja'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {stores.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        Nenhuma loja cadastrada ainda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};
