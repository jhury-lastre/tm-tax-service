'use client';
import { useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { useSelectedClient } from '../domains/client/store/client.store';
import { User, DollarSign, Building, FileText } from 'lucide-react';
import { Badge } from './ui/badge';

interface TaxDetailFieldProps {
  title: string;
  name: string;
  value: number;
  readOnly?: boolean;
  onChange?: (name: string, value: string) => void;
  color?: string;
}

interface TaxData {
  // Income fields
  wages: number;
  interest: number;
  dividends: number;
  ira_distributions: number;
  pensions_annuities: number;
  social_security_benefits: number;
  capital_gains: number;
  additional_income: number;
  total_income: number;
  adjusted_gross_income: number;
  
  // Deduction fields
  standard_deduction: number;
  qualified_business_income: number;
  taxable_income: number;
  
  // Tax fields
  tax: number;
  self_employment_tax: number;
  capital_gain_tax: number;
  tax_liability: number;
  
  // Payment fields
  federal_withholdings: number;
  estimated_payments: number;
  refund_balance: number;
}

export function TaxCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const selectedClient = useSelectedClient();
  const [taxData, setTaxData] = useState<TaxData>({
    // Income fields
    wages: 0,
    interest: 0,
    dividends: 0,
    ira_distributions: 0,
    pensions_annuities: 0,
    social_security_benefits: 0,
    capital_gains: 0,
    additional_income: 0,
    total_income: 0,
    adjusted_gross_income: 0,
    
    // Deduction fields
    standard_deduction: 0,
    qualified_business_income: 0,
    taxable_income: 0,
    
    // Tax fields
    tax: 0,
    self_employment_tax: 0,
    capital_gain_tax: 0,
    tax_liability: 0,
    
    // Payment fields
    federal_withholdings: 0,
    estimated_payments: 0,
    refund_balance: 0,
  });

  console.log(selectedClient);

  const handleChange = (name: string, value: string) => {
    const numericValue = value === '' ? 0 : Number(value);
    setTaxData(prev => ({
      ...prev,
      [name]: numericValue
    }));
  };

  const handleSubmit = () => {
    console.log('Tax data:', taxData);
    // Handle form submission here
  };

  const formatWithCommas = (value: number) => {
    return value.toLocaleString();
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

  const incomeFields = [
    { title: 'Wages', name: 'wages', readOnly: true },
    { title: 'Interest', name: 'interest', readOnly: true },
    { title: 'Dividends', name: 'dividends', readOnly: true },
    { title: 'IRA distributions', name: 'ira_distributions', readOnly: false },
    { title: 'Pensions and Annuities', name: 'pensions_annuities', readOnly: false },
    { title: 'Social Security Benefits', name: 'social_security_benefits', readOnly: true },
    { title: 'Capital Gains', name: 'capital_gains', readOnly: true },
    { title: 'Additional Income', name: 'additional_income', readOnly: false },
    { title: 'Total Income', name: 'total_income', readOnly: true },
    { title: 'AGI', name: 'adjusted_gross_income', readOnly: false },
  ];

  const deductionFields = [
    { title: 'Standard/Itemized Deduction', name: 'standard_deduction', readOnly: false },
    { title: 'QBI Deduction', name: 'qualified_business_income', readOnly: false },
    { title: 'Taxable Income', name: 'taxable_income', readOnly: true },
  ];

  const taxFields = [
    { title: 'Fed Tax Liability', name: 'tax', readOnly: true },
    { title: 'SE Tax', name: 'self_employment_tax', readOnly: true },
    { title: 'Capital Gain Tax', name: 'capital_gain_tax', readOnly: true },
    { title: 'Total Tax Liability (Combined)', name: 'tax_liability', readOnly: true },
  ];

  const isRefund = taxData.federal_withholdings + taxData.estimated_payments > taxData.tax_liability;

  const returnFields = [
    { title: 'Federal Withholding', name: 'federal_withholdings', readOnly: false },
    { title: 'Estimated Payments', name: 'estimated_payments', readOnly: false },
    { title: isRefund ? 'Refund' : 'Balance Due', name: 'refund_balance', readOnly: true },
  ];

  // Calculate income breakdown if client is selected
  const getIncomeBreakdown = () => {
    if (!selectedClient) return null;

    // Debug: Log all income types for this client
    console.log('Client incomes:', selectedClient.client.incomes?.map(income => ({
      type: income.incomeType,
      amount: income.amount
    })));

    // Calculate income breakdown from both income records and business records
    const w2IncomeFromRecords = selectedClient.client.incomes?.filter(income => 
      income.incomeType?.toLowerCase().includes('w2') || 
      income.incomeType?.toLowerCase().includes('wages')
    ).reduce((sum, income) => sum + income.amount, 0) || 0;

    const k1IncomeFromRecords = selectedClient.client.incomes?.filter(income => 
      income.incomeType?.toLowerCase().includes('k1') || 
      income.incomeType?.toLowerCase().includes('k-1')
    ).reduce((sum, income) => sum + income.amount, 0) || 0;

    const otherIncomeRecords = selectedClient.client.incomes?.filter(income => {
      const incomeType = income.incomeType?.toLowerCase() || '';
      // Exclude W2 and K1 income, include everything else (capital gains, long term capital gains, dividends, interest, etc.)
      return !incomeType.includes('w2') && 
             !incomeType.includes('wages') &&
             !incomeType.includes('k1') &&
             !incomeType.includes('k-1');
    }) || [];

    // Debug: Log other income types being included
    console.log('Other income records:', otherIncomeRecords.map(income => ({
      type: income.incomeType,
      amount: income.amount
    })));

    const otherIncome = otherIncomeRecords.reduce((sum, income) => sum + income.amount, 0);

    // Add business W2 and K1 income
    const w2IncomeFromBusiness = selectedClient.client.businesses?.reduce((sum, business) => 
      sum + (business.w2 || 0), 0) || 0;

    const k1IncomeFromBusiness = selectedClient.client.businesses?.reduce((sum, business) => 
      sum + (business.k1 || 0), 0) || 0;

    // Combine income from both sources
    const w2Income = w2IncomeFromRecords + w2IncomeFromBusiness;
    const k1Income = k1IncomeFromRecords + k1IncomeFromBusiness;

    return {
      w2: w2Income,
      k1: k1Income,
      other: otherIncome,
      total: w2Income + k1Income + otherIncome
    };
  };

  const incomeBreakdown = getIncomeBreakdown();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Tax Calculator</h1>
        <p className="text-lg text-muted-foreground">
          Calculate your tax liability with our custom themed calculator
        </p>
      </div>

      {/* Client Summary */}
      {selectedClient && incomeBreakdown && (
        <Card className="bg-primary/5 border-primary/30 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <User className="h-5 w-5" />
              Client Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">
                {selectedClient.client.firstName} {selectedClient.client.lastName}
              </h3>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {selectedClient.client.email && (
                  <span>{selectedClient.client.email}</span>
                )}
                {selectedClient.client.phone && (
                  <span>{selectedClient.client.phone}</span>
                )}
              </div>
            </div>

            {/* Income Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium text-muted-foreground">Income Breakdown</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="font-medium text-blue-600 text-sm">W2 Income</p>
                  <p className="text-blue-800 font-semibold text-lg">{formatCurrency(incomeBreakdown.w2)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="font-medium text-green-600 text-sm">K1 Income</p>
                  <p className="text-green-800 font-semibold text-lg">{formatCurrency(incomeBreakdown.k1)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="font-medium text-gray-600 text-sm">Other Income</p>
                  <p className="text-gray-800 font-semibold text-lg">{formatCurrency(incomeBreakdown.other)}</p>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="font-semibold text-green-600 text-lg">{formatCurrency(incomeBreakdown.total)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Business Revenue</p>
                <p className="font-semibold text-purple-600 text-lg">{formatCurrency(incomeBreakdown.w2 + incomeBreakdown.k1)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Income Records</p>
                <p className="font-semibold text-lg">{selectedClient.incomeCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Businesses</p>
                <p className="font-semibold text-lg">{selectedClient.businessCount}</p>
              </div>
            </div>

            {/* Business Filing Types */}
            {selectedClient.client.businesses && selectedClient.client.businesses.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-muted-foreground">Business Filing Types</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedClient.client.businesses.map((business, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      <FileText className="h-3 w-3 mr-1" />
                      {business.filingType || 'Unknown'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tax Calculator Demo</CardTitle>
          <CardDescription>Click the button below to open the tax calculator</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsOpen(true)}>
            Open Tax Calculator
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg rounded-md space-y-0">
          <DialogHeader className="py-2 text-center">
            <DialogTitle className="text-xl font-semibold">TAX DETAILS</DialogTitle>
          </DialogHeader>

          <div className="overflow-auto max-h-[36rem]">
            <Accordion type="single" collapsible defaultValue="income" className="w-full">
              <AccordionItem value="income">
                <AccordionTrigger className="bg-primary text-white px-2 py-1 font-semibold text-base">
                  ADJUSTED GROSS INCOME
                  <span className="ml-auto">
                    ${formatWithCommas(taxData.adjusted_gross_income)}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  {incomeFields.map((field) => (
                    <TaxDetailField
                      key={field.name}
                      title={field.title}
                      name={field.name}
                      value={taxData[field.name as keyof TaxData]}
                      readOnly={field.readOnly}
                      onChange={handleChange}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="deductions">
                <AccordionTrigger className="bg-primary text-white px-2 py-1 font-semibold text-base">
                  TAXABLE INCOME
                  <span className="ml-auto">
                    ${formatWithCommas(taxData.taxable_income)}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  {deductionFields.map((field) => (
                    <TaxDetailField
                      key={field.name}
                      title={field.title}
                      name={field.name}
                      value={taxData[field.name as keyof TaxData]}
                      readOnly={field.readOnly}
                      onChange={handleChange}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="federal_tax">
                <AccordionTrigger className="bg-primary text-white px-2 py-1 font-semibold text-base">
                  FEDERAL TAX
                  <span className="ml-auto">
                    ${formatWithCommas(taxData.tax_liability)}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  {taxFields.map((field) => (
                    <TaxDetailField
                      key={field.name}
                      title={field.title}
                      name={field.name}
                      value={taxData[field.name as keyof TaxData]}
                      readOnly={field.readOnly}
                      onChange={handleChange}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="refund">
                <AccordionTrigger className={`${isRefund ? 'bg-green-600' : 'bg-destructive'} text-white px-2 py-1 font-semibold text-base`}>
                  {isRefund ? 'REFUND' : 'BALANCE DUE'}
                  <span className="ml-auto">
                    ${formatWithCommas(Math.abs(taxData.refund_balance))}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  {returnFields.map((field) => (
                    <TaxDetailField
                      key={field.name}
                      title={field.title}
                      name={field.name}
                      value={field.name === 'refund_balance' 
                        ? Math.abs(taxData[field.name as keyof TaxData]) 
                        : taxData[field.name as keyof TaxData]}
                      readOnly={field.readOnly}
                      onChange={handleChange}
                      color={field.name === 'refund_balance' ? (isRefund ? 'green' : 'red') : undefined}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <DialogFooter className="flex items-center justify-between gap-2 pt-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-primary hover:bg-primary/90"
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

             {/* Display current tax data */}
       <div className="space-y-6">
         <div className="text-center">
           <h2 className="text-2xl font-bold text-foreground mb-2">Tax Summary</h2>
           <p className="text-muted-foreground">Review your calculated tax information</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Income Section */}
           <Card>
             <CardHeader className="pb-3">
               <CardTitle className="text-lg flex items-center gap-2">
                 <div className="w-3 h-3 bg-primary rounded-full"></div>
                 Income Information
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-2">
                   <div className="flex justify-between">
                     <span className="text-sm text-muted-foreground">Wages</span>
                     <span className="text-sm font-medium">${formatWithCommas(taxData.wages)}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-sm text-muted-foreground">Interest</span>
                     <span className="text-sm font-medium">${formatWithCommas(taxData.interest)}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-sm text-muted-foreground">Dividends</span>
                     <span className="text-sm font-medium">${formatWithCommas(taxData.dividends)}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-sm text-muted-foreground">Capital Gains</span>
                     <span className="text-sm font-medium">${formatWithCommas(taxData.capital_gains)}</span>
                   </div>
                 </div>
                 <div className="space-y-2">
                   <div className="flex justify-between">
                     <span className="text-sm text-muted-foreground">IRA Distributions</span>
                     <span className="text-sm font-medium">${formatWithCommas(taxData.ira_distributions)}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-sm text-muted-foreground">Pensions</span>
                     <span className="text-sm font-medium">${formatWithCommas(taxData.pensions_annuities)}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-sm text-muted-foreground">Social Security</span>
                     <span className="text-sm font-medium">${formatWithCommas(taxData.social_security_benefits)}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-sm text-muted-foreground">Other Income</span>
                     <span className="text-sm font-medium">${formatWithCommas(taxData.additional_income)}</span>
                   </div>
                 </div>
               </div>
               <div className="border-t pt-3">
                 <div className="flex justify-between items-center">
                   <span className="font-semibold text-primary">Adjusted Gross Income</span>
                   <span className="font-bold text-lg text-primary">${formatWithCommas(taxData.adjusted_gross_income)}</span>
                 </div>
               </div>
             </CardContent>
           </Card>

           {/* Deductions Section */}
           <Card>
             <CardHeader className="pb-3">
               <CardTitle className="text-lg flex items-center gap-2">
                 <div className="w-3 h-3 bg-secondary rounded-full"></div>
                 Deductions
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
               <div className="space-y-2">
                 <div className="flex justify-between">
                   <span className="text-sm text-muted-foreground">Standard Deduction</span>
                   <span className="text-sm font-medium">${formatWithCommas(taxData.standard_deduction)}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-sm text-muted-foreground">QBI Deduction</span>
                   <span className="text-sm font-medium">${formatWithCommas(taxData.qualified_business_income)}</span>
                 </div>
               </div>
               <div className="border-t pt-3">
                 <div className="flex justify-between items-center">
                   <span className="font-semibold text-secondary-foreground">Taxable Income</span>
                   <span className="font-bold text-lg text-secondary-foreground">${formatWithCommas(taxData.taxable_income)}</span>
                 </div>
               </div>
             </CardContent>
           </Card>

           {/* Tax Calculations Section */}
           <Card>
             <CardHeader className="pb-3">
               <CardTitle className="text-lg flex items-center gap-2">
                 <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                 Tax Calculations
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
               <div className="space-y-2">
                 <div className="flex justify-between">
                   <span className="text-sm text-muted-foreground">Federal Tax</span>
                   <span className="text-sm font-medium">${formatWithCommas(taxData.tax)}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-sm text-muted-foreground">Self-Employment Tax</span>
                   <span className="text-sm font-medium">${formatWithCommas(taxData.self_employment_tax)}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-sm text-muted-foreground">Capital Gains Tax</span>
                   <span className="text-sm font-medium">${formatWithCommas(taxData.capital_gain_tax)}</span>
                 </div>
               </div>
               <div className="border-t pt-3">
                 <div className="flex justify-between items-center">
                   <span className="font-semibold text-orange-700">Total Tax Liability</span>
                   <span className="font-bold text-lg text-orange-700">${formatWithCommas(taxData.tax_liability)}</span>
                 </div>
               </div>
             </CardContent>
           </Card>

           {/* Payments & Balance Section */}
           <Card>
             <CardHeader className="pb-3">
               <CardTitle className="text-lg flex items-center gap-2">
                 <div className={`w-3 h-3 rounded-full ${isRefund ? 'bg-green-500' : 'bg-destructive'}`}></div>
                 Payments & {isRefund ? 'Refund' : 'Balance Due'}
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
               <div className="space-y-2">
                 <div className="flex justify-between">
                   <span className="text-sm text-muted-foreground">Federal Withholding</span>
                   <span className="text-sm font-medium">${formatWithCommas(taxData.federal_withholdings)}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-sm text-muted-foreground">Estimated Payments</span>
                   <span className="text-sm font-medium">${formatWithCommas(taxData.estimated_payments)}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-sm text-muted-foreground">Total Payments</span>
                   <span className="text-sm font-medium">${formatWithCommas(taxData.federal_withholdings + taxData.estimated_payments)}</span>
                 </div>
               </div>
               <div className="border-t pt-3">
                 <div className="flex justify-between items-center">
                   <span className={`font-semibold ${isRefund ? 'text-green-700' : 'text-destructive'}`}>
                     {isRefund ? 'Refund Amount' : 'Balance Due'}
                   </span>
                   <span className={`font-bold text-lg ${isRefund ? 'text-green-700' : 'text-destructive'}`}>
                     ${formatWithCommas(Math.abs(taxData.refund_balance))}
                   </span>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>

         {/* Summary Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <Card className="border-l-4 border-l-primary">
             <CardContent className="p-4">
               <div className="text-center">
                 <div className="text-2xl font-bold text-primary">${formatWithCommas(taxData.adjusted_gross_income)}</div>
                 <div className="text-sm text-muted-foreground">Adjusted Gross Income</div>
               </div>
             </CardContent>
           </Card>
           <Card className="border-l-4 border-l-orange-500">
             <CardContent className="p-4">
               <div className="text-center">
                 <div className="text-2xl font-bold text-orange-700">${formatWithCommas(taxData.tax_liability)}</div>
                 <div className="text-sm text-muted-foreground">Total Tax Liability</div>
               </div>
             </CardContent>
           </Card>
           <Card className={`border-l-4 ${isRefund ? 'border-l-green-500' : 'border-l-destructive'}`}>
             <CardContent className="p-4">
               <div className="text-center">
                 <div className={`text-2xl font-bold ${isRefund ? 'text-green-700' : 'text-destructive'}`}>
                   ${formatWithCommas(Math.abs(taxData.refund_balance))}
                 </div>
                 <div className="text-sm text-muted-foreground">{isRefund ? 'Refund' : 'Balance Due'}</div>
               </div>
             </CardContent>
           </Card>
         </div>
       </div>
    </div>
  );
}

function TaxDetailField({
  title,
  name,
  value,
  readOnly = false,
  onChange,
  color,
}: TaxDetailFieldProps) {
  const isAGI = name === 'adjusted_gross_income';
  const formatWithCommas = (value: number) => value.toLocaleString();

  return (
    <div className={cn(
      "flex items-center justify-between w-full mb-1.5",
      isAGI && "bg-secondary py-1 rounded-md font-medium"
    )}>
      <span className={cn(
        "pl-2 text-sm font-normal text-foreground w-1/2",
        isAGI && "font-semibold"
      )}>
        {title}
      </span>

      {readOnly ? (
        <div className={cn(
          'pl-1 h-8 w-1/2 flex items-center text-sm pr-4',
          color === 'green' ? 'text-green-600' : 
          color === 'red' ? 'text-destructive' : 'text-foreground',
          isAGI && 'font-semibold'
        )}>
          <span className="mr-1">$</span>
          {formatWithCommas(value)}
        </div>
      ) : (
        <div className="relative pr-4 h-8 w-1/2 flex justify-end items-center">
          <span className={cn(
            "text-foreground font-semibold absolute left-2 top-1/2 transform -translate-y-1/2 z-10 text-sm",
            isAGI && "font-bold"
          )}>
            $
          </span>
                     <NumericFormat
             name={name}
             value={value}
             thousandSeparator={true}
             customInput={Input}
             onValueChange={({ value }: { value: string }) => {
               if (onChange) {
                 onChange(name, value || '0');
               }
             }}
             className={cn(
               'pl-5 h-7 w-full border text-xs text-foreground font-normal border-border rounded-md bg-background focus-visible:ring-1 focus-visible:ring-ring text-left',
               isAGI && 'border-primary font-medium'
             )}
           />
        </div>
      )}
    </div>
  );
}

export default TaxCalculator; 