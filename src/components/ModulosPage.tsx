/**
 * Módulos Page Component
 * Displays available system modules and their status
 */

import React, { useState, useEffect } from 'react';
import {
  Package,
  BarChart3,
  Tag,
  MessageSquare,
  Clock,
  ScanLine,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageHeader } from '@/components/common';
import * as modulesService from '@/api/services/modulesService';
import { ModulesData } from '@/api/services/modulesService';

interface Module {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  active: boolean;
  features: string[];
  activeCount?: number;
  totalStores?: number;
}

const modules: Module[] = [
  {
    id: 'margem',
    name: 'MARGEM',
    description: 'Sistema principal de gestao de margens de lucro. Processa relatórios e fornece analises de vendas em tempo real.',
    icon: BarChart3,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    active: true,
    features: [
      'Dashboard de vendas',
      'Analise de margens',
      'Relatórios por periodo',
      'Comparativo de lojas'
    ]
  },
  {
    id: 'offerta',
    name: 'OFFERTA',
    description: 'Gerenciamento de ofertas e promocoes. Controle de precos e campanhas promocionais.',
    icon: Tag,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    active: true,
    features: [
      'Cadastro de ofertas',
      'Controle de validade',
      'Promocoes automaticas',
      'Integracao com PDV'
    ]
  },
  {
    id: 'oppinar',
    name: 'OPPINAR',
    description: 'Sistema de NPS e feedback. Coleta avaliações de clientes via QR Code.',
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    active: true,
    features: [
      'QR Codes personalizados',
      'Pesquisas NPS',
      'Dashboard de satisfacao',
      'Alertas de feedback negativo'
    ]
  },
  {
    id: 'prazzo',
    name: 'PRAZZO',
    description: 'Controle de validade de produtos. Alertas de vencimento e gestao de estoques.',
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    active: true,
    features: [
      'Alertas de vencimento',
      'Gestao de lotes',
      'Relatórios de perdas',
      'Sugestoes de promocao'
    ]
  },
  {
    id: 'scanner',
    name: 'BASIC (Scanner)',
    description: 'Leitor de codigo de barras integrado. Conferencia de precos e etiquetas.',
    icon: ScanLine,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    active: true,
    features: [
      'Leitura de codigos',
      'Conferencia de precos',
      'Verificacao de etiquetas',
      'Integracao com ERP'
    ]
  }
];

export const MódulosPage: React.FC = () => {
  const [modulesData, setModulesData] = useState<ModulesData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load modules data on mount
  useEffect(() => {
    loadModulesData();
  }, []);

  const loadModulesData = async () => {
    try {
      setLoading(true);
      const data = await modulesService.getModulesStats();
      setModulesData(data);
    } catch (error) {
      toast.error('Erro ao carregar dados dos módulos');
    } finally {
      setLoading(false);
    }
  };

  // Merge static module definitions with dynamic data
  const getModulesWithStats = (): Module[] => {
    if (!modulesData) return modules;

    return modules.map(module => {
      const stats = modulesData.modules.find(m => m.id === module.id);
      return {
        ...module,
        activeCount: stats?.activeCount || 0,
        totalStores: stats?.totalStores || 0,
        active: (stats?.activeCount || 0) > 0
      };
    });
  };

  const modulesWithStats = getModulesWithStats();

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Módulos"
        description={loading ? 'Carregando...' : `${modulesWithStats.filter(m => m.active).length} módulos ativos de ${modulesWithStats.length} disponíveis`}
      />

      <main className="p-4 md:p-6 space-y-6">

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-cyan-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Carregando dados dos módulos...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modulesWithStats.map((module) => {
                const Icon = module.icon;
                return (
              <div key={module.id} className="card overflow-hidden card-hover">
                {/* Module Header */}
                <div className={`p-4 ${module.bgColor} border-b`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-white rounded-lg shadow-sm`}>
                        <Icon className={`w-6 h-6 ${module.color}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{module.name}</h3>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      module.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {module.active ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          {module.activeCount} {module.activeCount === 1 ? 'loja ativa' : 'lojas ativas'}
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          Inativo
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Module Content */}
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-4">
                    {module.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Funcionalidades
                    </p>
                    <ul className="space-y-1">
                      {module.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Module Footer */}
                <div className="px-4 py-3 bg-gray-50 border-t">
                  <button
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      // Future: navigate to module settings
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver Configuracoes
                  </button>
                </div>
              </div>
            );
              })}
            </div>

            {/* Info Section */}
            <div className="card p-6 border-l-4 border-cyan-500">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Package className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Sobre os Módulos</h3>
                  <p className="text-sm text-gray-600">
                    Os módulos são funcionalidades adicionais que podem ser ativadas para cada loja.
                    Para ativar ou desativar módulos em uma loja específica, acesse o cadastro da loja
                    na página de Gerenciamento de Lojas.
                  </p>
                </div>
              </div>
            </div>

            {/* Timestamp Footer */}
            {modulesData && (
              <div className="mt-6 text-center text-sm text-gray-500">
                Dados atualizados em: {modulesData.date}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default MódulosPage;
