/**
 * Lojas Page Component
 * Management of stores with CRUD operations
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Building, Loader2, Download, Users, User, ArrowUpDown, ArrowUp, ArrowDown, Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageHeader } from '@/components/common';
import * as storeService from '@/api/services/storeService';
import { StoreUser } from '@/api/services/storeService';
import * as refDataService from '@/api/services/referenceData';
import * as cnpjService from '@/api/services/cnpjService';
import { Partner, State, Segment, Size, City } from '@/api/services/referenceData';
import { Store } from '@/api/types';
import { applyCNPJMask, applyPhoneMask, unformatCNPJ } from '@/utils/formatters';
import { exportToCSV, storeExportColumns } from '@/utils/exportUtils';

// Dias da semana para o campo Funcionamento (0-6)
const OPERATION_DAYS = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Segunda-feira', short: 'Seg' },
  { value: 2, label: 'Terça-feira', short: 'Ter' },
  { value: 3, label: 'Quarta-feira', short: 'Qua' },
  { value: 4, label: 'Quinta-feira', short: 'Qui' },
  { value: 5, label: 'Sexta-feira', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sab' },
];

// Códigos especiais da API:
// 7 = Segunda a Sábado
// 8 = Todos os dias
// 33 = Todos os dias (legado)

// Atalhos para seleção rápida (com códigos para a API)
const OPERATION_SHORTCUTS = [
  { label: 'Todos os dias', values: [0, 1, 2, 3, 4, 5, 6], codes: [8, 33] },
  { label: 'Segunda à Sábado', values: [1, 2, 3, 4, 5, 6], codes: [7] },
];

// Filtra apenas dias válidos (0-6) do array da API
const filterValidDays = (operation: number[]): number[] => {
  return (operation || []).filter(d => d >= 0 && d <= 6);
};

// Gera o array completo para salvar na API (dias + códigos de atalho)
const getOperationArray = (days: number[]): number[] => {
  const sorted = [...days].sort((a, b) => a - b);

  // Verifica se é "Todos os dias" (0,1,2,3,4,5,6)
  if (sorted.length === 7 && JSON.stringify(sorted) === JSON.stringify([0, 1, 2, 3, 4, 5, 6])) {
    return [...sorted, 7, 8, 33]; // inclui todos os códigos de atalho
  }
  // Verifica se é "Segunda à Sábado" (1,2,3,4,5,6)
  if (sorted.length === 6 && JSON.stringify(sorted) === JSON.stringify([1, 2, 3, 4, 5, 6])) {
    return [...sorted, 7];
  }
  return sorted;
};

export const LojasPage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  // Reference data states
  const [partners, setPartners] = useState<Partner[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingRefData, setLoadingRefData] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [showDaysDropdown, setShowDaysDropdown] = useState(false);
  const [showCnpjNotFoundModal, setShowCnpjNotFoundModal] = useState(false);
  const [searchedCnpj, setSearchedCnpj] = useState('');
  const [loadingCnpjData, setLoadingCnpjData] = useState(false);

  // Store users state
  const [storeUsers, setStoreUsers] = useState<StoreUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedStoreInfo, setSelectedStoreInfo] = useState<{_id: string; tradeName: string; cnpj: string; serial: string} | null>(null);

  // Pagination state for store users
  const [usersPage, setUsersPage] = useState(1);
  const usersPerPage = 5;

  // Copy store data state
  const [copiedStoreData, setCopiedStoreData] = useState(false);

  // Sorting state
  type SortKey = 'tradeName' | 'cnpj' | 'serial' | 'active' | 'partner';
  type SortDirection = 'asc' | 'desc' | null;
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Handle column sorting
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      // Toggle direction or reset
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Get sort icon for column
  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400" />;
    if (sortDirection === 'asc') return <ArrowUp className="w-4 h-4 ml-1 text-cyan-600" />;
    return <ArrowDown className="w-4 h-4 ml-1 text-cyan-600" />;
  };

  // Get sorted stores
  const getSortedStores = () => {
    if (!sortKey || !sortDirection) return filteredStores;

    return [...filteredStores].sort((a, b) => {
      let aVal: string | boolean | undefined;
      let bVal: string | boolean | undefined;

      switch (sortKey) {
        case 'tradeName':
          aVal = a.tradeName || a.fantasy_name || '';
          bVal = b.tradeName || b.fantasy_name || '';
          break;
        case 'cnpj':
          aVal = a.cnpj || '';
          bVal = b.cnpj || '';
          break;
        case 'serial':
          aVal = a.serial || a.licenca || '';
          bVal = b.serial || b.licenca || '';
          break;
        case 'active':
          aVal = a.active ?? false;
          bVal = b.active ?? false;
          break;
        case 'partner':
          aVal = a.partner || '';
          bVal = b.partner || '';
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        return sortDirection === 'asc'
          ? (aVal === bVal ? 0 : aVal ? 1 : -1)
          : (aVal === bVal ? 0 : aVal ? -1 : 1);
      }

      const comparison = String(aVal).localeCompare(String(bVal), 'pt-BR', { sensitivity: 'base' });
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const [formValues, setFormValues] = useState<Store>({
    id: 0,
    name: '',
    fantasy_name: '',
    cnpj: '',
    phone: '',
    email: '',
    segment: '',
    working_hours: '',
    size: '',
    partner: '',
    partner_code: '',
    address_state: '',
    address_city: '',
    address_street: '',
    address_number: '',
    address_district: '',
    address_city_code: '',
    address_state_code: '',
    active: true,
    offerta: false,
    oppinar: false,
    prazzo: false,
    scanner: false,
    service_offerta: false,
    service_oppinar: false,
    service_prazzo: false,
    service_scanner: false,
    status: 'inativo',
    serial: '',
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  });

  // Load reference data on component mount
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        setLoadingRefData(true);
        const data = await refDataService.loadAllReferenceData();
        setPartners(data.partners);
        setStates(data.states);
        setSegments(data.segments);
        setSizes(data.sizes);
      } catch (error) {
        toast.error('Erro ao carregar dados de referência');
      } finally {
        setLoadingRefData(false);
        setLoading(false);
      }
    };
    loadReferenceData();
  }, []);

  // Load cities when state changes
  const loadCitiesByState = async (stateCode: string): Promise<City[]> => {
    if (!stateCode) {
      setCities([]);
      return [];
    }
    try {
      setLoadingCities(true);
      const citiesData = await refDataService.getCitiesByState(stateCode);
      setCities(citiesData);
      return citiesData;
    } catch (error) {
      setCities([]);
      return [];
    } finally {
      setLoadingCities(false);
    }
  };

  // Buscar dados do CNPJ na Receita Federal via BrasilAPI
  const handleFetchCnpjData = async () => {
    const cnpj = formValues.cnpj;
    if (!cnpj || cnpj.replace(/\D/g, '').length < 14) {
      toast.error('Digite um CNPJ válido com 14 dígitos');
      return;
    }

    try {
      setLoadingCnpjData(true);
      const data = await cnpjService.consultarCNPJ(cnpj);

      if (!data) {
        toast.error('CNPJ não encontrado na Receita Federal');
        return;
      }

      if (data.situacao_cadastral !== 'ATIVA') {
        toast('Atenção: Empresa com situação cadastral ' + data.situacao_cadastral, {
          icon: '⚠️',
          duration: 5000,
        });
      }

      // Buscar estado pelo UF
      const stateName = cnpjService.UF_TO_NAME[data.uf] || '';
      const stateCode = cnpjService.UF_TO_CODE[data.uf] || '';

      // Carregar cidades do estado antes de preencher
      let citiesData: City[] = [];
      if (stateCode) {
        citiesData = await loadCitiesByState(stateCode);
      }

      // Buscar código da cidade pelo nome (API pode não retornar código compatível)
      const cityNameUpper = (data.municipio || '').toUpperCase();
      let cityCode = data.codigo_municipio || '';
      let cityName = data.municipio || ''; // Manter nome original

      if (citiesData.length > 0 && cityNameUpper) {
        const foundCity = citiesData.find(c => c.name.toUpperCase() === cityNameUpper);
        if (foundCity) {
          cityCode = String(foundCity.code);
          cityName = foundCity.name; // Usar o nome exato da cidade da API
        }
      }

      // Mapear porte
      const mappedSize = cnpjService.mapPorte(data.porte);

      // Preencher formulário com dados da Receita
      setFormValues(prev => ({
        ...prev,
        name: data.razao_social || prev.name,
        fantasy_name: data.nome_fantasia || data.razao_social || prev.fantasy_name,
        phone: cnpjService.formatPhone(data.telefone) || prev.phone,
        email: data.email?.toLowerCase() || prev.email,
        address_state: stateName,
        address_state_code: stateCode,
        address_city: cityName || prev.address_city,
        address_city_code: cityCode || prev.address_city_code,
        address_street: data.logradouro || prev.address_street,
        address_number: data.numero || prev.address_number,
        address_district: data.bairro || prev.address_district,
        size: mappedSize || prev.size,
      }));

      toast.success('Dados carregados da Receita Federal!');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao consultar CNPJ');
      }
    } finally {
      setLoadingCnpjData(false);
    }
  };

  // Search stores by CNPJ when user presses Enter or clicks search
  const handleSearch = async () => {
    if (!searchTerm || searchTerm.length < 11) {
      toast.error('Digite um CNPJ válido para buscar (mínimo 11 dígitos)');
      return;
    }

    try {
      setLoading(true);
      setStoreUsers([]); // Clear previous users
      setSelectedStoreInfo(null);
      // Remove any non-digit characters for search
      const cleanCnpj = searchTerm.replace(/\D/g, '');
      const data = await storeService.getStores(cleanCnpj);
      setStores(data);
      setFilteredStores(data);

      if (data.length === 0) {
        // CNPJ não encontrado - mostrar modal perguntando se deseja cadastrar
        setSearchedCnpj(cleanCnpj);
        setShowCnpjNotFoundModal(true);
      } else {
        toast.success(`${data.length} loja(s) encontrada(s)`);
        // Buscar usuários da loja usando os IDs que já vêm na resposta
        const store = data[0];
        if (store.users && store.users.length > 0) {
          await loadStoreUsers(store.users, store);
        } else {
          setSelectedStoreInfo({
            _id: store._id || '',
            tradeName: store.tradeName || store.fantasy_name || '',
            cnpj: store.cnpj || '',
            serial: store.serial || store.licenca || ''
          });
        }
      }
    } catch (error) {
      // Verificar se o erro é de "não encontrado" ou outro erro
      const cleanCnpj = searchTerm.replace(/\D/g, '');
      setSearchedCnpj(cleanCnpj);
      setShowCnpjNotFoundModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Load users by their IDs (from store.users array)
  const loadStoreUsers = async (userIds: string[], store: Store) => {
    try {
      setLoadingUsers(true);
      setUsersPage(1); // Reset pagination when loading new store users
      setSelectedStoreInfo({
        _id: store._id || '',
        tradeName: store.tradeName || store.fantasy_name || '',
        cnpj: store.cnpj || '',
        serial: store.serial || store.licenca || ''
      });
      const users = await storeService.getUsersByIds(userIds);
      setStoreUsers(users || []);
    } catch (error) {
      setStoreUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Função para abrir formulário de cadastro com CNPJ preenchido
  const handleCreateWithCnpj = () => {
    setShowCnpjNotFoundModal(false);
    resetForm();
    setFormValues(prev => ({
      ...prev,
      cnpj: searchedCnpj
    }));
    setShowForm(true);
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const loadStores = async () => {
    // This function now requires CNPJ
    // Called after create/update/delete to refresh if there's a search term
    if (searchTerm) {
      await handleSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormValues(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      // Apply CNPJ mask
      if (name === 'cnpj') {
        const maskedValue = applyCNPJMask(value);
        setFormValues(prev => ({
          ...prev,
          [name]: maskedValue
        }));
      }
      // Apply phone mask
      else if (name === 'phone') {
        const maskedValue = applyPhoneMask(value);
        setFormValues(prev => ({
          ...prev,
          [name]: maskedValue
        }));
      }
      // Auto-fill partner_code when partner is selected
      else if (name === 'partner') {
        const selectedPartner = partners.find(p => p.name === value);
        setFormValues(prev => ({
          ...prev,
          [name]: value,
          partner_code: selectedPartner?.code ? String(selectedPartner.code) : ''
        }));
      }
      // Auto-fill address_state_code when state is selected and load cities
      else if (name === 'address_state') {
        const selectedState = states.find(s => s.name === value);
        const stateCode = selectedState?.code || '';
        setFormValues(prev => ({
          ...prev,
          [name]: value,
          address_state_code: stateCode,
          address_city: '', // Reset city when state changes
          address_city_code: ''
        }));
        // Load cities for the selected state
        if (stateCode) {
          loadCitiesByState(stateCode);
        } else {
          setCities([]);
        }
      }
      // Auto-fill address_city_code when city is selected
      else if (name === 'address_city') {
        const selectedCity = cities.find(c => c.name === value);
        setFormValues(prev => ({
          ...prev,
          [name]: value,
          address_city_code: selectedCity?.code || ''
        }));
      }
      else {
        setFormValues(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Include selected days in form data (with shortcut codes for API)
    // Remove formatting from CNPJ and phone before sending
    const submitData = {
      ...formValues,
      cnpj: unformatCNPJ(formValues.cnpj),
      phone: formValues.phone.replace(/\D/g, ''),
      operation: getOperationArray(selectedDays)
    };

    try {
      if (editingStore) {
        await storeService.updateStore(submitData);
        toast.success('Loja atualizada com sucesso!');
      } else {
        await storeService.createStore(submitData);
        toast.success('Loja criada com sucesso!');
      }

      loadStores();
      resetForm();
    } catch (error) {
      toast.error(editingStore ? 'Erro ao atualizar loja' : 'Erro ao criar loja');
    }
  };

  const handleEdit = async (store: Store) => {
    setEditingStore(store);

    // Get state name from API response
    const stateName = store.state || store.address_state || '';

    // Try to find state code: first from API, then by searching states list by name
    let stateCode = String(store.stateCode || store.address_state_code || '');
    if ((!stateCode || stateCode === '0') && stateName && states.length > 0) {
      // Search state by name (case insensitive)
      const foundState = states.find(s =>
        s.name.toUpperCase() === stateName.toUpperCase()
      );
      if (foundState) {
        stateCode = String(foundState.code);
      }
    }

    // Get city name and code
    const cityName = store.city || store.address_city || '';
    let cityCode = String(store.cityCode || store.address_city_code || '');

    // Map API response fields to form fields
    setFormValues({
      id: store.id || 0,
      _id: store._id || '',
      name: store.company || store.name || '',
      fantasy_name: store.tradeName || store.fantasy_name || '',
      cnpj: applyCNPJMask(store.cnpj || ''),
      phone: applyPhoneMask(store.phone || ''),
      email: store.email || '',
      segment: store.segment || '',
      working_hours: store.working_hours || '',
      size: store.size || '',
      partner: store.partner || '',
      partner_code: String(store.codePartner || store.partner_code || ''),
      address_state: stateName,
      address_city: cityName,
      address_street: store.street || store.address_street || '',
      address_number: store.number || store.address_number || '',
      address_district: store.neighborhood || store.address_district || '',
      address_city_code: cityCode,
      address_state_code: stateCode,
      active: store.active ?? true,
      offerta: store.offerta ?? false,
      oppinar: store.oppinar ?? false,
      prazzo: store.prazzo ?? false,
      scanner: store.scanner ?? false,
      service_offerta: store.offerta ?? false,
      service_oppinar: store.oppinar ?? false,
      service_prazzo: store.prazzo ?? false,
      service_scanner: typeof store.scanner === 'object' ? store.scanner?.active : !!store.scanner,
      status: store.active ? 'ativo' : 'inativo',
      serial: store.serial || store.licenca || '',
      updated_at: store.updated_at || new Date().toISOString(),
      created_at: store.createAt || store.created_at || new Date().toISOString()
    });

    // Set operation days (filter only valid days 0-6, ignore shortcut codes)
    setSelectedDays(filterValidDays(store.operation || []));

    // Load cities for the store's state and try to find city code
    if (stateCode && stateCode !== '0') {
      const citiesData = await loadCitiesByState(stateCode);
      // If cityCode is 0 or empty, try to find it by city name
      if ((!cityCode || cityCode === '0') && cityName && citiesData && citiesData.length > 0) {
        const foundCity = citiesData.find((c) =>
          c.name.toUpperCase() === cityName.toUpperCase()
        );
        if (foundCity) {
          setFormValues(prev => ({
            ...prev,
            address_city_code: String(foundCity.code)
          }));
        }
      }
    }

    setShowForm(true);
  };

  const handleDeleteByCnpj = async (cnpj: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta loja?')) {
      return;
    }

    try {
      await storeService.deleteStoreByCnpj(cnpj);
      toast.success('Loja excluída com sucesso!');
      loadStores();
    } catch (error) {
      toast.error('Erro ao excluir loja');
    }
  };

  const resetForm = () => {
    setEditingStore(null);
    setFormValues({
      id: 0,
      name: '',
      fantasy_name: '',
      cnpj: '',
      phone: '',
      email: '',
      segment: '',
      working_hours: '',
      size: '',
      partner: '',
      partner_code: '',
      address_state: '',
      address_city: '',
      address_street: '',
      address_number: '',
      address_district: '',
      address_city_code: '',
      address_state_code: '',
      active: true,
      offerta: false,
      oppinar: false,
      prazzo: false,
      scanner: false,
      service_offerta: false,
      service_oppinar: false,
      service_prazzo: false,
      service_scanner: false,
      status: 'inativo',
      serial: '',
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    });
    setSelectedDays([]);
    setShowDaysDropdown(false);
    setShowForm(false);
  };

  // Toggle day selection
  const toggleDay = (dayValue: number) => {
    setSelectedDays(prev =>
      prev.includes(dayValue)
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue].sort((a, b) => a - b)
    );
  };

  // Apply shortcut selection
  const applyShortcut = (values: number[]) => {
    setSelectedDays(values);
  };

  // Clear all days
  const clearDays = () => {
    setSelectedDays([]);
  };

  // Copy store data to clipboard
  const handleCopyStoreData = async () => {
    if (!editingStore) return;

    const storeData = [
      `Nome: ${editingStore.tradeName || editingStore.fantasy_name || editingStore.company || editingStore.name || '-'}`,
      `CNPJ: ${editingStore.cnpj || '-'}`,
      `ID: ${editingStore._id || '-'}`,
      `Serial: ${editingStore.serial || editingStore.licenca || '-'}`,
      `Parceiro: ${editingStore.partner || '-'}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(storeData);
      setCopiedStoreData(true);
      toast.success('Dados copiados para a area de transferencia!');
      setTimeout(() => setCopiedStoreData(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar dados');
    }
  };


  if (loading && !stores.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <PageHeader
        title="Lojas"
        description={`${stores.length} loja${stores.length !== 1 ? 's' : ''} cadastrada${stores.length !== 1 ? 's' : ''}`}
      >
        {stores.length > 0 && (
          <button
            onClick={() => exportToCSV(stores, storeExportColumns, `lojas_${new Date().toISOString().split('T')[0]}`)}
            className="btn-secondary flex items-center gap-2 text-sm"
            title="Exportar para CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        )}
        <button
          onClick={() => {
            setEditingStore(null);
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova Loja</span>
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
                placeholder="Digite o CNPJ para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input-field pl-10"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn-primary whitespace-nowrap"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingStore ? 'Editar Loja' : 'Nova Loja'}
                </h3>
                {editingStore && (
                  <button
                    type="button"
                    onClick={handleCopyStoreData}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    title="Copiar dados da loja (Nome, CNPJ, ID, Serial, Parceiro)"
                  >
                    {copiedStoreData ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Dados</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Razão Social</label>
                <input
                  type="text"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nome Fantasia</label>
                <input
                  type="text"
                  name="fantasy_name"
                  value={formValues.fantasy_name}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">CNPJ</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="cnpj"
                    value={formValues.cnpj}
                    onChange={handleInputChange}
                    className="input-field flex-1"
                    placeholder="00.000.000/0000-00"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleFetchCnpjData}
                    disabled={loadingCnpjData || !formValues.cnpj}
                    className="btn-secondary flex items-center gap-2 whitespace-nowrap"
                    title="Buscar dados na Receita Federal"
                  >
                    {loadingCnpjData ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">{loadingCnpjData ? 'Buscando...' : 'Receita'}</span>
                  </button>
                </div>
              </div>

              {/* Serial - apenas visível na edição */}
              {editingStore && (
                <div className="form-group">
                  <label className="form-label">Serial (Licença)</label>
                  <input
                    type="text"
                    name="serial"
                    value={formValues.serial}
                    readOnly
                    className="input-field bg-gray-100 cursor-not-allowed font-mono"
                    placeholder="Gerado automaticamente"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input
                  type="text"
                  name="phone"
                  value={formValues.phone}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Segmento</label>
                <select
                  name="segment"
                  value={formValues.segment}
                  onChange={handleInputChange}
                  className="select-field"
                  disabled={loadingRefData}
                >
                  <option value="">{loadingRefData ? 'Carregando...' : 'Selecione'}</option>
                  {segments.map((seg, index) => (
                    <option key={index} value={seg.description}>
                      {seg.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Funcionamento
                </label>
                <div
                  onClick={() => setShowDaysDropdown(!showDaysDropdown)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <div className="flex flex-wrap gap-1">
                    {selectedDays.length === 0 ? (
                      <span className="text-gray-400">Selecione os dias</span>
                    ) : (
                      selectedDays.sort((a, b) => a - b).map(dayValue => {
                        const day = OPERATION_DAYS.find(d => d.value === dayValue);
                        return day ? (
                          <span key={dayValue} className="bg-cyan-100 text-teal-700 px-2 py-0.5 rounded text-sm font-medium">
                            {day.short}
                          </span>
                        ) : null;
                      })
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedDays.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); clearDays(); }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${showDaysDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {showDaysDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-auto">
                    {/* Atalhos */}
                    {OPERATION_SHORTCUTS.map((shortcut, index) => {
                      const sortedSelected = [...selectedDays].sort((a, b) => a - b);
                      const sortedShortcut = [...shortcut.values].sort((a, b) => a - b);
                      const isMatch = JSON.stringify(sortedSelected) === JSON.stringify(sortedShortcut);
                      return (
                        <div
                          key={`shortcut-${index}`}
                          onClick={() => applyShortcut(shortcut.values)}
                          className={`px-4 py-2 cursor-pointer hover:bg-cyan-50 flex items-center gap-2 border-b border-gray-100 ${
                            isMatch ? 'bg-cyan-50 text-cyan-700' : ''
                          }`}
                        >
                          <span className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center">
                            {isMatch && (
                              <svg className="w-3 h-3 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </span>
                          <span className="font-medium">{shortcut.label}</span>
                        </div>
                      );
                    })}
                    {/* Dias individuais */}
                    {OPERATION_DAYS.map((day) => (
                      <div
                        key={day.value}
                        onClick={() => toggleDay(day.value)}
                        className={`px-4 py-2 cursor-pointer hover:bg-cyan-50 flex items-center gap-2 ${
                          selectedDays.includes(day.value) ? 'bg-cyan-50 text-cyan-700' : ''
                        }`}
                      >
                        <span className={`w-4 h-4 border rounded flex items-center justify-center ${
                          selectedDays.includes(day.value) ? 'bg-cyan-600 border-cyan-600' : 'border-gray-300'
                        }`}>
                          {selectedDays.includes(day.value) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </span>
                        <span>{day.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Porte</label>
                <select
                  name="size"
                  value={formValues.size}
                  onChange={handleInputChange}
                  className="select-field"
                  disabled={loadingRefData}
                >
                  <option value="">{loadingRefData ? 'Carregando...' : 'Selecione'}</option>
                  {sizes.map((size, index) => (
                    <option key={index} value={size.value}>
                      {size.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Parceiro</label>
                <select
                  name="partner"
                  value={formValues.partner}
                  onChange={handleInputChange}
                  className="select-field"
                  disabled={loadingRefData}
                >
                  <option value="">{loadingRefData ? 'Carregando...' : 'Selecione'}</option>
                  {partners.map((partner, index) => (
                    <option key={index} value={partner.name}>
                      {partner.name} {partner.code ? `(${partner.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Código do Parceiro</label>
                <input
                  type="text"
                  name="partner_code"
                  value={formValues.partner_code}
                  readOnly
                  className="input-field bg-gray-100 cursor-not-allowed"
                  placeholder="Preenchido automaticamente"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estado</label>
                <select
                  name="address_state"
                  value={formValues.address_state}
                  onChange={handleInputChange}
                  className="select-field"
                  disabled={loadingRefData}
                >
                  <option value="">{loadingRefData ? 'Carregando...' : 'Selecione'}</option>
                  {states.map((state, index) => (
                    <option key={index} value={state.name}>
                      {state.name} ({state.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Cidade</label>
                <select
                  name="address_city"
                  value={formValues.address_city}
                  onChange={handleInputChange}
                  className="select-field"
                  disabled={loadingCities || !formValues.address_state}
                >
                  <option value="">
                    {loadingCities
                      ? 'Carregando cidades...'
                      : !formValues.address_state
                        ? 'Selecione um estado primeiro'
                        : cities.length === 0
                          ? 'Nenhuma cidade encontrada'
                          : 'Selecione a cidade'}
                  </option>
                  {cities.map((city, index) => (
                    <option key={index} value={city.name}>
                      {city.name} {city.code ? `(${city.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Rua</label>
                <input
                  type="text"
                  name="address_street"
                  value={formValues.address_street}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Número</label>
                <input
                  type="text"
                  name="address_number"
                  value={formValues.address_number}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bairro</label>
                <input
                  type="text"
                  name="address_district"
                  value={formValues.address_district}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Código da Cidade</label>
                <input
                  type="text"
                  name="address_city_code"
                  value={formValues.address_city_code}
                  readOnly
                  className="input-field bg-gray-100 cursor-not-allowed"
                  placeholder="Preenchido automaticamente"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Código do Estado</label>
                <input
                  type="text"
                  name="address_state_code"
                  value={formValues.address_state_code}
                  readOnly
                  className="input-field bg-gray-100 cursor-not-allowed"
                  placeholder="Preenchido automaticamente"
                />
              </div>

              <div className="form-group md:col-span-2">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={formValues.status}
                  onChange={handleInputChange}
                  className="select-field"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="pendente">Pendente</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={formValues.active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Loja Ativa
                </label>
              </div>

              <div className="md:col-span-2 flex items-center">
                <input
                  type="checkbox"
                  name="service_offerta"
                  checked={formValues.service_offerta}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Serviço Offerta
                </label>
              </div>

              <div className="md:col-span-2 flex items-center">
                <input
                  type="checkbox"
                  name="service_oppinar"
                  checked={formValues.service_oppinar}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Serviço Oppinar
                </label>
              </div>

              <div className="md:col-span-2 flex items-center">
                <input
                  type="checkbox"
                  name="service_prazzo"
                  checked={formValues.service_prazzo}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Serviço Prazzo
                </label>
              </div>

              {/* Scanner Service Toggle */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Planos
                </label>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium transition-colors ${formValues.service_scanner ? 'text-cyan-600' : 'text-gray-400'}`}>
                    Plano Básico
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormValues(prev => ({ ...prev, service_scanner: !prev.service_scanner }))}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
                      formValues.service_scanner ? 'bg-cyan-600' : 'bg-gray-200'
                    }`}
                    role="switch"
                    aria-checked={formValues.service_scanner}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formValues.service_scanner ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-medium transition-colors ${!formValues.service_scanner ? 'text-cyan-600' : 'text-gray-400'}`}>
                    Plano Avançado
                  </span>
                </div>
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4">
                <button type="submit" className="btn-primary">
                  {editingStore ? 'Atualizar' : 'Criar'} Loja
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stores List */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('tradeName')}
                  >
                    <div className="flex items-center">
                      Loja
                      {getSortIcon('tradeName')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('cnpj')}
                  >
                    <div className="flex items-center">
                      CNPJ
                      {getSortIcon('cnpj')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('serial')}
                  >
                    <div className="flex items-center">
                      Serial
                      {getSortIcon('serial')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('active')}
                  >
                    <div className="flex items-center">
                      Status
                      {getSortIcon('active')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('partner')}
                  >
                    <div className="flex items-center">
                      Parceiro
                      {getSortIcon('partner')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getSortedStores().map((store) => (
                  <tr key={store._id || store.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{store.company || store.name}</div>
                      <div className="text-sm text-gray-500">{store.tradeName || store.fantasy_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{store.cnpj}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-cyan-100 text-teal-700">
                        {store.serial || store.licenca || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        store.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {store.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {store.partner || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const data = [
                              `Nome: ${store.tradeName || store.fantasy_name || store.company || store.name || '-'}`,
                              `CNPJ: ${store.cnpj || '-'}`,
                              `ID: ${store._id || '-'}`,
                              `Serial: ${store.serial || store.licenca || '-'}`,
                              `Parceiro: ${store.partner || '-'}`,
                            ].join('\n');
                            navigator.clipboard.writeText(data);
                            toast.success('Dados copiados!');
                          }}
                          className="text-gray-600 hover:text-gray-900"
                          title="Copiar dados da loja"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(store)}
                          className="text-cyan-600 hover:text-teal-700"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => store._id && handleDeleteByCnpj(store.cnpj)}
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
          
          {filteredStores.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Building className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Nenhuma loja encontrada
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Tente ajustar sua busca' : 'Crie sua primeira loja usando o botão acima'}
              </p>
            </div>
          )}
        </div>

        {/* Store Users Section */}
        {(filteredStores.length > 0 || loadingUsers) && (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-cyan-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    Usuários da Loja
                  </h3>
                  {selectedStoreInfo && (
                    <span className="text-sm text-gray-500">
                      - {selectedStoreInfo.tradeName} ({selectedStoreInfo.serial})
                    </span>
                  )}
                </div>
                {storeUsers.length > 0 && (
                  <button
                    onClick={() => {
                      const allUsersData = storeUsers.map(u =>
                        `Nome: ${u.name || '-'}\nEmail: ${u.email || '-'}\nTipo: ${u.type || 'Mobile'}\nCelular: ${u.cellPhone || '-'}\nParceiro: ${u.partner || '-'}\nStatus: ${u.active ? 'Ativo' : 'Inativo'}`
                      ).join('\n\n---\n\n');
                      navigator.clipboard.writeText(allUsersData);
                      toast.success(`${storeUsers.length} usuário(s) copiado(s)!`);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-colors font-medium"
                    title="Copiar dados de todos os usuários"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copiar Todos</span>
                  </button>
                )}
              </div>
            </div>

            {loadingUsers ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando usuários...</p>
              </div>
            ) : storeUsers.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Celular
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Parceiro
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {storeUsers
                        .slice((usersPage - 1) * usersPerPage, usersPage * usersPerPage)
                        .map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 h-8 w-8 bg-cyan-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-cyan-600" />
                              </div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.type === 'Admin' ? 'bg-purple-100 text-purple-800' :
                              user.type === 'Suporte' ? 'bg-orange-100 text-orange-800' :
                              'bg-cyan-100 text-teal-700'
                            }`}>
                              {user.type || 'Mobile'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.cellPhone || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.partner || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => {
                                const userData = [
                                  `Nome: ${user.name || '-'}`,
                                  `Email: ${user.email || '-'}`,
                                  `Tipo: ${user.type || 'Mobile'}`,
                                  `Celular: ${user.cellPhone || '-'}`,
                                  `Parceiro: ${user.partner || '-'}`,
                                  `Status: ${user.active ? 'Ativo' : 'Inativo'}`,
                                ].join('\n');
                                navigator.clipboard.writeText(userData);
                                toast.success('Dados do usuário copiados!');
                              }}
                              className="text-gray-600 hover:text-gray-900"
                              title="Copiar dados do usuário"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination for users */}
                {storeUsers.length > usersPerPage && (
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Mostrando {((usersPage - 1) * usersPerPage) + 1} a {Math.min(usersPage * usersPerPage, storeUsers.length)} de {storeUsers.length} usuários
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setUsersPage(prev => Math.max(1, prev - 1))}
                        disabled={usersPage === 1}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <span className="text-sm text-gray-600">
                        Página {usersPage} de {Math.ceil(storeUsers.length / usersPerPage)}
                      </span>
                      <button
                        onClick={() => setUsersPage(prev => Math.min(Math.ceil(storeUsers.length / usersPerPage), prev + 1))}
                        disabled={usersPage >= Math.ceil(storeUsers.length / usersPerPage)}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próxima
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Users className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Nenhum usuário conectado
                </h3>
                <p className="text-gray-500">
                  Esta loja não possui usuários vinculados
                </p>
              </div>
            )}

            {storeUsers.length > 0 && storeUsers.length <= usersPerPage && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Total: <span className="font-semibold">{storeUsers.length}</span> usuário{storeUsers.length !== 1 ? 's' : ''} conectado{storeUsers.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal CNPJ não encontrado */}
      {showCnpjNotFoundModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale-in">
            <div className="text-center">
              {/* Ícone */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              {/* Título */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                CNPJ não cadastrado
              </h3>

              {/* Mensagem */}
              <p className="text-gray-600 mb-2">
                O CNPJ informado não foi encontrado no sistema.
              </p>
              <p className="text-sm text-gray-500 mb-6 font-mono bg-gray-100 py-2 px-3 rounded-lg">
                {searchedCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')}
              </p>

              {/* Pergunta */}
              <p className="text-gray-700 font-medium mb-6">
                Deseja cadastrar uma nova loja com este CNPJ?
              </p>

              {/* Botões */}
              <div className="flex gap-3 justify-center">
                <button onClick={() => setShowCnpjNotFoundModal(false)} className="btn-secondary">
                  Não, cancelar
                </button>
                <button onClick={handleCreateWithCnpj} className="btn-primary">
                  Sim, cadastrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LojasPage;