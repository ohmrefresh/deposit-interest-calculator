import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import Decimal from "decimal.js";
import { InterestTier, TierResult, formatNumber } from "@/lib/interest-calculator";

interface DailyBreakdownTableProps {
  startDate: string;
  endDate: string;
  depositAmount: string;
  tiers: InterestTier[];
  tierResults: TierResult[];
  interestType: 'simple' | 'compound';
  applyType: 'daily' | 'monthly' | 'biannually' | 'annually';
}

interface DailyEntry {
  date: string;
  tierInterests: string[];
}

interface MonthData {
  month: string;
  startBalance: string;
  endBalance: string;
  days: DailyEntry[];
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

function splitAmountByTiers(amount: string, tiers: InterestTier[]) {
  const result: { min: string; max: string; rate: string; amount: string }[] = [];
  
  // Validate amount before processing
  if (!amount || amount.trim() === '' || isNaN(parseFloat(amount))) {
    return result;
  }
  
  const totalAmount = new Decimal(amount);
  let processedAmount = new Decimal(0);

  const sortedTiers = [...tiers].sort((a, b) => 
    parseFloat(a.min || '0') - parseFloat(b.min || '0')
  );

  for (const tier of sortedTiers) {
    // Skip tiers with invalid data
    if (!tier.min || !tier.rate) continue;
    
    const tierMin = new Decimal(tier.min);
    const tierMax = tier.max ? new Decimal(tier.max) : null;

    if (processedAmount.gte(totalAmount)) break;
    if (totalAmount.lt(tierMin)) continue;

    let tierAmount = new Decimal(0);

    if (tierMax) {
      const remainingAmount = totalAmount.minus(processedAmount);
      const maxCanPlace = tierMax.minus(processedAmount);
      tierAmount = Decimal.min(maxCanPlace, remainingAmount);
    } else {
      if (totalAmount.gte(tierMin)) {
        tierAmount = totalAmount.minus(processedAmount);
      }
    }

    if (tierAmount.gt(0)) {
      result.push({
        min: tier.min,
        max: tier.max,
        rate: tier.rate,
        amount: tierAmount.toString()
      });
      processedAmount = processedAmount.plus(tierAmount);
    }
  }

  return result;
}

function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let totalDays = 0;
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    totalDays++;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return totalDays;
}

function calculateSimpleInterest(principal: string, rate: string, days: number): Decimal {
  // Validate inputs
  if (!principal || principal.trim() === '' || !rate || rate.trim() === '') {
    return new Decimal(0);
  }
  
  const P = new Decimal(principal);
  const R = new Decimal(rate).div(100);
  const D = new Decimal(days);
  
  return P.times(R).times(D.div(365));
}

function calculateCompoundInterest(principal: string, rate: string, days: number): Decimal {
  // Validate inputs
  if (!principal || principal.trim() === '' || !rate || rate.trim() === '') {
    return new Decimal(0);
  }
  
  const P = new Decimal(principal);
  const R = new Decimal(rate).div(100);
  const years = new Decimal(days).div(365);
  
  const A = P.times(Decimal.pow(new Decimal(1).plus(R), years));
  return A.minus(P);
}

export function DailyBreakdownTable({
  startDate,
  endDate,
  depositAmount,
  tiers,
  tierResults,
  interestType,
  applyType
}: DailyBreakdownTableProps) {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // Validate required inputs
  if (!depositAmount || !startDate || !endDate || depositAmount.trim() === '') {
    return null;
  }

  const toggleMonth = (month: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(month)) {
      newExpanded.delete(month);
    } else {
      newExpanded.add(month);
    }
    setExpandedMonths(newExpanded);
  };

  // Generate monthly data with daily breakdown
  const monthlyData: MonthData[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Validate deposit amount for Decimal
  const parsedAmount = parseFloat(depositAmount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return null;
  }
  
  let currentBalance = new Decimal(depositAmount);
  
  let tempDate = new Date(start.getFullYear(), start.getMonth(), 1);
  
  while (tempDate <= end) {
    const monthStart = new Date(tempDate);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    const actualEnd = monthEnd > end ? end : monthEnd;
    
    const monthDisplay = monthStart.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    
    // Calculate month interest
    const monthDays = calculateDays(
      monthStart.toISOString().split('T')[0],
      actualEnd.toISOString().split('T')[0]
    );
    
    const monthTierSplit = splitAmountByTiers(currentBalance.toString(), tiers);
    let monthInterest = new Decimal(0);
    
    for (const tierData of monthTierSplit) {
      let interest: Decimal;
      if (interestType === 'simple') {
        interest = calculateSimpleInterest(tierData.amount, tierData.rate, monthDays);
      } else {
        interest = calculateCompoundInterest(tierData.amount, tierData.rate, monthDays);
      }
      monthInterest = monthInterest.plus(interest);
    }
    
    // Check if should apply this month
    const nextMonthStart = new Date(monthEnd.getFullYear(), monthEnd.getMonth() + 1, 1);
    let shouldApplyThisMonth = false;
    
    if (nextMonthStart <= end) {
      if (applyType === 'daily' || applyType === 'monthly') {
        shouldApplyThisMonth = true;
      } else if (applyType === 'biannually') {
        shouldApplyThisMonth = (monthEnd.getMonth() === 5 || monthEnd.getMonth() === 11);
      } else if (applyType === 'annually') {
        shouldApplyThisMonth = (monthEnd.getMonth() === 11);
      }
    }
    
    const balanceBeforeApply = new Decimal(currentBalance);
    if (shouldApplyThisMonth) {
      currentBalance = currentBalance.plus(monthInterest);
    }
    
    // Generate daily entries
    const dailyEntries: DailyEntry[] = [];
    let dayBalance = new Decimal(balanceBeforeApply);
    let currentDate = new Date(monthStart);
    
    while (currentDate <= actualEnd) {
      const dateStr = currentDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
      
      const year = currentDate.getFullYear();
      const daysInYear = getDaysInYear(year);
      
      const tierSplitForDay = splitAmountByTiers(dayBalance.toString(), tiers);
      
      const tierInterests: string[] = tierResults.map(tier => {
        const tierDataForDay = tierSplitForDay.find(t => t.rate === tier.rate);
        let dailyInterest = new Decimal(0);
        
        if (tierDataForDay) {
          const dailyRate = new Decimal(tier.rate).div(daysInYear).div(100);
          dailyInterest = new Decimal(tierDataForDay.amount).times(dailyRate);
        }
        
        return dailyInterest.toString();
      });
      
      dailyEntries.push({ date: dateStr, tierInterests });
      
      // For daily apply type, compound daily
      if (applyType === 'daily') {
        let dayInterest = new Decimal(0);
        for (const tierDataForDay of tierSplitForDay) {
          const dailyRate = new Decimal(tierDataForDay.rate).div(daysInYear).div(100);
          dayInterest = dayInterest.plus(new Decimal(tierDataForDay.amount).times(dailyRate));
        }
        dayBalance = dayBalance.plus(dayInterest);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    monthlyData.push({
      month: monthDisplay,
      startBalance: balanceBeforeApply.toString(),
      endBalance: currentBalance.toString(),
      days: dailyEntries
    });
    
    tempDate.setMonth(tempDate.getMonth() + 1);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        Daily Interest Breakdown by Tier (Grouped by Month)
      </h3>
      
      <div className="space-y-3">
        {monthlyData.map((monthData, idx) => (
          <div 
            key={idx} 
            className="border rounded-lg overflow-hidden bg-card"
          >
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
              onClick={() => toggleMonth(monthData.month)}
            >
              <div className="text-left">
                <span className="font-semibold text-primary">{monthData.month}</span>
                <span className="text-sm text-muted-foreground ml-4">
                  Start: {formatNumber(monthData.startBalance)} $ → End: {formatNumber(monthData.endBalance)} $
                </span>
              </div>
              {expandedMonths.has(monthData.month) ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
            
            {expandedMonths.has(monthData.month) && (
              <div className="overflow-x-auto max-h-96 overflow-y-auto border-t">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0">
                    <TableRow>
                      <TableHead className="font-medium">Date</TableHead>
                      {tierResults.map((tier, i) => {
                        const range = tier.max 
                          ? `${formatNumber(tier.min)}-${formatNumber(tier.max)}`
                          : `${formatNumber(tier.min)}+`;
                        return (
                          <TableHead key={i} className="text-right font-medium">
                            <div>{range}</div>
                            <div className="text-xs text-muted-foreground">{formatNumber(tier.rate, 2)}%</div>
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthData.days.map((day, dayIdx) => (
                      <TableRow key={dayIdx} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{day.date}</TableCell>
                        {day.tierInterests.map((interest, tierIdx) => (
                          <TableCell key={tierIdx} className="text-right text-sm">
                            {formatNumber(interest, 10)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
