/**
 * Usuários de Suporte Page Component
 * Management of support users with CRUD operations
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, HeadphonesIcon, UserPlus, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageHeader } from '@/components/common';
import * as supportService from '@/api/services/supportService';
import { SupportUser } from '@/api/types';
import * as refDataService from '@/api/services/referenceData';
import { Partner } from '@/api/services/referenceData';
import { exportToCSV, supportUserExportColumns } from '@/utils/exportUtils';

export const SuportePage: React.FC = () => {

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Reference data
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingRefData, setLoadingRefData] = useState(true);

  // User state
  const [currentUser, setCurrentUser] = useState<SupportUser | null>(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<SupportUser | null>(null);
  const [formValues, setFormValues] = useState<{
    name: string;
    email: string;
    partner: string;
    active: boolean;
    password: string;
  }>({
    name: '',
    email: '',
    partner: '',
    active: true,
    password: ''
  });

  // Modal states
  const [showEmailNotFoundModal, setShowEmailNotFoundModal] = useState(false);
  const [searchedEmail, setSearchedEmail] = useState('');

  // Load reference data (partners) on component mount
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        setLoadingRefData(true);
        const partnersData = await refDataService.getPartners();
        setPartners(partnersData);
      } catch (error) {
        console.error('Error loading partners:', error);
        toast.error('Erro ao carregar parceiros');
      } finally {
        setLoadingRefData(false);
      }
    };
    loadReferenceData();
  }, []);

  // Search user by email
  const handleSearch = async () => {
    if (!searchTerm || !searchTerm.includes('@')) {
      toast.error('Digite um e-mail válido para buscar');
      return;
    }

    try {
      setLoading(true);
      const user = await supportService.getSupportUserByEmail(searchTerm.trim());

      if (user) {
        setCurrentUser(user);
        toast.success('Usuário encontrado!');
      } else {
        // Email não encontrado - mostrar modal
        setSearchedEmail(searchTerm.trim());
        setShowEmailNotFoundModal(true);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error searching user:', error);
      // Verificar se o erro é de "não encontrado"
      setSearchedEmail(searchTerm.trim());
      setShowEmailNotFoundModal(true);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Open form to create new user with pre-filled email
  const handleCreateWithEmail = () => {
    setShowEmailNotFoundModal(false);
    resetForm();
    setFormValues(prev => ({
      ...prev,
      email: searchedEmail
    }));
    setShowForm(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormValues(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        await supportService.updateSupportUser({
          email: formValues.email,
          name: formValues.name,
          partner: formValues.partner,
          active: formValues.active,
        });
        toast.success('Usuário de suporte atualizado com sucesso!');
      } else {
        await supportService.createSupportUser({
          name: formValues.name,
          email: formValues.email,
          partner: formValues.partner,
          active: formValues.active,
          password: formValues.password || undefined,
        });
        toast.success('Usuário de suporte criado com sucesso!');
      }

      // Refresh user data
      setSearchTerm(formValues.email);
      const user = await supportService.getSupportUserByEmail(formValues.email);
      if (user) {
        setCurrentUser(user);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving support user:', error);
      toast.error(editingUser ? 'Erro ao atualizar usuário de suporte' : 'Erro ao criar usuário de suporte');
    }
  };

  const handleEdit = () => {
    if (!currentUser) return;

    setEditingUser(currentUser);
    setFormValues({
      name: currentUser.name || '',
      email: currentUser.email || '',
      partner: currentUser.partner || '',
      active: currentUser.active ?? true,
      password: ''
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!currentUser || !currentUser.email) return;

    if (!window.confirm('Tem certeza que deseja excluir este usuário de suporte?')) {
      return;
    }

    try {
      await supportService.deleteSupportUserByEmail(currentUser.email);
      toast.success('Usuário de suporte excluído com sucesso!');
      setCurrentUser(null);
      setSearchTerm('');
    } catch (error) {
      console.error('Error deleting support user:', error);
      toast.error('Erro ao excluir usuário de suporte');
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormValues({
      name: '',
      email: '',
      partner: '',
      active: true,
      password: ''
    });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <PageHeader
        title="Suporte"
        description="Gerencie usuários da equipe de suporte"
      >
        {currentUser && (
          <button
            onClick={() => exportToCSV([currentUser], supportUserExportColumns, `usuario_suporte_${currentUser.email}`)}
            className="btn-secondary flex items-center gap-2 text-sm"
            title="Exportar para CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        )}
        <button
          onClick={() => {
            setEditingUser(null);
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2 text-sm"
        >
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
                type="email"
                placeholder="Digite o e-mail do usuário para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input-field pl-10"
              />
            </div>
            <button onClick={handleSearch} disabled={loading} className="btn-primary whitespace-nowrap">
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Nome</label>
                <input type="text" name="name" value={formValues.name} onChange={handleInputChange} className="input-field" required />
              </div>

              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input type="email" name="email" value={formValues.email} onChange={handleInputChange} className="input-field" required readOnly={!!editingUser} />
              </div>

              <div className="form-group">
                <label className="form-label">Parceiro</label>
                <select name="partner" value={formValues.partner} onChange={handleInputChange} className="select-field" disabled={loadingRefData}>
                  <option value="">{loadingRefData ? 'Carregando...' : 'Selecione'}</option>
                  {partners.map((partner, index) => (
                    <option key={index} value={partner.name}>
                      {partner.name} {partner.code ? `(${partner.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {!editingUser && (
                <div className="form-group">
                  <label className="form-label">Senha</label>
                  <input type="password" name="password" value={formValues.password} onChange={handleInputChange} className="input-field" placeholder="Deixe vazio para gerar automaticamente" />
                </div>
              )}

              <div className="md:col-span-2 flex items-center">
                <input type="checkbox" name="active" checked={formValues.active} onChange={handleInputChange} className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded" />
                <label className="ml-2 block text-sm text-gray-900">Usuário Ativo</label>
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4">
                <button type="submit" className="btn-primary">{editingUser ? 'Atualizar' : 'Criar'} Usuário</button>
                <button type="button" onClick={resetForm} className="btn-secondary">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {/* User Details Section */}
        {currentUser && (
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <HeadphonesIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{currentUser.name}</h3>
                    <p className="text-gray-500">{currentUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleEdit} className="btn-secondary text-sm px-3 py-1.5 text-cyan-600">
                    <Edit className="w-4 h-4 mr-1" />Editar
                  </button>
                  <button onClick={handleDelete} className="btn-secondary text-sm px-3 py-1.5 text-red-600">
                    <Trash2 className="w-4 h-4 mr-1" />Excluir
                  </button>
                </div>
              </div>
            </div>

            {/* User Info Grid */}
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500">Parceiro</p>
                <p className="font-medium text-gray-900">{currentUser.partner || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`badge ${currentUser.active ? 'badge-success' : 'badge-danger'}`}>
                  {currentUser.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Data de Cadastro</p>
                <p className="font-medium text-gray-900">
                  {currentUser.inclusao ? new Date(currentUser.inclusao).toLocaleDateString('pt-BR') : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ID</p>
                <p className="font-medium text-gray-900 font-mono text-xs">{currentUser._id || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!currentUser && !showForm && (
          <div className="card p-12 text-center">
            <div className="text-gray-400 mb-4">
              <UserPlus className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Busque um usuário para começar</h3>
            <p className="text-gray-500 mb-6">Digite o e-mail de um usuário na barra de busca acima para visualizar seus dados</p>
            <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
              <Plus className="w-5 h-5 mr-2" />Criar Novo Usuário
            </button>
          </div>
        )}
      </main>

      {/* Modal E-mail não encontrado */}
      {showEmailNotFoundModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Usuário não encontrado
              </h3>

              <p className="text-gray-600 mb-2">
                O e-mail informado não foi encontrado no sistema.
              </p>
              <p className="text-sm text-gray-500 mb-6 font-mono bg-gray-100 py-2 px-3 rounded-lg">
                {searchedEmail}
              </p>

              <p className="text-gray-700 font-medium mb-6">
                Deseja cadastrar um novo usuário de suporte com este e-mail?
              </p>

              <div className="flex gap-3 justify-center">
                <button onClick={() => setShowEmailNotFoundModal(false)} className="btn-secondary">Não, cancelar</button>
                <button onClick={handleCreateWithEmail} className="btn-primary">Sim, cadastrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuportePage;
