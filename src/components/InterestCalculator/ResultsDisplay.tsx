import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalculationResult, formatNumber, InterestTier } from "@/lib/interest-calculator";
import { Clock, CheckCircle2, BarChart3, ChevronRight } from "lucide-react";
import { DailyBreakdownTable } from "./DailyBreakdownTable";
import { SummaryDashboard } from "./SummaryDashboard";

interface ResultsDisplayProps {
  result: CalculationResult;
  depositAmount: string;
  startDate: string;
  endDate: string;
  tiers: InterestTier[];
  interestType: 'simple' | 'compound';
  interestApply: 'daily' | 'monthly' | 'biannually' | 'annually';
}

export function ResultsDisplay({ 
  result, 
  depositAmount, 
  startDate, 
  endDate, 
  tiers, 
  interestType, 
  interestApply 
}: ResultsDisplayProps) {
  return (
    <div className="animate-slide-up space-y-6">
      <div className="section-header">
        <div className="p-2 bg-success/10 rounded-xl">
          <BarChart3 className="h-4 w-4 text-success" />
        </div>
        <h2 className="text-base font-semibold text-foreground">Calculation Results</h2>
      </div>

      {/* Animated Summary Dashboard */}
      <SummaryDashboard result={result} depositAmount={depositAmount} />

      {/* Tier Breakdown Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-primary" />
          Breakdown by Interest Rate Tier
        </h3>
        <div className="table-modern rounded-xl overflow-hidden border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-header">
                <TableHead className="text-primary-foreground font-medium text-sm py-3">Amount Range</TableHead>
                <TableHead className="text-primary-foreground font-medium text-sm text-right py-3">Interest Rate (%)</TableHead>
                <TableHead className="text-primary-foreground font-medium text-sm text-right py-3">Amount in Tier</TableHead>
                <TableHead className="text-primary-foreground font-medium text-sm text-right py-3">Interest</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-card">
              {result.tierResults.map((tier, index) => {
                const range = tier.max
                  ? `${formatNumber(tier.min)} - ${formatNumber(tier.max)}`
                  : `${formatNumber(tier.min)} and above`;

                return (
                  <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-sm py-3">{range}</TableCell>
                    <TableCell className="text-right text-sm py-3">{formatNumber(tier.rate, 2)}</TableCell>
                    <TableCell className="text-right text-sm py-3">{formatNumber(tier.amount)}</TableCell>
                    <TableCell className="text-right font-medium text-primary text-sm py-3">{formatNumber(tier.interest, 10)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Daily Breakdown by Tier (Collapsible per month) */}
      <DailyBreakdownTable
        startDate={startDate}
        endDate={endDate}
        depositAmount={depositAmount}
        tiers={tiers}
        tierResults={result.tierResults}
        interestType={interestType}
        applyType={interestApply}
      />

      {/* Monthly Breakdown Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-secondary" />
          Monthly Breakdown
        </h3>
        <div className="table-modern overflow-x-auto rounded-xl border border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-primary-foreground font-medium text-sm">Date / Period</TableHead>
                <TableHead className="text-primary-foreground font-medium text-sm text-right">Days</TableHead>
                <TableHead className="text-primary-foreground font-medium text-sm text-right">Balance</TableHead>
                <TableHead className="text-primary-foreground font-medium text-sm text-right">Interest</TableHead>
                <TableHead className="text-primary-foreground font-medium text-sm text-right">Accrued</TableHead>
                <TableHead className="text-primary-foreground font-medium text-sm text-right">Cumulative</TableHead>
                <TableHead className="text-primary-foreground font-medium text-sm">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-card">
              {result.breakdown.map((entry, index) => (
                <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium text-sm">{entry.date}</TableCell>
                  <TableCell className="text-right text-sm">{entry.days}</TableCell>
                  <TableCell className="text-right text-sm">{formatNumber(entry.balance)}</TableCell>
                  <TableCell className="text-right text-sm">{formatNumber(entry.interest, 10)}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">{formatNumber(entry.accrued, 10)}</TableCell>
                  <TableCell className="text-right font-medium text-sm">{formatNumber(entry.cumulative, 10)}</TableCell>
                  <TableCell>
                    {entry.applied ? (
                      <span className="inline-flex items-center gap-1 text-success text-xs font-medium badge-soft bg-success/10">
                        <CheckCircle2 className="h-3 w-3" />
                        Applied
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-warning text-xs font-medium badge-soft bg-warning/10">
                        <Clock className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
