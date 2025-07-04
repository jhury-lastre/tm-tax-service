import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Client, ClientIncome, ClientBusiness } from '../types/client.types';
import { ClientService } from '../services/client.service';

interface DetailedClientData {
  client: Client;
  incomes: ClientIncome[];
  businesses: ClientBusiness[];
  totalIncome: number;
  totalBusinessRevenue: number;
  loadedAt: Date;
}

interface DetailedClientState {
  selectedClientData: DetailedClientData | null;
  isLoading: boolean;
  error: string | null;
}

interface DetailedClientActions {
  loadClientData: (clientId: string) => Promise<void>;
  clearClientData: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

type DetailedClientStore = DetailedClientState & DetailedClientActions;

export const useDetailedClientStore = create<DetailedClientStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      selectedClientData: null,
      isLoading: false,
      error: null,

      // Actions
      loadClientData: async (clientId: string) => {
        set({ isLoading: true, error: null }, false, 'loadClientData:start');
        
        try {
          // Fetch client details, incomes, and businesses in parallel
          const [clientResponse, incomesResponse, businessesResponse] = await Promise.allSettled([
            ClientService.getClientById(clientId),
            ClientService.getClientIncomes(clientId),
            ClientService.getClientBusinesses(clientId)
          ]);

          // Handle client data
          let client: Client;
          if (clientResponse.status === 'fulfilled') {
            client = Array.isArray(clientResponse.value.data) 
              ? clientResponse.value.data[0] 
              : clientResponse.value.data;
          } else {
            console.error('Failed to load client:', clientResponse.reason);
            throw new Error('Failed to load client data');
          }

          // Handle incomes data
          let incomes: ClientIncome[] = [];
          if (incomesResponse.status === 'fulfilled') {
            incomes = Array.isArray(incomesResponse.value.data) 
              ? incomesResponse.value.data 
              : incomesResponse.value.data ? [incomesResponse.value.data] : [];
          } else {
            console.warn('Failed to load incomes:', incomesResponse.reason);
          }

          // Handle businesses data
          let businesses: ClientBusiness[] = [];
          if (businessesResponse.status === 'fulfilled') {
            businesses = Array.isArray(businessesResponse.value.data) 
              ? businessesResponse.value.data 
              : businessesResponse.value.data ? [businessesResponse.value.data] : [];
          } else {
            console.warn('Failed to load businesses:', businessesResponse.reason);
          }

          // Calculate totals
          const totalIncome = incomes.reduce((sum, income) => sum + (income.amount || 0), 0);
          const totalBusinessRevenue = businesses.reduce((sum, business) => sum + (business.grossSales || 0), 0);

          const detailedClientData: DetailedClientData = {
            client,
            incomes,
            businesses,
            totalIncome,
            totalBusinessRevenue,
            loadedAt: new Date(),
          };

          set({ 
            selectedClientData: detailedClientData, 
            isLoading: false, 
            error: null 
          }, false, 'loadClientData:success');

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          set({ 
            selectedClientData: null, 
            isLoading: false, 
            error: errorMessage 
          }, false, 'loadClientData:error');
        }
      },

      clearClientData: () => {
        set({ 
          selectedClientData: null, 
          isLoading: false, 
          error: null 
        }, false, 'clearClientData');
      },

      setError: (error) => {
        set({ error }, false, 'setError');
      },

      setLoading: (loading) => {
        set({ isLoading: loading }, false, 'setLoading');
      },
    }),
    {
      name: 'detailed-client-store',
    }
  )
);

// Selectors
export const useDetailedClient = () => useDetailedClientStore(state => state.selectedClientData);
export const useDetailedClientLoading = () => useDetailedClientStore(state => state.isLoading);
export const useDetailedClientError = () => useDetailedClientStore(state => state.error);
export const useDetailedClientIncomes = () => useDetailedClientStore(state => state.selectedClientData?.incomes || []);
export const useDetailedClientBusinesses = () => useDetailedClientStore(state => state.selectedClientData?.businesses || []); 