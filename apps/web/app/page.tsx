'use client';

import { Scenarios } from "../src/components/scenarios";
import { TaxCalculator } from "../src/components/tax-calculator";
import { DebugPanel } from "../src/components/debug-panel";
import { useSelectedClient } from "../src/domains/client/store/client.store";
import { Button } from "../src/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useClientStore } from "../src/domains/client/store/client.store";

export default function Home() {
  const selectedClient = useSelectedClient();
  const { setSelectedClient } = useClientStore();

  const handleBackToScenarios = () => {
    setSelectedClient(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {!selectedClient ? (
          // Step 1: Show Scenarios
          <div className="space-y-8">
            <Scenarios />
            <DebugPanel />
          </div>
        ) : (
          // Step 2: Show Tax Calculator
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleBackToScenarios}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Scenarios
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">
                  Tax Calculator - {selectedClient.client.firstName} {selectedClient.client.lastName}
                </h1>
                <p className="text-muted-foreground">
                  Calculate taxes for the selected client scenario
                </p>
              </div>
            </div>
            <TaxCalculator />
          </div>
        )}
      </div>
    </div>
  );
}
