'use client';

import { useState, useMemo } from 'react';
import { Search, Users, DollarSign, Building, ChevronRight, Loader2, AlertCircle, RefreshCw, User, Plus, FileText, X } from 'lucide-react';
import { useClientScenarios, useRefreshScenarios } from '../domains/client/hooks/useClient.hooks';
import { useClientStore, useSelectedClient, useSelectedYear } from '../domains/client/store/client.store';
import { useDetailedClientStore } from '../domains/client/store/detailed-client.store';
import { ClientScenario } from '../domains/client/types/client.types';
import { ClientService } from '../domains/client/services/client.service';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';

// Enhanced scenario with income breakdown
interface EnhancedClientScenario extends ClientScenario {
  incomeBreakdown: {
    w2: number;
    k1: number;
    other: number;
  };
  businessFilingTypes: string[];
}

// Custom scenario form data
interface CustomScenarioData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  incomes: Array<{
    type: string;
    amount: number;
  }>;
  businesses: Array<{
    name: string;
    filingType: string;
    w2: number;
    k1: number;
  }>;
  year: number;
}

export function Scenarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'income' | 'business'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showCustomScenario, setShowCustomScenario] = useState(false);
  const [customScenarioData, setCustomScenarioData] = useState<CustomScenarioData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    incomes: [{ type: 'W2', amount: 0 }],
    businesses: [{ name: '', filingType: '', w2: 0, k1: 0 }],
    year: new Date().getFullYear()
  });

  const selectedYear = useSelectedYear();
  const { setSelectedClient, setSelectedYear } = useClientStore();
  const { loadClientData } = useDetailedClientStore();
  const selectedClient = useSelectedClient();
  const { data: scenarios, isLoading, isError, error } = useClientScenarios(selectedYear || undefined);
  const refreshScenarios = useRefreshScenarios(selectedYear || undefined);

  // Generate available years (current year and previous 4 years)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Filing types for businesses - matching database values
  const filingTypes = [
    { value: 'llc', label: 'LLC' },
    { value: 's_corp', label: 'S-Corp' },
    { value: 'c_corp', label: 'C-Corp' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'sole_proprietorships', label: 'Sole Proprietorship' },
    { value: 'schedule_c', label: 'Schedule C' }
  ];

  // Enhanced scenario processing with income breakdown
  const enhancedScenarios = useMemo(() => {
    if (!scenarios || !Array.isArray(scenarios)) return [];

    const enhanced = scenarios.map(scenario => {
      // Calculate income breakdown from both income records and business records
      const w2IncomeFromRecords = scenario.client.incomes?.filter(income => 
        income.incomeType?.toLowerCase().includes('w2') || 
        income.incomeType?.toLowerCase().includes('wages')
      ).reduce((sum, income) => sum + income.amount, 0) || 0;

      const k1IncomeFromRecords = scenario.client.incomes?.filter(income => 
        income.incomeType?.toLowerCase().includes('k1') || 
        income.incomeType?.toLowerCase().includes('k-1')
      ).reduce((sum, income) => sum + income.amount, 0) || 0;

      const otherIncome = scenario.client.incomes?.filter(income => 
        !income.incomeType?.toLowerCase().includes('w2') && 
        !income.incomeType?.toLowerCase().includes('wages') &&
        !income.incomeType?.toLowerCase().includes('k1') &&
        !income.incomeType?.toLowerCase().includes('k-1')
      ).reduce((sum, income) => sum + income.amount, 0) || 0;

      // Add business W2 and K1 income
      const w2IncomeFromBusiness = scenario.client.businesses?.reduce((sum, business) => 
        sum + (business.w2 || 0), 0) || 0;

      const k1IncomeFromBusiness = scenario.client.businesses?.reduce((sum, business) => 
        sum + (business.k1 || 0), 0) || 0;

      // Combine income from both sources
      const w2Income = w2IncomeFromRecords + w2IncomeFromBusiness;
      const k1Income = k1IncomeFromRecords + k1IncomeFromBusiness;

      // Get business filing types
      const businessFilingTypes = scenario.client.businesses?.map(business => {
        const filingType = business.filingType || 'unknown';
        const typeMapping = filingTypes.find(type => type.value === filingType);
        return typeMapping ? typeMapping.label : filingType;
      }).filter(Boolean) || [];

      // Calculate business revenue as W2 + K1 from income breakdown
      const businessRevenue = w2Income + k1Income;
      
      // Calculate correct total income as sum of all income types
      const correctedTotalIncome = w2Income + k1Income + otherIncome;

      return {
        ...scenario,
        totalIncome: correctedTotalIncome, // Override with correct calculation
        totalBusinessRevenue: businessRevenue,
        incomeBreakdown: {
          w2: w2Income,
          k1: k1Income,
          other: otherIncome
        },
        businessFilingTypes: [...new Set(businessFilingTypes)] // Remove duplicates
      };
    });

    return enhanced;
  }, [scenarios]);

  const filteredAndSortedScenarios = useMemo(() => {
    if (!enhancedScenarios || !Array.isArray(enhancedScenarios)) return [];

    let filtered = enhancedScenarios.filter(scenario => {
      // Validate scenario structure
      if (!scenario || !scenario.client || !scenario.client.firstName || !scenario.client.lastName) {
        console.warn('Invalid scenario structure:', scenario);
        return false;
      }

      const clientName = `${scenario.client.firstName} ${scenario.client.lastName}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      return clientName.includes(searchLower) || 
             scenario.client.email?.toLowerCase().includes(searchLower) ||
             scenario.client.phone?.toLowerCase().includes(searchLower);
    });

    return filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = `${a.client.firstName} ${a.client.lastName}`;
          bValue = `${b.client.firstName} ${b.client.lastName}`;
          break;
        case 'income':
          aValue = a.totalIncome;
          bValue = b.totalIncome;
          break;
        case 'business':
          aValue = a.totalBusinessRevenue;
          bValue = b.totalBusinessRevenue;
          break;
        default:
          aValue = `${a.client.firstName} ${a.client.lastName}`;
          bValue = `${b.client.firstName} ${b.client.lastName}`;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });
  }, [enhancedScenarios, searchTerm, sortBy, sortOrder]);

  const handleClientSelect = async (scenario: EnhancedClientScenario) => {
    setSelectedClient(scenario);
    // Load detailed client data only for real clients (not custom scenarios)
    if (scenario.client.id && !scenario.client.id.startsWith('custom-')) {
      await loadClientData(scenario.client.id);
    }
  };

  const handleAddCustomScenario = async () => {
    if (!customScenarioData.firstName.trim() || !customScenarioData.lastName.trim()) {
      return;
    }

    try {
      // Create the client first
      const clientResponse = await ClientService.createClient({
        firstName: customScenarioData.firstName,
        lastName: customScenarioData.lastName,
        email: customScenarioData.email || undefined,
        phone: customScenarioData.phone || undefined,
      });

      if (!clientResponse) {
        throw new Error('Failed to create client - no response returned');
      }

      // The API returns the client object directly
      const clientId = clientResponse.id;
        
      if (!clientId) {
        throw new Error('Failed to get client ID from response');
      }

      // Create income records
      const incomePromises = customScenarioData.incomes
        .filter(income => income.amount > 0)
        .map(income => ClientService.createClientIncome({
          clientId,
          incomeType: income.type.toLowerCase().replace(' ', '_'),
          amount: income.amount,
          year: customScenarioData.year,
          payer: income.type === 'W2' ? 'Custom Employer' : 'Custom Source',
          taxPayer: `${customScenarioData.firstName} ${customScenarioData.lastName}`,
        }));

      // Create business records
      const businessPromises = customScenarioData.businesses
        .filter(business => business.name.trim() || business.w2 > 0 || business.k1 > 0)
        .map(business => ClientService.createClientBusiness({
          clientId,
          name: business.name || 'Custom Business',
          filingType: business.filingType && business.filingType.trim() ? business.filingType : undefined,
          w2: business.w2 || 0,
          k1: business.k1 || 0,
          grossSales: business.w2 + business.k1,
          year: customScenarioData.year,
          industry: 'Custom',
        }));

      // Wait for all records to be created
      await Promise.all([...incomePromises, ...businessPromises]);

      // Refresh the scenarios list to show the new data
      refreshScenarios();

      // Reset the form
      setShowCustomScenario(false);
      setCustomScenarioData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        incomes: [{ type: 'W2', amount: 0 }],
        businesses: [{ name: '', filingType: '', w2: 0, k1: 0 }],
        year: new Date().getFullYear()
      });

    } catch (error) {
      console.error('Error creating custom scenario:', error);
      // You might want to show an error message to the user here
    }
  };

  // Custom scenarios are now saved to the database, so we don't need local removal
  // If deletion is needed, it should be done through the API

  const formatCurrency = (amount: number) => {
    if (amount === 0) return '$0';
    
    // Format large numbers with K, M, B suffixes
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-lg text-muted-foreground">Loading client scenarios...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Scenarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'Failed to load client scenarios'}
            </p>
            <Button onClick={refreshScenarios} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Client Scenarios
              {selectedYear && (
                <Badge variant="secondary" className="ml-3 text-sm">
                  {selectedYear}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Explore and manage client tax scenarios with comprehensive income breakdown and business filing analysis
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showCustomScenario} onOpenChange={setShowCustomScenario}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Custom Scenario</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={customScenarioData.firstName}
                        onChange={(e) => setCustomScenarioData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={customScenarioData.lastName}
                        onChange={(e) => setCustomScenarioData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customScenarioData.email}
                        onChange={(e) => setCustomScenarioData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={customScenarioData.phone}
                        onChange={(e) => setCustomScenarioData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone"
                      />
                    </div>
                  </div>
                                    <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Income Sources</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCustomScenarioData(prev => ({
                              ...prev,
                              incomes: [...prev.incomes, { type: 'Other', amount: 0 }]
                            }));
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Income
                        </Button>
                      </div>
                      {customScenarioData.incomes.map((income, index) => (
                        <div key={index} className="grid grid-cols-3 gap-2">
                          <select
                            value={income?.type || ''}
                            onChange={(e) => {
                              const newIncomes = [...customScenarioData.incomes];
                              if (newIncomes[index]) {
                                newIncomes[index].type = e.target.value;
                                setCustomScenarioData(prev => ({ ...prev, incomes: newIncomes }));
                              }
                            }}
                            className="px-3 py-2 border rounded-md text-sm bg-background"
                          >
                            <option value="W2">W2 Wages</option>
                            <option value="K1">K1 Income</option>
                            <option value="1099">1099 Income</option>
                            <option value="Interest">Interest</option>
                            <option value="Dividends">Dividends</option>
                            <option value="Capital Gains">Capital Gains</option>
                            <option value="Rental">Rental Income</option>
                            <option value="Other">Other Income</option>
                          </select>
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={income?.amount || 0}
                            onChange={(e) => {
                              const newIncomes = [...customScenarioData.incomes];
                              if (newIncomes[index]) {
                                newIncomes[index].amount = Number(e.target.value) || 0;
                                setCustomScenarioData(prev => ({ ...prev, incomes: newIncomes }));
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newIncomes = customScenarioData.incomes.filter((_, i) => i !== index);
                              setCustomScenarioData(prev => ({ ...prev, incomes: newIncomes }));
                            }}
                            disabled={customScenarioData.incomes.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Business Entities</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCustomScenarioData(prev => ({
                              ...prev,
                              businesses: [...prev.businesses, { name: '', filingType: '', w2: 0, k1: 0 }]
                            }));
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Business
                        </Button>
                      </div>
                      {customScenarioData.businesses.map((business, index) => (
                        <div key={index} className="space-y-2 p-3 border rounded-md">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Business {index + 1}</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newBusinesses = customScenarioData.businesses.filter((_, i) => i !== index);
                                setCustomScenarioData(prev => ({ ...prev, businesses: newBusinesses }));
                              }}
                              disabled={customScenarioData.businesses.length === 1}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Business Name"
                              value={business?.name || ''}
                              onChange={(e) => {
                                const newBusinesses = [...customScenarioData.businesses];
                                if (newBusinesses[index]) {
                                  newBusinesses[index].name = e.target.value;
                                  setCustomScenarioData(prev => ({ ...prev, businesses: newBusinesses }));
                                }
                              }}
                            />
                            <select
                              value={business?.filingType || ''}
                              onChange={(e) => {
                                const newBusinesses = [...customScenarioData.businesses];
                                if (newBusinesses[index]) {
                                  newBusinesses[index].filingType = e.target.value;
                                  setCustomScenarioData(prev => ({ ...prev, businesses: newBusinesses }));
                                }
                              }}
                              className="px-3 py-2 border rounded-md text-sm bg-background"
                            >
                              <option value="">Select filing type</option>
                              {filingTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">W2 Income</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={business?.w2 || 0}
                                onChange={(e) => {
                                  const newBusinesses = [...customScenarioData.businesses];
                                  if (newBusinesses[index]) {
                                    newBusinesses[index].w2 = Number(e.target.value) || 0;
                                    setCustomScenarioData(prev => ({ ...prev, businesses: newBusinesses }));
                                  }
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">K1 Income</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={business?.k1 || 0}
                                onChange={(e) => {
                                  const newBusinesses = [...customScenarioData.businesses];
                                  if (newBusinesses[index]) {
                                    newBusinesses[index].k1 = Number(e.target.value) || 0;
                                    setCustomScenarioData(prev => ({ ...prev, businesses: newBusinesses }));
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="year">Tax Year</Label>
                      <select
                        id="year"
                        value={customScenarioData.year.toString()}
                        onChange={(e) => setCustomScenarioData(prev => ({ ...prev, year: Number(e.target.value) }))}
                        className="px-3 py-2 border rounded-md text-sm bg-background w-full"
                      >
                        {availableYears.map(year => (
                          <option key={year} value={year.toString()}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCustomScenario(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCustomScenario}>
                      Add Scenario
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              onClick={() => ClientService.testApiConnections()} 
              variant="outline" 
              size="sm"
              className="text-xs"
            >
              🧪 Test API
            </Button>
            <Button onClick={refreshScenarios} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-secondary/50 rounded-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2 border rounded-md text-sm min-w-[120px] bg-background"
            >
              <option value="">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'income' | 'business')}
              className="px-3 py-2 border rounded-md text-sm bg-background"
            >
              <option value="name">Sort by Name</option>
              <option value="income">Sort by Income</option>
              <option value="business">Sort by Business Revenue</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-primary/20">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Clients
                </p>
                <p className="text-3xl font-bold">
                  {formatLargeNumber(filteredAndSortedScenarios.length)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedYear ? `in ${selectedYear}` : 'all years'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-green-500/20">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Income
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(filteredAndSortedScenarios.reduce((sum, s) => sum + s.totalIncome, 0))}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedYear ? `in ${selectedYear}` : 'all years'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-purple-500/20">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Building className="h-8 w-8 text-purple-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Business Revenue (W2+K1)
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {formatCurrency(filteredAndSortedScenarios.reduce((sum, s) => sum + s.totalBusinessRevenue, 0))}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedYear ? `in ${selectedYear}` : 'all years'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-orange-500/20">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Building className="h-8 w-8 text-orange-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Businesses
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {formatLargeNumber(filteredAndSortedScenarios.reduce((sum, s) => sum + (s.businessCount || 0), 0))}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedYear ? `in ${selectedYear}` : 'all years'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Client Banner */}
      {selectedClient && (
        <Card className="bg-primary/5 border-primary/30 shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-xl font-semibold text-primary">
                  Selected: {selectedClient.client.firstName} {selectedClient.client.lastName}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div className="space-y-1">
                    <p>Total Income</p>
                    <p className="font-semibold text-green-600 text-lg">{formatCurrency(selectedClient.totalIncome)}</p>
                  </div>
                  <div className="space-y-1">
                    <p>Business (W2+K1)</p>
                    <p className="font-semibold text-purple-600 text-lg">{formatCurrency(selectedClient.totalBusinessRevenue)}</p>
                  </div>
                  <div className="space-y-1">
                    <p>Records</p>
                    <p className="font-semibold text-lg">{selectedClient.incomeCount}</p>
                  </div>
                  <div className="space-y-1">
                    <p>Businesses</p>
                    <p className="font-semibold text-lg">{selectedClient.businessCount}</p>
                  </div>
                </div>
                {/* Income Breakdown */}
                <div className="flex gap-4">
                  <div className="bg-blue-100 px-4 py-2 rounded-lg">
                    <p className="text-sm font-medium text-blue-600">W2</p>
                    <p className="text-blue-800 font-semibold">{formatCurrency((selectedClient as EnhancedClientScenario).incomeBreakdown?.w2 || 0)}</p>
                  </div>
                  <div className="bg-green-100 px-4 py-2 rounded-lg">
                    <p className="text-sm font-medium text-green-600">K1</p>
                    <p className="text-green-800 font-semibold">{formatCurrency((selectedClient as EnhancedClientScenario).incomeBreakdown?.k1 || 0)}</p>
                  </div>
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Other</p>
                    <p className="text-gray-800 font-semibold">{formatCurrency((selectedClient as EnhancedClientScenario).incomeBreakdown?.other || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Clients ({filteredAndSortedScenarios.length})
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredAndSortedScenarios.map((scenario) => {
            if (!scenario?.client?.id) {
              console.warn('Invalid scenario in render:', scenario);
              return null;
            }
            
            const isSelected = selectedClient?.client?.id === scenario.client.id;
            const isCustom = scenario.client.id.startsWith('custom-');
            
            return (
              <Card
                key={scenario.client.id}
                className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                  isSelected ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : 'shadow-sm'
                } ${isCustom ? 'border-l-4 border-l-blue-500' : ''}`}
                onClick={() => handleClientSelect(scenario)}
              >
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl font-semibold">
                          {scenario.client.firstName} {scenario.client.lastName}
                        </CardTitle>
                        {isCustom && (
                          <Badge variant="secondary" className="text-sm">Custom</Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {scenario.client.email && (
                          <p className="truncate">{scenario.client.email}</p>
                        )}
                        {scenario.client.phone && (
                          <p>{scenario.client.phone}</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 space-y-6">
                  {/* Income Breakdown */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Income Breakdown</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <p className="font-medium text-blue-600 text-sm">W2</p>
                        <p className="text-blue-800 font-semibold">{formatCurrency(scenario.incomeBreakdown.w2)}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <p className="font-medium text-green-600 text-sm">K1</p>
                        <p className="text-green-800 font-semibold">{formatCurrency(scenario.incomeBreakdown.k1)}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="font-medium text-gray-600 text-sm">Other</p>
                        <p className="text-gray-800 font-semibold">{formatCurrency(scenario.incomeBreakdown.other)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                      <p className="text-xl font-semibold text-green-600">
                        {formatCurrency(scenario.totalIncome)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Business (W2+K1)</p>
                      <p className="text-xl font-semibold text-purple-600">
                        {formatCurrency(scenario.totalBusinessRevenue)}
                      </p>
                    </div>
                  </div>

                  {/* Business Filing Types */}
                  {scenario.businessFilingTypes.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-muted-foreground">Filing Types</p>
                      <div className="flex flex-wrap gap-2">
                        {scenario.businessFilingTypes.map((type: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-sm">
                            <FileText className="h-4 w-4 mr-2" />
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-6 pt-4 border-t">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">{scenario.incomeCount}</p>
                        <p className="text-sm text-muted-foreground">records</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Building className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">{scenario.businessCount}</p>
                        <p className="text-sm text-muted-foreground">businesses</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }).filter(Boolean)}
        </div>
      </div>

      {/* Empty State */}
      {filteredAndSortedScenarios.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="p-4 bg-muted/50 rounded-full mb-4">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No clients found</h3>
          <p className="text-muted-foreground text-center max-w-md">
            {searchTerm 
              ? 'Try adjusting your search terms or filters.' 
              : 'No client scenarios are available for the selected criteria.'}
          </p>
          {searchTerm && (
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm('')}
              className="mt-4"
            >
              Clear Search
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 