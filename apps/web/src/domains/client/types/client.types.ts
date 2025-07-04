export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: Date | null;
  deletedBy: string | null;
  incomes?: ClientIncome[];
  businesses?: ClientBusiness[];
}

export interface ClientIncome {
  id: number;
  clientId: string;
  taxPayer: string | null;
  payer: string | null;
  incomeType: string;
  amount: number;
  year: number;
  isExtracted: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: Date | null;
  deletedBy: string | null;
}

export interface ClientBusiness {
  id: string;
  clientId: string;
  name: string | null;
  filingType: string | null;
  ownership: number | null;
  employees: number | null;
  benefits: BenefitItem[];
  grossSales: number | null;
  industry: string | null;
  k1: number | null;
  netSales: number | null;
  projectedSales: number | null;
  w2: number | null;
  year: number | null;
  entities: EntityItem[];
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string | null;
  deletedAt: Date | null;
  deletedBy: string | null;
}

export interface BenefitItem {
  id: string;
  name: string;
  value: boolean;
}

export interface EntityItem {
  id: string;
  name: string;
  value: boolean;
}

export interface CreateClientRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateClientRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface ClientFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ClientResponse {
  success: boolean;
  message: string;
  data: Client | Client[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ClientScenario {
  client: Client;
  totalIncome: number;
  totalBusinessRevenue: number;
  businessCount: number;
  incomeCount: number;
  currentYear: number;
} 