/**
 * Hooks customizados para chamadas à API usando React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Proposta, ModeloContrato, Contrato, DashboardStats } from '@/lib/api';
import { toast } from 'sonner';

// Query Keys
export const queryKeys = {
  propostas: ['propostas'] as const,
  proposta: (id: string) => ['propostas', id] as const,
  modelos: ['modelos'] as const,
  modelo: (id: string) => ['modelos', id] as const,
  contratos: ['contratos'] as const,
  contrato: (id: string) => ['contratos', id] as const,
  dashboard: ['dashboard'] as const,
  configuracoes: ['configuracoes'] as const,
};

// Interface para configurações da empresa
export interface ConfiguracoesEmpresa {
  id: string;
  razao_social: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade?: string;
  logo_url?: string;
  texto_complementar?: string;
  created_at: string;
  updated_at: string;
}

// ========== PROPOSTAS ==========

export function usePropostas(status?: string, search?: string) {
  return useQuery({
    queryKey: [...queryKeys.propostas, status, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (search) params.append('search', search);
      const query = params.toString();
      return api.get<Proposta[]>(`/propostas${query ? `?${query}` : ''}`);
    },
  });
}

export function useProposta(id: string) {
  return useQuery({
    queryKey: queryKeys.proposta(id),
    queryFn: () => api.get<Proposta>(`/propostas/${id}`),
    enabled: !!id,
  });
}

export function useCreateProposta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Proposta>) => api.post<Proposta>('/propostas', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.propostas });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Proposta criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar proposta');
    },
  });
}

export function useUpdateProposta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Proposta> }) =>
      api.put<Proposta>(`/propostas/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.propostas });
      queryClient.invalidateQueries({ queryKey: queryKeys.proposta(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Proposta atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar proposta');
    },
  });
}

export function useDeleteProposta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/propostas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.propostas });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Proposta excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao excluir proposta');
    },
  });
}

// ========== MODELOS ==========

export function useModelos() {
  return useQuery({
    queryKey: queryKeys.modelos,
    queryFn: () => api.get<ModeloContrato[]>('/modelos'),
  });
}

export function useModelo(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.modelo(id),
    queryFn: () => api.get<ModeloContrato>(`/modelos/${id}`),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useCreateModelo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ModeloContrato>) => api.post<ModeloContrato>('/modelos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.modelos });
      toast.success('Modelo criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar modelo');
    },
  });
}

export function useUpdateModelo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ModeloContrato> }) =>
      api.put<ModeloContrato>(`/modelos/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.modelos });
      queryClient.invalidateQueries({ queryKey: queryKeys.modelo(variables.id) });
      toast.success('Modelo atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar modelo');
    },
  });
}

export function useDeleteModelo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/modelos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.modelos });
      toast.success('Modelo excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao excluir modelo');
    },
  });
}

// ========== CONTRATOS ==========

export function useContratos(status?: string, search?: string) {
  return useQuery({
    queryKey: [...queryKeys.contratos, status, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (search) params.append('search', search);
      const query = params.toString();
      return api.get<Contrato[]>(`/contratos${query ? `?${query}` : ''}`);
    },
  });
}

export function useContrato(id: string) {
  return useQuery({
    queryKey: queryKeys.contrato(id),
    queryFn: () => api.get<Contrato>(`/contratos/${id}`),
    enabled: !!id,
  });
}

// ========== DASHBOARD ==========

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      // Buscar propostas e contratos em paralelo
      const [propostas, contratos] = await Promise.all([
        api.get<Proposta[]>('/propostas'),
        api.get<Contrato[]>('/contratos'),
      ]);

      // Calcular estatísticas
      const totalPropostas = propostas.length;
      const propostasPendentes = propostas.filter(
        (p) => p.status === 'enviada'
      ).length;
      const contratosEnviados = contratos.length;
      const contratosAssinados = contratos.filter(
        (c) => c.status === 'assinado'
      ).length;

      // Propostas recentes (últimas 4)
      const recentProposals = propostas
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 4);

      return {
        totalPropostas,
        propostasPendentes,
        contratosEnviados,
        contratosAssinados,
        recentProposals,
      } as DashboardStats;
    },
  });
}

// ========== AUTENTICAÇÃO ==========

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      api.post<{ token: string; user: { id: string; email: string; full_name: string } }>(
        '/auth/login',
        credentials
      ),
    onSuccess: async (data) => {
      const { auth } = await import('@/lib/auth');
      auth.setAuth(data.token, data.user);
      queryClient.invalidateQueries();
      toast.success('Login realizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao fazer login');
    },
  });
}

