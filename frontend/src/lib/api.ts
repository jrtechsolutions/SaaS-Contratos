/**
 * Cliente HTTP para comunicação com a API
 */

// Garantir que a URL sempre termine com /api
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    return 'http://localhost:3001/api';
  }
  
  // Se já termina com /api, usar como está
  if (envUrl.endsWith('/api')) {
    return envUrl;
  }
  
  // Se termina com /, adicionar api
  if (envUrl.endsWith('/')) {
    return `${envUrl}api`;
  }
  
  // Caso contrário, adicionar /api
  return `${envUrl}/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Log para debug (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('🔧 API Base URL:', API_BASE_URL);
  console.log('🔧 VITE_API_URL (env):', import.meta.env.VITE_API_URL);
}

export interface ApiError {
  error: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Erro ${response.status}: ${response.statusText}`;
      
      try {
        const error: ApiError = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch {
        // Se não conseguir parsear JSON, usar mensagem padrão
      }
      
      throw new Error(errorMessage);
    }

    // Se a resposta estiver vazia (204 No Content), retornar null
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);

// Tipos para as entidades
export interface Proposta {
  id: string;
  cliente_nome: string;
  cliente_email: string;
  cliente_telefone?: string;
  cliente_empresa?: string;
  cliente_cnpj?: string;
  servicos: string[];
  servico_personalizado?: string;
  valor_total: number;
  condicoes_pagamento?: string;
  prazo_execucao?: string;
  data_inicio?: string;
  data_entrega?: string;
  observacoes?: string;
  status: 'rascunho' | 'enviada' | 'aceita' | 'cancelada';
  modelo_contrato_id?: string;
  created_at: string;
  updated_at: string;
  modelo_contrato?: {
    id: string;
    nome: string;
  };
}

export interface ModeloContrato {
  id: string;
  nome: string;
  template_texto: string;
  variaveis: Array<{ key: string; label: string }>;
  created_at: string;
  updated_at: string;
}

export interface Contrato {
  id: string;
  proposta_id: string;
  texto_contrato: string;
  status: 'enviado' | 'visualizado' | 'assinado';
  assinatura_cliente?: string;
  data_assinatura?: string;
  created_at: string;
  updated_at: string;
  proposta?: {
    id: string;
    cliente_nome: string;
    cliente_email: string;
    valor_total: number;
    status: string;
  };
}

export interface DashboardStats {
  totalPropostas: number;
  propostasPendentes: number;
  contratosEnviados: number;
  contratosAssinados: number;
  recentProposals: Proposta[];
}

// Tipos para rotas públicas (sem autenticação)
export interface PropostaPublica {
  id: string;
  cliente_nome: string;
  cliente_email: string;
  cliente_empresa?: string;
  servicos: string[];
  servico_personalizado?: string;
  valor_total: number;
  condicoes_pagamento?: string;
  prazo_execucao?: string;
  data_inicio?: string;
  data_entrega?: string;
  status: string;
  created_at: string;
}

export interface ContratoPublico {
  id: string;
  texto_contrato: string;
  status: 'enviado' | 'visualizado' | 'assinado';
  data_assinatura?: string;
  created_at: string;
  proposta?: {
    id: string;
    cliente_nome: string;
    cliente_email: string;
    cliente_empresa?: string;
    cliente_cnpj?: string;
    valor_total: number;
    prazo_execucao?: string;
    data_inicio?: string;
    data_entrega?: string;
  };
}

// Cliente API para rotas públicas (sem autenticação)
class PublicApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Erro ${response.status}: ${response.statusText}`;
      
      try {
        const error: ApiError = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch {
        // Se não conseguir parsear JSON, usar mensagem padrão
      }
      
      throw new Error(errorMessage);
    }

    // Se a resposta estiver vazia (204 No Content), retornar null
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async getBlob(endpoint: string): Promise<Blob> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      let errorMessage = `Erro ${response.status}: ${response.statusText}`;
      try {
        const error: ApiError = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch {
        // Se não conseguir parsear JSON, usar mensagem padrão
      }
      throw new Error(errorMessage);
    }

    return response.blob();
  }
}

export const publicApi = new PublicApiClient(API_BASE_URL);

