import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ClientScenario } from '../types/client.types';

interface ClientState {
  selectedClient: ClientScenario | null;
  scenarios: ClientScenario[];
  selectedYear: number | null;
  isLoading: boolean;
  error: string | null;
}

interface ClientActions {
  setSelectedClient: (client: ClientScenario | null) => void;
  setScenarios: (scenarios: ClientScenario[]) => void;
  setSelectedYear: (year: number | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSelectedClient: () => void;
  updateClientScenario: (updatedScenario: ClientScenario) => void;
}

type ClientStore = ClientState & ClientActions;

export const useClientStore = create<ClientStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        selectedClient: null,
        scenarios: [],
        selectedYear: new Date().getFullYear(),
        isLoading: false,
        error: null,

        // Actions
        setSelectedClient: (client) => {
          set({ selectedClient: client }, false, 'setSelectedClient');
        },

        setScenarios: (scenarios) => {
          set({ scenarios }, false, 'setScenarios');
        },

        setSelectedYear: (year) => {
          set({ selectedYear: year }, false, 'setSelectedYear');
        },

        setLoading: (loading) => {
          set({ isLoading: loading }, false, 'setLoading');
        },

        setError: (error) => {
          set({ error }, false, 'setError');
        },

        clearSelectedClient: () => {
          set({ selectedClient: null }, false, 'clearSelectedClient');
        },

        updateClientScenario: (updatedScenario) => {
          const { scenarios, selectedClient } = get();
          const updatedScenarios = scenarios.map(scenario =>
            scenario.client.id === updatedScenario.client.id ? updatedScenario : scenario
          );
          
          set({
            scenarios: updatedScenarios,
            selectedClient: selectedClient?.client.id === updatedScenario.client.id ? updatedScenario : selectedClient
          }, false, 'updateClientScenario');
        },
      }),
      {
        name: 'client-store',
        partialize: (state) => ({
          selectedClient: state.selectedClient,
          scenarios: state.scenarios,
          selectedYear: state.selectedYear,
        }),
      }
    ),
    {
      name: 'client-store',
    }
  )
);

// Selectors
export const useSelectedClient = () => useClientStore(state => state.selectedClient);
export const useScenarios = () => useClientStore(state => state.scenarios);
export const useSelectedYear = () => useClientStore(state => state.selectedYear);
export const useClientLoading = () => useClientStore(state => state.isLoading);
export const useClientError = () => useClientStore(state => state.error); 