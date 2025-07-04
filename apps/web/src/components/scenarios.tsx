'use client';

import { useState, useMemo } from 'react';
import { Search, Users, DollarSign, Building, ChevronRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useClientScenarios, useRefreshScenarios } from '../domains/client/hooks/useClient.hooks';
import { useClientStore, useSelectedClient, useSelectedYear } from '../domains/client/store/client.store';
import { ClientScenario } from '../domains/client/types/client.types';
import { ClientService } from '../domains/client/services/client.service';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function Scenarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'income' | 'business'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const selectedYear = useSelectedYear();
  const { setSelectedClient, setSelectedYear } = useClientStore();
  const selectedClient = useSelectedClient();
  const { data: scenarios, isLoading, isError, error } = useClientScenarios(selectedYear || undefined);
  const refreshScenarios = useRefreshScenarios(selectedYear || undefined);

  // Generate available years (current year and previous 4 years)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const filteredAndSortedScenarios = useMemo(() => {
    if (!scenarios || !Array.isArray(scenarios)) return [];

    let filtered = scenarios.filter(scenario => {
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
  }, [scenarios, searchTerm, sortBy, sortOrder]);

  const handleClientSelect = (scenario: ClientScenario) => {
    setSelectedClient(scenario);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading client scenarios...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
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
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Client Scenarios
            {selectedYear && (
              <span className="text-xl font-normal text-muted-foreground ml-2">
                - {selectedYear}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">
            Manage and analyze client tax scenarios with income and business data
            {selectedYear ? ` for ${selectedYear}` : ' (all years)'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => ClientService.testApiConnections()} 
            variant="outline" 
            size="sm"
          >
            🧪 Test API
          </Button>
          <Button onClick={refreshScenarios} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-md text-sm min-w-[100px]"
          >
            <option value="">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'income' | 'business')}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="income">Sort by Income</option>
            <option value="business">Sort by Business Revenue</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Clients {selectedYear ? `(${selectedYear})` : '(All Years)'}
                </p>
                <p className="text-2xl font-bold">{filteredAndSortedScenarios.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Income {selectedYear ? `(${selectedYear})` : '(All Years)'}
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(filteredAndSortedScenarios.reduce((sum, s) => sum + s.totalIncome, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Business Revenue {selectedYear ? `(${selectedYear})` : '(All Years)'}
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(filteredAndSortedScenarios.reduce((sum, s) => sum + s.totalBusinessRevenue, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Businesses {selectedYear ? `(${selectedYear})` : '(All Years)'}
                </p>
                <p className="text-2xl font-bold">
                  {filteredAndSortedScenarios.reduce((sum, s) => sum + s.businessCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredAndSortedScenarios.map((scenario) => {
          if (!scenario?.client?.id) {
            console.warn('Invalid scenario in render:', scenario);
            return null;
          }
          
          return (
            <Card
              key={scenario.client.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedClient?.client?.id === scenario.client.id ? 'ring-2 ring-green-500' : ''
              }`}
              onClick={() => handleClientSelect(scenario)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {scenario.client.firstName || ''} {scenario.client.lastName || ''}
                  </CardTitle>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  {scenario.client.email && <p>{scenario.client.email}</p>}
                  {scenario.client.phone && <p>{scenario.client.phone}</p>}
                </div>
              </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Income</p>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(scenario.totalIncome)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Business Revenue</p>
                  <p className="font-semibold text-purple-600">
                    {formatCurrency(scenario.totalBusinessRevenue)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Income Records</p>
                  <p className="font-semibold">{scenario.incomeCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Businesses</p>
                  <p className="font-semibold">{scenario.businessCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          );
        }).filter(Boolean)}
      </div>

      {/* Empty State */}
      {filteredAndSortedScenarios.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No clients found</h3>
          <p className="text-muted-foreground text-center max-w-md">
            {searchTerm ? 'Try adjusting your search terms.' : 'No client scenarios are available.'}
          </p>
        </div>
      )}

      {/* Selected Client Info */}
      {selectedClient && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">
              Selected Client: {selectedClient.client.firstName} {selectedClient.client.lastName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Income</p>
                <p className="font-semibold text-green-600">
                  {formatCurrency(selectedClient.totalIncome)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Business Revenue</p>
                <p className="font-semibold text-purple-600">
                  {formatCurrency(selectedClient.totalBusinessRevenue)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Income Records</p>
                <p className="font-semibold">{selectedClient.incomeCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Businesses</p>
                <p className="font-semibold">{selectedClient.businessCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 