/**
 * Stores List Example Component
 * Demonstrates how to use the useStores hook for CRUD operations
 */

import { useEffect, useState } from 'react';
import { useStores } from '@/hooks/useStores';
import { useAuth } from '@/hooks/useAuth';
import { formatCNPJ } from '@/utils/formatters';

export function StoresListExample() {
  const { partner } = useAuth();
  const { stores, isLoading, error, loadStores, deleteStore, toggleService } = useStores();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (partner) {
      loadStores(partner);
    }
  }, [partner]);

  const handleDelete = async (cnpj: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta loja?')) {
      try {
        await deleteStore(cnpj);
        // Success handled by hook
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleToggleService = async (
    cnpj: string,
    service: 'offerta' | 'oppinar' | 'prazzo',
    currentValue: boolean
  ) => {
    try {
      await toggleService(cnpj, service, !currentValue);
    } catch (error) {
      console.error('Toggle service failed:', error);
    }
  };

  const filteredStores = stores.filter(store =>
    store.cnpj.includes(searchQuery) ||
    (store.company && store.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
    store.tradeName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin">
          <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lojas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Total: {filteredStores.length} loja{filteredStores.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
          + Nova Loja
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Pesquisar por CNPJ, razao social ou nome fantasia..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Stores Table */}
      {filteredStores.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma loja encontrada</h3>
          <p className="mt-1 text-sm text-gray-500">Comece criando uma nova loja</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CNPJ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Razao Social
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servicos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStores.map((store) => (
                <tr key={store.cnpj} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCNPJ(store.cnpj)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{store.company}</div>
                    <div className="text-xs text-gray-400">{store.tradeName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleService(store.cnpj, 'offerta', store.offerta)}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          store.offerta
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        Offerta
                      </button>
                      <button
                        onClick={() => handleToggleService(store.cnpj, 'oppinar', store.oppinar)}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          store.oppinar
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        Oppinar
                      </button>
                      <button
                        onClick={() => handleToggleService(store.cnpj, 'prazzo', store.prazzo)}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          store.prazzo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        Prazzo
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      store.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {store.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a href={`/stores/${store.cnpj}`} className="text-cyan-600 hover:text-teal-700 mr-4">
                      Editar
                    </a>
                    <button
                      onClick={() => handleDelete(store.cnpj)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
