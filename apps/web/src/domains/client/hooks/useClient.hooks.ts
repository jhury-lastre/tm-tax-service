import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientService } from '../services/client.service';
import { ClientFilters, CreateClientRequest, UpdateClientRequest, ClientScenario } from '../types/client.types';
import { useClientStore } from '../store/client.store';

// Query Keys
export const clientQueryKeys = {
  all: ['clients'] as const,
  lists: () => [...clientQueryKeys.all, 'list'] as const,
  list: (filters: ClientFilters) => [...clientQueryKeys.lists(), { filters }] as const,
  details: () => [...clientQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientQueryKeys.details(), id] as const,
  scenarios: (year?: number) => [...clientQueryKeys.all, 'scenarios', { year }] as const,
  incomes: (clientId: string) => [...clientQueryKeys.all, 'incomes', clientId] as const,
  businesses: (clientId: string) => [...clientQueryKeys.all, 'businesses', clientId] as const,
};

// Hooks
export const useClients = (filters: ClientFilters = {}) => {
  return useQuery({
    queryKey: clientQueryKeys.list(filters),
    queryFn: () => ClientService.getAllClients(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useClient = (id: string) => {
  return useQuery({
    queryKey: clientQueryKeys.detail(id),
    queryFn: () => ClientService.getClientById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useClientScenarios = (year?: number) => {
  const { setScenarios, setLoading, setError } = useClientStore();

  return useQuery({
    queryKey: clientQueryKeys.scenarios(year),
    queryFn: async () => {
      setLoading(true);
      setError(null);
      try {
        const scenarios = await ClientService.getClientScenarios(year);
        setScenarios(scenarios);
        return scenarios;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch scenarios';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useClientIncomes = (clientId: string) => {
  return useQuery({
    queryKey: clientQueryKeys.incomes(clientId),
    queryFn: () => ClientService.getClientIncomes(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useClientBusinesses = (clientId: string) => {
  return useQuery({
    queryKey: clientQueryKeys.businesses(clientId),
    queryFn: () => ClientService.getClientBusinesses(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Mutations
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientRequest) => ClientService.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.scenarios() });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientRequest }) => 
      ClientService.updateClient(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.scenarios() });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ClientService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.scenarios() });
    },
  });
};

// Helper hook for refreshing scenario data
export const useRefreshScenarios = (year?: number) => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: clientQueryKeys.scenarios(year) });
  };
}; 