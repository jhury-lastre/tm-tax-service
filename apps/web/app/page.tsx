import { Scenarios } from "../src/components/scenarios";
import { TaxCalculator } from "../src/components/tax-calculator";
import { DebugPanel } from "../src/components/debug-panel";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Scenarios Panel */}
          <div className="xl:col-span-1">
            <Scenarios />
            <DebugPanel />
          </div>
          
          {/* Tax Calculator Panel */}
          <div className="xl:col-span-1">
            <div className="sticky top-8">
              <TaxCalculator />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
