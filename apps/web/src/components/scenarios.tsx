'use client';

import { useState, useMemo } from 'react';
import { Search, Users, DollarSign, Building, ChevronRight, Loader2, AlertCircle, RefreshCw, User } from 'lucide-react';
import { useClientScenarios, useRefreshScenarios } from '../domains/client/hooks/useClient.hooks';
import { useClientStore, useSelectedClient, useSelectedYear } from '../domains/client/store/client.store';
import { useDetailedClientStore } from '../domains/client/store/detailed-client.store';
import { ClientScenario } from '../domains/client/types/client.types';
import { ClientService } from '../domains/client/services/client.service';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

export function Scenarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'income' | 'business'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const selectedYear = useSelectedYear();
  const { setSelectedClient, setSelectedYear } = useClientStore();
  const { loadClientData } = useDetailedClientStore();
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

  const handleClientSelect = async (scenario: ClientScenario) => {
    setSelectedClient(scenario);
    // Load detailed client data
    await loadClientData(scenario.client.id);
  };

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
              Explore and manage client tax scenarios with comprehensive income and business data analysis
            </p>
          </div>
          <div className="flex gap-2">
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="shadow-sm border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Clients
                </p>
                                 <p className="text-2xl font-bold">
                   {formatLargeNumber(filteredAndSortedScenarios.length)}
                 </p>
                <p className="text-xs text-muted-foreground">
                  {selectedYear ? `in ${selectedYear}` : 'all years'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Income
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(filteredAndSortedScenarios.reduce((sum, s) => sum + s.totalIncome, 0))}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedYear ? `in ${selectedYear}` : 'all years'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Business Revenue
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(filteredAndSortedScenarios.reduce((sum, s) => sum + s.totalBusinessRevenue, 0))}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedYear ? `in ${selectedYear}` : 'all years'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-orange-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Building className="h-6 w-6 text-orange-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Businesses
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatLargeNumber(filteredAndSortedScenarios.reduce((sum, s) => sum + (s.businessCount || 0), 0))}
                </p>
                <p className="text-xs text-muted-foreground">
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
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-primary">
                  Selected: {selectedClient.client.firstName} {selectedClient.client.lastName}
                </h3>
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <span>Income: <span className="font-medium text-green-600">{formatCurrency(selectedClient.totalIncome)}</span></span>
                  <span>Business: <span className="font-medium text-purple-600">{formatCurrency(selectedClient.totalBusinessRevenue)}</span></span>
                  <span>Records: <span className="font-medium">{selectedClient.incomeCount}</span></span>
                  <span>Businesses: <span className="font-medium">{selectedClient.businessCount}</span></span>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedScenarios.map((scenario) => {
            if (!scenario?.client?.id) {
              console.warn('Invalid scenario in render:', scenario);
              return null;
            }
            
            const isSelected = selectedClient?.client?.id === scenario.client.id;
            
            return (
              <Card
                key={scenario.client.id}
                className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                  isSelected ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : 'shadow-sm'
                }`}
                onClick={() => handleClientSelect(scenario)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold">
                        {scenario.client.firstName} {scenario.client.lastName}
                      </CardTitle>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {scenario.client.email && (
                          <p className="truncate">{scenario.client.email}</p>
                        )}
                        {scenario.client.phone && (
                          <p>{scenario.client.phone}</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Total Income</p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(scenario.totalIncome)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Business Revenue</p>
                      <p className="text-lg font-semibold text-purple-600">
                        {formatCurrency(scenario.totalBusinessRevenue)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-blue-500/10 rounded">
                        <DollarSign className="h-3 w-3 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">{scenario.incomeCount}</span>
                      <span className="text-xs text-muted-foreground">incomes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-orange-500/10 rounded">
                        <Building className="h-3 w-3 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium">{scenario.businessCount}</span>
                      <span className="text-xs text-muted-foreground">businesses</span>
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