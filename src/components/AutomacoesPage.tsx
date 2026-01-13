/**
 * Automações (Partners) Page Component
 * Management of automation partners with CRUD operations
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Cog, RefreshCw, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageHeader } from '@/components/common';
import * as partnerService from '@/api/services/partnerService';
import { Partner } from '@/api/services/partnerService';

export const AutomaçõesPage: React.FC = () => {
  // State
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formValues, setFormValues] = useState({
    name: '',
    code: ''
  });

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<Partner | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination values
  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPartners = filteredPartners.slice(startIndex, endIndex);

  // Load partners on mount
  useEffect(() => {
    loadPartners();
  }, []);

  // Filter partners when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPartners(partners);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredPartners(
        partners.filter(
          p =>
            p.name?.toLowerCase().includes(term) ||
            String(p.code || '').toLowerCase().includes(term)
        )
      );
    }
    // Reset to first page when filter changes
    setCurrentPage(1);
  }, [searchTerm, partners]);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const data = await partnerService.getPartners();
      // Sort by name
      const sorted = data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setPartners(sorted);
      setFilteredPartners(sorted);
    } catch (error) {
      toast.error('Erro ao carregar automações');
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

    if (!formValues.name.trim() || !formValues.code.trim()) {
      toast.error('Nome e codigo sao obrigatorios');
      return;
    }

    try {
      if (editingPartner && editingPartner._id) {
        await partnerService.updatePartner(editingPartner._id, {
          name: formValues.name.trim(),
          code: formValues.code.trim()
        });
        toast.success('Automacao atualizada com sucesso!');
      } else {
        await partnerService.createPartner({
          name: formValues.name.trim(),
          code: formValues.code.trim()
        });
        toast.success('Automacao criada com sucesso!');
      }

      resetForm();
      loadPartners();
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        toast.error('Ja existe uma automacao com este codigo');
      } else {
        toast.error(editingPartner ? 'Erro ao atualizar automacao' : 'Erro ao criar automacao');
      }
    }
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setFormValues({
      name: partner.name || '',
      code: String(partner.code || '')
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm || !deleteConfirm._id) return;

    try {
      await partnerService.deletePartner(deleteConfirm._id);
      toast.success('Automacao excluida com sucesso!');
      setDeleteConfirm(null);
      loadPartners();
    } catch (error) {
      toast.error('Erro ao excluir automacao');
    }
  };

  const resetForm = () => {
    setEditingPartner(null);
    setFormValues({ name: '', code: '' });
    setShowForm(false);
  };

  const exportToCSV = () => {
    const headers = ['Nome', 'Codigo'];
    const rows = filteredPartners.map(p => [p.name || '', String(p.code || '')]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `automações_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(-1); // ellipsis
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // ellipsis
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Automações"
        description="Cadastre e gerencie parceiros de automação comercial"
      >
        <button onClick={loadPartners} className="btn-secondary text-sm px-3 py-2" title="Atualizar">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <button onClick={exportToCSV} className="btn-secondary text-sm flex items-center gap-2" title="Exportar CSV">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar</span>
        </button>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova Automação</span>
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
              placeholder="Buscar por nome ou código..."
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
              <h3 className="text-lg font-bold text-gray-900">{editingPartner ? 'Editar Automação' : 'Nova Automação'}</h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Nome da Automação *</label>
                <input type="text" name="name" value={formValues.name} onChange={handleInputChange} placeholder="Ex: WINTHOR SISTEMAS" className="input-field" required />
              </div>

              <div className="form-group">
                <label className="form-label">Código *</label>
                <input type="text" name="code" value={formValues.code} onChange={handleInputChange} placeholder="Ex: 21.1" className="input-field" required />
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4">
                <button type="submit" className="btn-primary">{editingPartner ? 'Atualizar' : 'Criar'} Automação</button>
                <button type="button" onClick={resetForm} className="btn-secondary">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {/* Partners Table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Cog className="w-5 h-5 text-cyan-600" />
              Automações Cadastradas
            </h3>
            <span className="text-sm text-gray-500">
              {filteredPartners.length} de {partners.length} registros
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Carregando automações...</p>
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="p-12 text-center">
              <Cog className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Nenhuma automacao encontrada' : 'Nenhuma automacao cadastrada'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? 'Tente buscar por outro termo'
                  : 'Clique em "Nova Automacao" para cadastrar'}
              </p>
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
                        Codigo
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acoes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedPartners.map((partner) => (
                      <tr key={partner._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center mr-3">
                              <Cog className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {partner.name || '-'}
                              </div>
                              <div className="text-xs text-gray-500 font-mono">
                                ID: {partner._id?.slice(-8) || '-'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-cyan-100 text-teal-700">
                            {partner.code ?? '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(partner)}
                            className="text-cyan-600 hover:text-teal-700 mr-4"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(partner)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredPartners.length)} de {filteredPartners.length} registros
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg ${
                        currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {getPageNumbers().map((page, index) => (
                      page === -1 ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-gray-400">...</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            currentPage === page
                              ? 'bg-cyan-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg ${
                        currentPage === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmar exclusão</h3>
              <p className="text-gray-600 mb-2">Deseja realmente excluir a automação?</p>
              <p className="text-lg font-semibold text-gray-900 mb-6">{deleteConfirm.name}</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancelar</button>
                <button onClick={handleDelete} className="btn-danger">Sim, excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomaçõesPage;
