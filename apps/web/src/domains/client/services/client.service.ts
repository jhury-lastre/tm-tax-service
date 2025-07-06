import { Client, ClientFilters, ClientResponse, CreateClientRequest, UpdateClientRequest, ClientScenario, ClientIncome, ClientBusiness } from '../types/client.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ClientService {
  private static async fetchWithErrorHandling<T>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  static async getAllClients(filters: ClientFilters = {}): Promise<ClientResponse> {
    const searchParams = new URLSearchParams();
    
    if (filters.search) searchParams.append('search', filters.search);
    if (filters.page) searchParams.append('page', filters.page.toString());
    if (filters.limit) searchParams.append('limit', filters.limit.toString());
    if (filters.sortBy) searchParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) searchParams.append('sortOrder', filters.sortOrder);

    const url = `${API_BASE_URL}/clients?${searchParams.toString()}`;
    return this.fetchWithErrorHandling<ClientResponse>(url);
  }

  static async getClientById(id: string): Promise<ClientResponse> {
    const url = `${API_BASE_URL}/clients/${id}`;
    return this.fetchWithErrorHandling<ClientResponse>(url);
  }

  static async createClient(data: CreateClientRequest): Promise<Client> {
    const url = `${API_BASE_URL}/clients`;
    return this.fetchWithErrorHandling<Client>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateClient(id: string, data: UpdateClientRequest): Promise<ClientResponse> {
    const url = `${API_BASE_URL}/clients/${id}`;
    return this.fetchWithErrorHandling<ClientResponse>(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async deleteClient(id: string): Promise<ClientResponse> {
    const url = `${API_BASE_URL}/clients/${id}`;
    return this.fetchWithErrorHandling<ClientResponse>(url, {
      method: 'DELETE',
    });
  }

  static async getClientIncomes(clientId: string): Promise<any> {
    const url = `${API_BASE_URL}/client-income/client/${clientId}`;
    return this.fetchWithErrorHandling(url);
  }

  static async getClientBusinesses(clientId: string): Promise<any> {
    const url = `${API_BASE_URL}/client-businesses/client/${clientId}`;
    return this.fetchWithErrorHandling(url);
  }

  static async createClientIncome(data: {
    clientId: string;
    incomeType: string;
    amount: number;
    year: number;
    payer?: string;
    taxPayer?: string;
  }): Promise<ClientIncome> {
    const url = `${API_BASE_URL}/client-income`;
    return this.fetchWithErrorHandling<ClientIncome>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async createClientBusiness(data: {
    clientId: string;
    name?: string;
    filingType?: string;
    w2?: number;
    k1?: number;
    grossSales?: number;
    year?: number;
    industry?: string;
    ownership?: number;
    employees?: number;
  }): Promise<{ success: boolean; message: string; data: ClientBusiness }> {
    const url = `${API_BASE_URL}/client-businesses`;
    return this.fetchWithErrorHandling<{ success: boolean; message: string; data: ClientBusiness }>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getClientScenarios(year?: number): Promise<ClientScenario[]> {
    try {
      // Call the direct /clients endpoint which returns embedded income data
      const response = await this.fetchWithErrorHandling<any>(`${API_BASE_URL}/clients`);
      console.log('Raw clients response:', response);
      
      // The response is an array of clients with embedded income data
      const clients: any[] = Array.isArray(response) ? response : [];
      
      if (clients.length === 0) {
        console.warn('No clients found');
        return [];
      }

      console.log(`Found ${clients.length} clients with embedded income data`);

      // Process each client and calculate totals using embedded income data
      const scenarios: ClientScenario[] = await Promise.all(
        clients.map(async (client) => {
          try {
            console.log(`Processing client: ${client.firstName} ${client.lastName} (ID: ${client.id})`);
            
            // Use embedded income data from the clients response
            const allIncomes = Array.isArray(client.incomes) ? client.incomes : [];
            
            // Filter incomes by year if specified
            const incomes = year 
              ? allIncomes.filter((income: any) => income.year === year.toString())
              : allIncomes;
              
            console.log(`Client ${client.id} - ${year ? `Year ${year} ` : ''}incomes:`, incomes.length, 'of', allIncomes.length);
            
            // Calculate W2 and K1 income from income records
            const w2Income = incomes.filter((income: any) => 
              income.incomeType?.toLowerCase().includes('w2') || 
              income.incomeType?.toLowerCase().includes('wages')
            ).reduce((sum: number, income: any) => {
              const amount = parseFloat(income?.amount || 0);
              return sum + (isNaN(amount) ? 0 : amount);
            }, 0);

            const k1Income = incomes.filter((income: any) => 
              income.incomeType?.toLowerCase().includes('k1') || 
              income.incomeType?.toLowerCase().includes('k-1')
            ).reduce((sum: number, income: any) => {
              const amount = parseFloat(income?.amount || 0);
              return sum + (isNaN(amount) ? 0 : amount);
            }, 0);

            const otherIncome = incomes.filter((income: any) => 
              !income.incomeType?.toLowerCase().includes('w2') && 
              !income.incomeType?.toLowerCase().includes('wages') &&
              !income.incomeType?.toLowerCase().includes('k1') &&
              !income.incomeType?.toLowerCase().includes('k-1')
            ).reduce((sum: number, income: any) => {
              const amount = parseFloat(income?.amount || 0);
              return sum + (isNaN(amount) ? 0 : amount);
            }, 0);

            // Calculate correct total income as sum of all income types
            const totalIncome = w2Income + k1Income + otherIncome;

            // Calculate business revenue as W2 + K1 from income records
            const totalBusinessRevenue = w2Income + k1Income;

            // Fetch business data separately (not embedded in clients response) for business count
            let businesses: any[] = [];
            
            try {
              const businessesResponse = await this.getClientBusinesses(client.id);
              const allBusinesses = Array.isArray(businessesResponse?.data) ? businessesResponse.data : [];
              
              // Filter businesses by year if specified
              businesses = year 
                ? allBusinesses.filter((business: any) => business.year === year.toString())
                : allBusinesses;
              
              console.log(`Client ${client.id} - ${year ? `Year ${year} ` : ''}businesses:`, businesses.length, 'of', allBusinesses.length);
            } catch (error) {
              console.error(`Failed to fetch businesses for client ${client.id}:`, error);
            }

            // Attach business data to client object so it's available in scenarios component
            const enrichedClient = {
              ...client,
              businesses: businesses
            };

            const scenario = {
              client: enrichedClient,
              totalIncome,
              totalBusinessRevenue,
              businessCount: businesses.length,
              incomeCount: incomes.length,
              currentYear: new Date().getFullYear(),
            };

            console.log(`Final scenario for client ${client.id}:`, {
              name: `${client.firstName} ${client.lastName}`,
              incomeCount: scenario.incomeCount,
              totalIncome: scenario.totalIncome,
              businessCount: scenario.businessCount,
              totalBusinessRevenue: scenario.totalBusinessRevenue
            });
            
            return scenario;
          } catch (error) {
            console.error(`Error processing client ${client?.id || 'unknown'}:`, error);
            return {
              client,
              totalIncome: 0,
              totalBusinessRevenue: 0,
              businessCount: 0,
              incomeCount: 0,
              currentYear: new Date().getFullYear(),
            };
          }
        })
      );

      console.log(`Successfully processed ${scenarios.length} client scenarios`);
      return scenarios;
    } catch (error) {
      console.error('Error in getClientScenarios:', error);
      throw new Error(`Failed to fetch client scenarios: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Test function to verify API connectivity
  static async testApiConnections(): Promise<void> {
    console.log('🧪 Testing API connections...');
    console.log(`API Base URL: ${API_BASE_URL}`);
    
    try {
      // Test main endpoints
      const endpoints = [
        `${API_BASE_URL}/clients`,
        `${API_BASE_URL}/client-income`,
        `${API_BASE_URL}/client-businesses`,
        `${API_BASE_URL}/client-income/types`,
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`Testing: ${endpoint}`);
          const response = await fetch(endpoint);
          console.log(`✅ ${endpoint} - Status: ${response.status}`);
          if (response.ok) {
            const data = await response.json();
            console.log(`   Data preview:`, data);
          }
        } catch (error) {
          console.error(`❌ ${endpoint} - Error:`, error);
        }
      }
    } catch (error) {
      console.error('API test failed:', error);
    }
  }
} 