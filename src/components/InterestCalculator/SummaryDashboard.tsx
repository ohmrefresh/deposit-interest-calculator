import { Card, CardContent } from "@/components/ui/card";
import { CalculationResult } from "@/lib/interest-calculator";
import { AnimatedCounter } from "./AnimatedCounter";
import { 
  TrendingUp, 
  Wallet, 
  CalendarDays, 
  PiggyBank, 
  Percent,
  ArrowUpRight
} from "lucide-react";

interface SummaryDashboardProps {
  result: CalculationResult;
  depositAmount: string;
}

export function SummaryDashboard({ result, depositAmount }: SummaryDashboardProps) {
  const deposit = parseFloat(depositAmount) || 0;
  const totalInterest = parseFloat(result.totalInterest) || 0;
  const finalAmount = parseFloat(result.finalAmount) || 0;
  const totalDays = result.totalDays;
  
  const returnPercentage = deposit > 0 ? (totalInterest / deposit) * 100 : 0;
  const annualizedReturn = totalDays > 0 ? (returnPercentage / totalDays) * 365 : 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Hero Stats - Clean gradient card */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 md:p-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center md:text-left">
              <p className="text-white/70 text-xs mb-1.5 font-medium uppercase tracking-wide">Initial Deposit</p>
              <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                <AnimatedCounter value={deposit} decimals={2} suffix=" $" />
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-white/70 text-xs mb-1.5 font-medium uppercase tracking-wide">Interest Earned</p>
              <p className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-emerald-300" />
                <AnimatedCounter value={totalInterest} decimals={2} prefix="+" suffix=" $" />
              </p>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-white/70 text-xs mb-1.5 font-medium uppercase tracking-wide">Net Total</p>
              <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                <AnimatedCounter value={finalAmount} decimals={2} suffix=" $" />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bento-item border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-xl">
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground truncate">Principal</p>
                <p className="text-sm font-semibold text-foreground truncate">
                  <AnimatedCounter value={deposit} decimals={0} suffix=" $" duration={800} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bento-item border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground truncate">Interest</p>
                <p className="text-sm font-semibold text-primary truncate">
                  <AnimatedCounter value={totalInterest} decimals={2} suffix=" $" duration={1000} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bento-item border-success/20 bg-success/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-xl">
                <PiggyBank className="h-4 w-4 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground truncate">Total</p>
                <p className="text-sm font-semibold text-success truncate">
                  <AnimatedCounter value={finalAmount} decimals={2} suffix=" $" duration={1200} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bento-item border-secondary/20 bg-secondary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-xl">
                <Percent className="h-4 w-4 text-secondary" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground truncate">Return</p>
                <p className="text-sm font-semibold text-secondary truncate">
                  <AnimatedCounter value={returnPercentage} decimals={2} suffix="%" duration={1400} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress & Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="bento-item border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Duration</span>
              </div>
              <span className="text-sm font-semibold">{totalDays} days</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Annual Return</span>
              </div>
              <span className="text-sm font-semibold text-primary">
                <AnimatedCounter value={annualizedReturn} decimals={2} suffix="%" duration={1600} />
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bento-item border-border/50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Return on Deposit</span>
              <span className="text-sm font-semibold text-primary">
                <AnimatedCounter value={returnPercentage} decimals={2} suffix="%" duration={1400} />
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full gradient-primary rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${Math.min(returnPercentage * 10, 100)}%`,
                  animation: 'grow-width 1s ease-out forwards'
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes grow-width {
          from { width: 0%; }
        }
      `}</style>
    </div>
  );
}
