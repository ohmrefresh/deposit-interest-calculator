import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "./Header";
import { DepositForm } from "./DepositForm";
import { TierEditor } from "./TierEditor";
import { ResultsDisplay } from "./ResultsDisplay";
import { ComparisonMode } from "./ComparisonMode";
import { PresetManager, Preset } from "./PresetManager";
import { CalculationHistory, HistoryEntry, useCalculationHistory } from "./CalculationHistory";
import {
  InterestTier,
  CalculationResult,
  calculateInterest,
  parseInputValue,
  formatNumber,
} from "@/lib/interest-calculator";
import { Calculator, GitCompare, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export function InterestCalculator() {
  // Form state
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [interestType, setInterestType] = useState<'simple' | 'compound'>('simple');
  const [interestApply, setInterestApply] = useState<'daily' | 'monthly' | 'biannually' | 'annually'>('daily');
  
  // Default tiers
  const defaultTiers: InterestTier[] = [
    { min: '1.00', max: '1000000.00', rate: '2.00' },
    { min: '1000000.01', max: '2000000.00', rate: '1.50' },
    { min: '2000000.01', max: '', rate: '0.50' }
  ];

  // Tier state
  const [tiers, setTiers] = useState<InterestTier[]>(defaultTiers);

  // Results and errors
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>("calculator");

  // History hook
  const { addToHistory } = useCalculationHistory();

  // Set default dates on mount
  useEffect(() => {
    const today = new Date();
    const oneYearLater = new Date(today);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(oneYearLater.toISOString().split('T')[0]);
  }, []);

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if user is typing in an input field
    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    
    // Ctrl+Enter or Cmd+Enter to calculate (works even in input fields)
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      if (activeTab === 'calculator') {
        handleCalculate();
      }
      return;
    }
    
    // Escape to reset (only when not in input field, to avoid disrupting user input)
    if (event.key === 'Escape' && !isInputField) {
      event.preventDefault();
      handleReset();
      return;
    }
  }, [activeTab]);

  // Register keyboard shortcuts
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const amount = parseInputValue(depositAmount);
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.depositAmount = 'Please enter a deposit amount greater than 0';
    }

    if (!startDate) {
      newErrors.startDate = 'Please select a start date';
    }

    if (!endDate) {
      newErrors.endDate = 'Please select an end date';
    } else if (startDate && new Date(endDate) <= new Date(startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (tiers.length === 0) {
      newErrors.tiers = 'Please configure at least 1 interest rate tier';
    } else {
      for (const tier of tiers) {
        if (!tier.min || !tier.rate || parseFloat(tier.rate) < 0) {
          newErrors.tiers = 'Please fill in all tier information completely';
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate
  const handleCalculate = () => {
    if (!validate()) {
      return;
    }

    const cleanAmount = parseInputValue(depositAmount);
    const calcResult = calculateInterest(
      cleanAmount,
      startDate,
      endDate,
      tiers,
      interestType,
      interestApply
    );

    setResult(calcResult);

    // Save to history
    addToHistory({
      depositAmount: cleanAmount,
      startDate,
      endDate,
      interestType,
      interestApply,
      tiers: [...tiers],
      result: calcResult,
    });

    toast.success("Saved to history", {
      description: `Interest $${formatNumber(calcResult.totalInterest)}`,
    });

    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Restore from history handler
  const handleRestoreFromHistory = (entry: HistoryEntry) => {
    setDepositAmount(formatNumber(entry.depositAmount));
    setStartDate(entry.startDate);
    setEndDate(entry.endDate);
    setInterestType(entry.interestType);
    setInterestApply(entry.interestApply);
    setTiers([...entry.tiers]);
    setResult(entry.result);
    setErrors({});
    
    toast.success("Calculation restored", {
      description: `Deposit $${formatNumber(entry.depositAmount)}`,
    });

    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Load preset handler
  const handleLoadPreset = (preset: Preset) => {
    setDepositAmount(preset.depositAmount ? formatNumber(preset.depositAmount) : "");
    setInterestType(preset.interestType);
    setInterestApply(preset.interestApply);
    setTiers([...preset.tiers]);
    setResult(null); // Clear previous results
  };

  // Reset form handler
  const handleReset = () => {
    // Reset to default dates
    const today = new Date();
    const oneYearLater = new Date(today);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    
    setDepositAmount("");
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(oneYearLater.toISOString().split('T')[0]);
    setInterestType('simple');
    setInterestApply('daily');
    setTiers([...defaultTiers]);
    setResult(null);
    setErrors({});
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen gradient-bg p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto relative">
        <div className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-card overflow-hidden border border-border/40">
          <Header />
          
          <div className="p-5 md:p-8 lg:p-10 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <TabsList className="grid w-full sm:w-auto grid-cols-2 h-11 p-1 bg-muted/60 rounded-xl border border-border/50">
                  <TabsTrigger 
                    value="calculator" 
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all text-sm font-medium"
                  >
                    <Calculator className="h-4 w-4" />
                    <span className="hidden sm:inline">Calculate Interest</span>
                    <span className="sm:hidden">Calculate</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="comparison" 
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all text-sm font-medium"
                  >
                    <GitCompare className="h-4 w-4" />
                    <span>Compare</span>
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <PresetManager
                    depositAmount={parseInputValue(depositAmount)}
                    interestType={interestType}
                    interestApply={interestApply}
                    tiers={tiers}
                    onLoadPreset={handleLoadPreset}
                  />
                  <CalculationHistory onRestore={handleRestoreFromHistory} />
                </div>
              </div>
              <TabsContent value="calculator" className="space-y-8 mt-0">
                <DepositForm
                  depositAmount={depositAmount}
                  setDepositAmount={setDepositAmount}
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  setEndDate={setEndDate}
                  interestType={interestType}
                  setInterestType={setInterestType}
                  interestApply={interestApply}
                  setInterestApply={setInterestApply}
                  errors={errors}
                />

                <TierEditor
                  tiers={tiers}
                  setTiers={setTiers}
                  error={errors.tiers}
                />

                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <Button
                      onClick={handleReset}
                      size="lg"
                      variant="outline"
                      className="h-12 px-6 rounded-xl font-medium text-sm border border-border/60 hover:bg-muted/50 hover:border-border transition-all"
                      title="Reset (Esc)"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                    <Button
                      onClick={handleCalculate}
                      size="lg"
                      className="flex-1 gradient-primary btn-primary text-primary-foreground shadow-md hover:shadow-glow text-sm h-12 rounded-xl font-semibold tracking-wide transition-all duration-200 hover:scale-[1.01]"
                      title="Calculate Interest (Ctrl+Enter)"
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Interest
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground text-center">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono border border-border/60">⌘+Enter</kbd> Calculate
                    <span className="mx-2">•</span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono border border-border/60">Esc</kbd> Reset
                  </p>
                </div>

                {result && (
                  <div id="results" className="scroll-mt-6">
                    <ResultsDisplay
                      result={result}
                      depositAmount={parseInputValue(depositAmount)}
                      startDate={startDate}
                      endDate={endDate}
                      tiers={tiers}
                      interestType={interestType}
                      interestApply={interestApply}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="comparison" className="space-y-8">
                <DepositForm
                  depositAmount={depositAmount}
                  setDepositAmount={setDepositAmount}
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  setEndDate={setEndDate}
                  interestType={interestType}
                  setInterestType={setInterestType}
                  interestApply={interestApply}
                  setInterestApply={setInterestApply}
                  errors={errors}
                />

                <TierEditor
                  tiers={tiers}
                  setTiers={setTiers}
                  error={errors.tiers}
                />

                <ComparisonMode
                  startDate={startDate}
                  endDate={endDate}
                  tiers={tiers}
                  baseDepositAmount={parseInputValue(depositAmount)}
                  baseInterestType={interestType}
                  baseInterestApply={interestApply}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
