'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ClientService } from '../domains/client/services/client.service';

export function DebugPanel() {
  const [apiResults, setApiResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testDirectApiCalls = async () => {
    setIsLoading(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const results = {
        baseUrl: API_BASE_URL,
        timestamp: new Date().toISOString(),
        tests: {} as any
      };

      // Test 1: Get all clients
      try {
        console.log('Testing /clients endpoint...');
        const clientsResponse = await fetch(`${API_BASE_URL}/clients`);
        results.tests.clients = {
          status: clientsResponse.status,
          ok: clientsResponse.ok,
          data: clientsResponse.ok ? await clientsResponse.json() : await clientsResponse.text()
        };
      } catch (error) {
        results.tests.clients = { error: error instanceof Error ? error.message : String(error) };
      }

      // Test 2: Get client income types
      try {
        console.log('Testing /client-income/types endpoint...');
        const incomeTypesResponse = await fetch(`${API_BASE_URL}/client-income/types`);
        results.tests.incomeTypes = {
          status: incomeTypesResponse.status,
          ok: incomeTypesResponse.ok,
          data: incomeTypesResponse.ok ? await incomeTypesResponse.json() : await incomeTypesResponse.text()
        };
      } catch (error) {
        results.tests.incomeTypes = { error: error instanceof Error ? error.message : String(error) };
      }

      // Test 3: Get all client income
      try {
        console.log('Testing /client-income endpoint...');
        const allIncomeResponse = await fetch(`${API_BASE_URL}/client-income`);
        results.tests.allIncome = {
          status: allIncomeResponse.status,
          ok: allIncomeResponse.ok,
          data: allIncomeResponse.ok ? await allIncomeResponse.json() : await allIncomeResponse.text()
        };
      } catch (error) {
        results.tests.allIncome = { error: error instanceof Error ? error.message : String(error) };
      }

      // Test 4: Get all client businesses
      try {
        console.log('Testing /client-businesses endpoint...');
        const allBusinessesResponse = await fetch(`${API_BASE_URL}/client-businesses`);
        results.tests.allBusinesses = {
          status: allBusinessesResponse.status,
          ok: allBusinessesResponse.ok,
          data: allBusinessesResponse.ok ? await allBusinessesResponse.json() : await allBusinessesResponse.text()
        };
      } catch (error) {
        results.tests.allBusinesses = { error: error instanceof Error ? error.message : String(error) };
      }

      // Test 5: Health check
      try {
        console.log('Testing health endpoint...');
        const healthResponse = await fetch(`${API_BASE_URL}/`);
        results.tests.health = {
          status: healthResponse.status,
          ok: healthResponse.ok,
          data: healthResponse.ok ? await healthResponse.text() : await healthResponse.text()
        };
      } catch (error) {
        results.tests.health = { error: error instanceof Error ? error.message : String(error) };
      }

      console.log('API Test Results:', results);
      setApiResults(results);
    } catch (error) {
      console.error('Debug test failed:', error);
      setApiResults({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const testSpecificClient = async () => {
    if (!apiResults?.tests?.clients?.data?.data) {
      alert('Please run general API test first to get client data');
      return;
    }

    setIsLoading(true);
    try {
      const clients = Array.isArray(apiResults.tests.clients.data.data) 
        ? apiResults.tests.clients.data.data 
        : [apiResults.tests.clients.data.data];
      
      if (clients.length === 0) {
        setApiResults(prev => ({ ...prev, clientTest: { error: 'No clients found' } }));
        return;
      }

      const firstClient = clients[0];
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const clientTest = {
        clientId: firstClient.id,
        clientName: `${firstClient.firstName} ${firstClient.lastName}`,
        tests: {} as any
      };

      // Test client income
      try {
        const incomeUrl = `${API_BASE_URL}/client-income/client/${firstClient.id}`;
        console.log(`Testing client income: ${incomeUrl}`);
        const incomeResponse = await fetch(incomeUrl);
        clientTest.tests.income = {
          url: incomeUrl,
          status: incomeResponse.status,
          ok: incomeResponse.ok,
          data: incomeResponse.ok ? await incomeResponse.json() : await incomeResponse.text()
        };
      } catch (error) {
        clientTest.tests.income = { error: error instanceof Error ? error.message : String(error) };
      }

      // Test client businesses
      try {
        const businessUrl = `${API_BASE_URL}/client-businesses/client/${firstClient.id}`;
        console.log(`Testing client businesses: ${businessUrl}`);
        const businessResponse = await fetch(businessUrl);
        clientTest.tests.business = {
          url: businessUrl,
          status: businessResponse.status,
          ok: businessResponse.ok,
          data: businessResponse.ok ? await businessResponse.json() : await businessResponse.text()
        };
      } catch (error) {
        clientTest.tests.business = { error: error instanceof Error ? error.message : String(error) };
      }

      setApiResults(prev => ({ ...prev, clientTest }));
    } catch (error) {
      console.error('Client test failed:', error);
      setApiResults(prev => ({ ...prev, clientTest: { error: error instanceof Error ? error.message : String(error) } }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">🔧 Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testDirectApiCalls} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? 'Testing...' : 'Test All APIs'}
          </Button>
          <Button 
            onClick={testSpecificClient} 
            disabled={isLoading || !apiResults?.tests?.clients}
            variant="outline"
            size="sm"
          >
            Test Client Data
          </Button>
          <Button 
            onClick={() => ClientService.getClientScenarios().then(scenarios => {
              console.log('Client scenarios test result:', scenarios);
              setApiResults(prev => ({ ...prev, scenariosTest: scenarios }));
            })} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            Test Scenarios
          </Button>
          <Button 
            onClick={() => ClientService.getClientScenarios(2024).then(scenarios => {
              console.log('Client scenarios 2024 test result:', scenarios);
              setApiResults(prev => ({ ...prev, scenarios2024Test: scenarios }));
            })} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            Test 2024 Data
          </Button>
          <Button 
            onClick={() => setApiResults(null)} 
            variant="outline"
            size="sm"
          >
            Clear
          </Button>
        </div>

        {apiResults && (
          <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
            <pre className="text-xs">
              {JSON.stringify(apiResults, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 