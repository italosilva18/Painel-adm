import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Store,
  UserPlus,
  Download,
  Copy
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageHeader } from '@/components/common';
import * as mobileService from '@/api/services/mobileService';
import { UserStore, getMobileUserWithStoresByPhone } from '@/api/services/mobileService';
import { MobileUser } from '@/api/types';
import * as refDataService from '@/api/services/referenceData';
import { Partner } from '@/api/services/referenceData';
import { applyPhoneMask } from '@/utils/formatters';
import { exportToCSV, mobileUserExportColumns } from '@/utils/exportUtils';

const USER_TYPES = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Suporte', label: 'Suporte' },
  { value: 'Operador', label: 'Operador' },
  { value: 'Gerente', label: 'Gerente' }
];

const MobilePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingRefData, setLoadingRefData] = useState(true);
  const [currentUser, setCurrentUser] = useState<MobileUser | null>(null);
  const [userStores, setUserStores] = useState<UserStore[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<MobileUser | null>(null);
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phone: '',
    _type: 'Operador',
    partner: '',
    active: true
  });
  const [showEmailNotFoundModal, setShowEmailNotFoundModal] = useState(false);
  const [searchedEmail, setSearchedEmail] = useState('');
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [storeCnpjSearch, setStoreCnpjSearch] = useState('');
  const [addingStore, setAddingStore] = useState(false);
  const [storesPage, setStoresPage] = useState(1);
  const storesPerPage = 5;

  useEffect(() => {
    loadReferenceData();
  }, []);

  const loadReferenceData = async () => {
    try {
      setLoadingRefData(true);
      const partnersData = await refDataService.getPartners();
      setPartners(partnersData);
    } catch (error) {
      toast.error('Erro ao carregar parceiros');
    } finally {
      setLoadingRefData(false);
    }
  };

  const isEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const isPhone = (value: string): boolean => {
    const cleanPhone = value.replace(/\D/g, '');
    return cleanPhone.length === 11;
  };

  const getPartnerName = (code: string): string => {
    const partner = partners.find(p => String(p.code) === code);
    return partner ? partner.name : code;
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Digite um email ou telefone');
      return;
    }

    setLoading(true);
    try {
      let user: MobileUser | null = null;
      let stores: UserStore[] = [];

      if (isEmail(searchTerm)) {
        const result = await mobileService.getMobileUserWithStores(searchTerm);
        if (result) {
          user = result.user;
          stores = result.stores;
        } else {
          setSearchedEmail(searchTerm);
          setShowEmailNotFoundModal(true);
          setCurrentUser(null);
          setUserStores([]);
          return;
        }
      } else if (isPhone(searchTerm)) {
        const cleanPhone = searchTerm.replace(/\D/g, '');
        const result = await getMobileUserWithStoresByPhone(cleanPhone);
        if (result) {
          user = result.user;
          stores = result.stores;
        } else {
          toast.error('Usuário não encontrado');
          setCurrentUser(null);
          setUserStores([]);
          return;
        }
      } else {
        toast.error('Digite um email válido ou telefone com 11 dígitos');
        return;
      }

      setCurrentUser(user);
      setUserStores(stores);
      setStoresPage(1);
      toast.success('Usuário encontrado');
    } catch (error) {
      toast.error('Erro ao buscar usuário');
      setCurrentUser(null);
      setUserStores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!currentUser) {
      toast.error('Nenhum usuário selecionado');
      return;
    }

    const dataToExport = [{
      ...currentUser,
      partner_name: getPartnerName(currentUser.partner),
      total_lojas: userStores.length
    }];

    const filename = `usuario_mobile_${currentUser.email}_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(dataToExport, mobileUserExportColumns, filename);
  };

  const handleCopyUserData = () => {
    if (!currentUser) {
      toast.error('Nenhum usuário selecionado');
      return;
    }

    const userData = [
      `Nome: ${currentUser.name}`,
      `Email: ${currentUser.email}`,
      `Tipo: ${currentUser._type || currentUser.type}`,
      `Telefone: ${applyPhoneMask(currentUser.phone)}`,
      `Parceiro: ${getPartnerName(currentUser.partner)}`,
      `Status: ${currentUser.active ? 'Ativo' : 'Inativo'}`
    ].join('\n');

    navigator.clipboard.writeText(userData);
    toast.success('Dados do usuário copiados!');
  };

  const handleCopyAllStores = () => {
    if (userStores.length === 0) {
      toast.error('Nenhuma loja vinculada');
      return;
    }

    const storesData = userStores.map((store, index) =>
      `${index + 1}. ${store.name} | CNPJ: ${store.cnpj} | Serial: ${store.serial || '-'}`
    ).join('\n');

    navigator.clipboard.writeText(storesData);
    toast.success(`${userStores.length} lojas copiadas!`);
  };

  const handleCopyStoreData = (store: UserStore) => {
    const storeData = [
      `Nome: ${store.name}`,
      `CNPJ: ${store.cnpj}`,
      `Serial: ${store.serial || '-'}`
    ].join('\n');

    navigator.clipboard.writeText(storeData);
    toast.success('Dados da loja copiados!');
  };

  const openCreateForm = () => {
    setEditingUser(null);
    setFormValues({
      name: '',
      email: searchedEmail || '',
      phone: '',
      _type: 'Operador',
      partner: '',
      active: true
    });
    setShowForm(true);
    setShowEmailNotFoundModal(false);
  };

  const openEditForm = () => {
    if (!currentUser) return;

    setEditingUser(currentUser);
    setFormValues({
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone,
      _type: currentUser._type || currentUser.type || 'Operador',
      partner: currentUser.partner,
      active: currentUser.active
    });
    setShowForm(true);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formValues.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!formValues.email.trim() || !isEmail(formValues.email)) {
      toast.error('Email válido é obrigatório');
      return;
    }
    if (!formValues.phone.trim()) {
      toast.error('Celular é obrigatório');
      return;
    }
    const cleanPhone = formValues.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 11) {
      toast.error('Celular deve ter 11 dígitos');
      return;
    }
    if (!formValues.partner) {
      toast.error('Parceiro é obrigatório');
      return;
    }

    setLoading(true);
    try {
      if (editingUser) {
        await mobileService.updateMobileUser({
          _id: editingUser._id,
          email: formValues.email,
          name: formValues.name,
          phone: cleanPhone,
          _type: formValues._type,
          partner: formValues.partner,
          active: formValues.active
        });
        toast.success('Usuário atualizado com sucesso!');
        setCurrentUser({ ...editingUser, ...formValues, phone: cleanPhone });
      } else {
        const newUser = await mobileService.createMobileUser({
          name: formValues.name,
          email: formValues.email,
          phone: cleanPhone,
          _type: formValues._type,
          partner: formValues.partner,
          active: formValues.active
        });
        toast.success('Usuário criado com sucesso!');
        setCurrentUser(newUser);
        setUserStores([]);
      }

      setShowForm(false);
      setEditingUser(null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUser) return;

    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${currentUser.name}?`)) {
      return;
    }

    setLoading(true);
    try {
      await mobileService.deleteMobileUserByEmail(currentUser.email);
      toast.success('Usuário excluído com sucesso!');
      setCurrentUser(null);
      setUserStores([]);
      setSearchTerm('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStore = async () => {
    if (!currentUser) return;
    if (!storeCnpjSearch.trim()) {
      toast.error('Digite um CNPJ');
      return;
    }

    setAddingStore(true);
    try {
      await mobileService.addStoreToUser(currentUser.email, storeCnpjSearch);
      toast.success('Loja vinculada com sucesso!');

      const result = await mobileService.getMobileUserWithStores(currentUser.email);
      if (result) {
        setUserStores(result.stores);
      }

      setShowAddStoreModal(false);
      setStoreCnpjSearch('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao vincular loja');
    } finally {
      setAddingStore(false);
    }
  };

  const handleRemoveStore = async (store: UserStore) => {
    if (!currentUser) return;

    if (!window.confirm('Tem certeza que deseja desvincular esta loja?')) {
      return;
    }

    setLoading(true);
    try {
      await mobileService.removeStoreFromUser(currentUser.email, store.cnpj);
      toast.success('Loja desvinculada com sucesso!');
      setUserStores(prev => prev.filter(s => s.cnpj !== store.cnpj));
    } catch (error: any) {
      toast.error(error.message || 'Erro ao desvincular loja');
    } finally {
      setLoading(false);
    }
  };

  const totalStoresPages = Math.ceil(userStores.length / storesPerPage);
  const paginatedStores = userStores.slice(
    (storesPage - 1) * storesPerPage,
    storesPage * storesPerPage
  );

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <PageHeader
        title="Mobile"
        description="Gerencie usuários do aplicativo mobile"
      >
        <button onClick={openCreateForm} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Usuário</span>
        </button>
      </PageHeader>

      <main className="p-4 md:p-6 space-y-6">
        {/* Search */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="input-field pl-10"
              />
            </div>
            <button onClick={handleSearch} disabled={loading} className="btn-primary whitespace-nowrap">
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Two Column Layout - User Data + Stores */}
        {currentUser && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - User Data */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Dados do Usuário</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={handleCopyUserData} className="btn-secondary text-sm px-3 py-1.5" title="Copiar dados">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={handleExportCSV} className="btn-secondary text-sm px-3 py-1.5 text-green-700" title="Exportar CSV">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={openEditForm} className="btn-secondary text-sm px-3 py-1.5 text-cyan-700" title="Editar">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={handleDelete} className="btn-secondary text-sm px-3 py-1.5 text-red-600" title="Excluir">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Nome</label>
                  <p className="text-gray-900">{currentUser.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-gray-900">{currentUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Tipo</label>
                  <p className="text-gray-900">{currentUser._type || currentUser.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Telefone</label>
                  <p className="text-gray-900">{applyPhoneMask(currentUser.phone)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Parceiro</label>
                  <p className="text-gray-900">{getPartnerName(currentUser.partner)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    currentUser.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {currentUser.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Linked Stores */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Lojas Vinculadas ({userStores.length})
                </h3>
                <div className="flex gap-2">
                  {userStores.length > 0 && (
                    <button onClick={handleCopyAllStores} className="btn-secondary text-sm px-3 py-1.5">
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setShowAddStoreModal(true)} className="btn-secondary text-sm px-3 py-1.5 text-cyan-700">
                    <Store className="w-4 h-4 mr-1" />
                    Adicionar
                  </button>
                </div>
              </div>

                {userStores.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Store className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma loja vinculada</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nome
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              CNPJ
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Serial
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedStores.map((store, index) => (
                            <tr key={store.cnpj || index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {store.name}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {store.cnpj}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {store.serial || '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleCopyStoreData(store)}
                                    className="p-1 text-gray-600 hover:text-cyan-600 transition-colors"
                                    title="Copiar dados"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveStore(store)}
                                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                    title="Desvincular"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {totalStoresPages > 1 && (
                      <div className="flex items-center justify-between mt-4 px-4">
                        <p className="text-sm text-gray-700">
                          Mostrando {((storesPage - 1) * storesPerPage) + 1} a {Math.min(storesPage * storesPerPage, userStores.length)} de {userStores.length} lojas
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setStoresPage(prev => Math.max(1, prev - 1))}
                            disabled={storesPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Anterior
                          </button>
                          <button
                            onClick={() => setStoresPage(prev => Math.min(totalStoresPages, prev + 1))}
                            disabled={storesPage === totalStoresPages}
                            className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Próximo
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
            </div>
          </div>
        )}
      </main>

      {/* Email Not Found Modal */}
      {showEmailNotFoundModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <UserPlus className="w-8 h-8 text-yellow-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Usuário não encontrado
              </h3>

              <p className="text-gray-600 mb-2">
                O email informado não foi encontrado no sistema.
              </p>
              <p className="text-sm text-gray-500 mb-6 font-mono bg-gray-100 py-2 px-3 rounded-lg">
                {searchedEmail}
              </p>

              <p className="text-gray-700 font-medium mb-6">
                Deseja cadastrar um novo usuário com este email?
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowEmailNotFoundModal(false)}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Não, cancelar
                </button>
                <button
                  onClick={openCreateForm}
                  className="px-6 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
                >
                  Sim, cadastrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formValues.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Digite o nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formValues.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="email@exemplo.com"
                  disabled={!!editingUser}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Celular *
                </label>
                <input
                  type="text"
                  value={formValues.phone}
                  onChange={(e) => {
                    const masked = applyPhoneMask(e.target.value);
                    handleFormChange('phone', masked);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Usuário *
                </label>
                <select
                  value={formValues._type}
                  onChange={(e) => handleFormChange('_type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  {USER_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Parceiro *
                </label>
                <select
                  value={formValues.partner}
                  onChange={(e) => handleFormChange('partner', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  disabled={loadingRefData}
                >
                  <option value="">Selecione um parceiro</option>
                  {partners.map((partner, idx) => (
                    <option key={partner._id || `${partner.code}-${idx}`} value={partner.code ?? ''}>
                      {partner.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formValues.active}
                  onChange={(e) => handleFormChange('active', e.target.checked)}
                  className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Usuário ativo
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Salvando...' : (editingUser ? 'Atualizar' : 'Criar')} Usuário
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Store Modal */}
      {showAddStoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Adicionar Loja</h3>
              <button
                onClick={() => {
                  setShowAddStoreModal(false);
                  setStoreCnpjSearch('');
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CNPJ da Loja
                </label>
                <input
                  type="text"
                  value={storeCnpjSearch}
                  onChange={(e) => setStoreCnpjSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddStore()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleAddStore}
                  disabled={addingStore}
                  className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium disabled:opacity-50"
                >
                  {addingStore ? 'Adicionando...' : 'Adicionar'}
                </button>
                <button
                  onClick={() => {
                    setShowAddStoreModal(false);
                    setStoreCnpjSearch('');
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobilePage;
