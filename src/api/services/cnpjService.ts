/**
 * CNPJ Service
 * Consulta dados de empresas na Receita Federal via BrasilAPI
 */

import axios from 'axios';

const BRASIL_API_URL = 'https://brasilapi.com.br/api/cnpj/v1';

export interface CNPJData {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  telefone: string;
  email: string;
  situacao_cadastral: string;
  data_situacao_cadastral: string;
  codigo_municipio: string;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  porte: string;
  natureza_juridica: string;
  capital_social: number;
  data_inicio_atividade: string;
}

export interface CNPJError {
  message: string;
  type: string;
  name: string;
}

/**
 * Consulta dados de CNPJ na Receita Federal via BrasilAPI
 * @param cnpj - CNPJ com ou sem formatação
 * @returns Dados da empresa ou null se não encontrado
 */
export async function consultarCNPJ(cnpj: string): Promise<CNPJData | null> {
  // Remove formatação do CNPJ
  const cnpjLimpo = cnpj.replace(/\D/g, '');

  if (cnpjLimpo.length !== 14) {
    throw new Error('CNPJ deve ter 14 dígitos');
  }

  try {
    const response = await axios.get<CNPJData>(`${BRASIL_API_URL}/${cnpjLimpo}`, {
      timeout: 15000, // 15 segundos timeout
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return null; // CNPJ não encontrado
      }
      if (error.response?.status === 400) {
        throw new Error('CNPJ inválido');
      }
      if (error.response?.status === 429) {
        throw new Error('Limite de consultas excedido. Aguarde alguns segundos.');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('Tempo limite excedido. Tente novamente.');
      }
    }
    throw new Error('Erro ao consultar CNPJ. Tente novamente.');
  }
}

/**
 * Mapeia UF para código do estado (usado nos selects)
 */
export const UF_TO_CODE: Record<string, string> = {
  'AC': '12', 'AL': '27', 'AP': '16', 'AM': '13', 'BA': '29',
  'CE': '23', 'DF': '53', 'ES': '32', 'GO': '52', 'MA': '21',
  'MT': '51', 'MS': '50', 'MG': '31', 'PA': '15', 'PB': '25',
  'PR': '41', 'PE': '26', 'PI': '22', 'RJ': '33', 'RN': '24',
  'RS': '43', 'RO': '11', 'RR': '14', 'SC': '42', 'SP': '35',
  'SE': '28', 'TO': '17',
};

/**
 * Mapeia UF para nome completo do estado (em MAIÚSCULAS para corresponder à API)
 */
export const UF_TO_NAME: Record<string, string> = {
  'AC': 'ACRE', 'AL': 'ALAGOAS', 'AP': 'AMAPÁ', 'AM': 'AMAZONAS',
  'BA': 'BAHIA', 'CE': 'CEARÁ', 'DF': 'DISTRITO FEDERAL', 'ES': 'ESPIRITO SANTO',
  'GO': 'GOIÁS', 'MA': 'MARANHÃO', 'MT': 'MATO GROSSO', 'MS': 'MATO GROSSO DO SUL',
  'MG': 'MINAS GERAIS', 'PA': 'PARÁ', 'PB': 'PARAÍBA', 'PR': 'PARANÁ',
  'PE': 'PERNAMBUCO', 'PI': 'PIAUÍ', 'RJ': 'RIO DE JANEIRO', 'RN': 'RIO GRANDE DO NORTE',
  'RS': 'RIO GRANDE DO SUL', 'RO': 'RONDÔNIA', 'RR': 'RORAIMA', 'SC': 'SANTA CATARINA',
  'SP': 'SÃO PAULO', 'SE': 'SERGIPE', 'TO': 'TOCANTINS',
};

/**
 * Mapeia porte da empresa para o formato do sistema
 */
export function mapPorte(porte: string): string {
  const porteMap: Record<string, string> = {
    'MEI': 'MEI',
    'ME': 'ME',
    'EPP': 'EPP',
    'PEQUENO': 'Pequeno',
    'MEDIO': 'Médio',
    'GRANDE': 'Grande',
    'DEMAIS': 'Outros',
  };

  const porteUpper = (porte || '').toUpperCase();
  return porteMap[porteUpper] || porte || '';
}

/**
 * Formata telefone para exibição
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}
