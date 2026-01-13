/**
 * Parceiros Page Component
 * Management of partners
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageHeader } from '@/components/common';
import * as partnerService from '@/api/services/partnerService';
import { Partner } from '@/api/services/partnerService';

export const ParceirosPage: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formValues, setFormValues] = useState<{
    _id?: string;
    name: string;
    code: string;
  }>({
    name: '',
    code: ''
  });

  // Load partners on component mount
  useEffect(() => {
    loadPartners();
  }, []);

  // Filter partners based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPartners(partners);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = partners.filter(partner =>
        partner.name.toLowerCase().includes(term) ||
        (partner.code && String(partner.code).toLowerCase().includes(term)) ||
        (partner._id && partner._id.toLowerCase().includes(term))
      );
      setFilteredPartners(filtered);
    }
  }, [searchTerm, partners]);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const data = await partnerService.getPartners();
      setPartners(data);
      setFilteredPartners(data);
    } catch (error) {
      toast.error('Erro ao carregar parceiros');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValues.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      if (editingPartner && editingPartner._id) {
        await partnerService.updatePartner(editingPartner._id, {
          name: formValues.name.trim(),
          code: formValues.code || ''
        });
        toast.success('Parceiro atualizado com sucesso!');
      } else {
        await partnerService.createPartner({
          name: formValues.name.trim(),
          code: formValues.code || ''
        });
        toast.success('Novo parceiro criado com sucesso!');
      }

      loadPartners();
      resetForm();
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        toast.error('Já existe um parceiro com este código');
      } else {
        toast.error(editingPartner ? 'Erro ao atualizar parceiro' : 'Erro ao criar parceiro');
      }
    }
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setFormValues({
      _id: partner._id || '',
      name: partner.name,
      code: String(partner.code || '')
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este parceiro?')) {
      return;
    }

    try {
      await partnerService.deletePartner(id);
      toast.success('Parceiro excluído com sucesso!');
      loadPartners();
    } catch (error) {
      toast.error('Erro ao excluir parceiro');
    }
  };

  const resetForm = () => {
    setEditingPartner(null);
    setFormValues({
      name: '',
      code: ''
    });
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando parceiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Parceiros"
        description={`${partners.length} parceiro${partners.length !== 1 ? 's' : ''} cadastrado${partners.length !== 1 ? 's' : ''}`}
      >
        <button
          onClick={() => { setEditingPartner(null); resetForm(); setShowForm(true); }}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Parceiro</span>
        </button>
      </PageHeader>

      <main className="p-4 md:p-6 space-y-6">
        {/* Search */}
        <div className="card p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar parceiros por nome, código ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">{editingPartner ? 'Editar Parceiro' : 'Novo Parceiro'}</h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {editingPartner && formValues._id && (
                <div className="form-group">
                  <label className="form-label">ID (MongoDB)</label>
                  <input type="text" value={formValues._id} disabled className="input-field bg-gray-100 cursor-not-allowed" />
                </div>
              )}

              <div className={`form-group ${editingPartner && formValues._id ? '' : 'md:col-span-2'}`}>
                <label className="form-label">Nome do Parceiro *</label>
                <input type="text" name="name" value={formValues.name} onChange={handleInputChange} className="input-field" required placeholder="Digite o nome do parceiro" />
              </div>

              <div className="form-group md:col-span-2">
                <label className="form-label">Código do Parceiro</label>
                <input type="text" name="code" value={formValues.code} onChange={handleInputChange} className="input-field" placeholder="Digite o código (opcional)" />
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4">
                <button type="submit" className="btn-primary">{editingPartner ? 'Atualizar' : 'Criar'} Parceiro</button>
                <button type="button" onClick={resetForm} className="btn-secondary">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {/* Partners List */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID (MongoDB)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPartners.map((partner) => (
                  <tr key={partner._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{partner.code || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-500 font-mono">{partner._id || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(partner)}
                          className="text-cyan-600 hover:text-teal-700"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => partner._id && handleDelete(partner._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
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
          
          {filteredPartners.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Nenhum parceiro encontrado
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Tente ajustar sua busca' : 'Crie seu primeiro parceiro usando o botão acima'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ParceirosPage;