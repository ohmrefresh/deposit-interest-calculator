import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  Trash2, 
  RotateCcw, 
  Clock, 
  Banknote,
  TrendingUp,
  Calendar,
  AlertCircle
} from "lucide-react";
import { formatNumber, InterestTier, CalculationResult } from "@/lib/interest-calculator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface HistoryEntry {
  id: string;
  timestamp: number;
  depositAmount: string;
  startDate: string;
  endDate: string;
  interestType: 'simple' | 'compound';
  interestApply: 'daily' | 'monthly' | 'biannually' | 'annually';
  tiers: InterestTier[];
  result: CalculationResult;
}

interface CalculationHistoryProps {
  onRestore: (entry: HistoryEntry) => void;
}

const HISTORY_STORAGE_KEY = 'interest-calculator-history';
const MAX_HISTORY_ITEMS = 20;

export function useCalculationHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, []);

  // Save to localStorage whenever history changes
  const saveHistory = (newHistory: HistoryEntry[]) => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  };

  const addToHistory = (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    
    const newHistory = [newEntry, ...history].slice(0, MAX_HISTORY_ITEMS);
    saveHistory(newHistory);
  };

  const removeFromHistory = (id: string) => {
    const newHistory = history.filter(entry => entry.id !== id);
    saveHistory(newHistory);
  };

  const clearHistory = () => {
    saveHistory([]);
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}

export function CalculationHistory({ onRestore }: CalculationHistoryProps) {
  const { history, removeFromHistory, clearHistory } = useCalculationHistory();
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: '2-digit' 
    });
    const end = new Date(endDate).toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: '2-digit' 
    });
    return `${start} - ${end}`;
  };

  const getInterestTypeLabel = (type: string) => {
    return type === 'simple' ? 'Simple Interest' : 'Compound Interest';
  };

  const handleRestore = (entry: HistoryEntry) => {
    onRestore(entry);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">History</span>
          {history.length > 0 && (
            <span className="bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full font-medium">
              {history.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Calculation History
          </SheetTitle>
          <SheetDescription>
            Last {history.length} calculation{history.length !== 1 ? 's' : ''} (max {MAX_HISTORY_ITEMS})
          </SheetDescription>
        </SheetHeader>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="p-4 bg-muted/50 rounded-full mb-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No calculation history yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              History will be saved when you calculate interest
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-end mt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-2">
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      Confirm Clear History
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to clear all calculation history? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={clearHistory}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear History
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <ScrollArea className="h-[calc(100vh-200px)] mt-4 pr-4">
              <div className="space-y-3">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-xl border bg-card hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(entry.timestamp)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromHistory(entry.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-foreground">
                          ${formatNumber(entry.depositAmount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDateRange(entry.startDate, entry.endDate)}
                        <span className="text-xs">({entry.result.totalDays} days)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-success font-medium">
                          +${formatNumber(entry.result.totalInterest)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({getInterestTypeLabel(entry.interestType)})
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 gap-2"
                      onClick={() => handleRestore(entry)}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restore this calculation
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
