import Decimal from 'decimal.js';

// Configure Decimal.js for high precision
Decimal.set({ precision: 50, rounding: Decimal.ROUND_HALF_UP });

export interface InterestTier {
  min: string;
  max: string;
  rate: string;
}

export interface TierResult {
  min: string;
  max: string;
  rate: string;
  amount: string;
  interest: string;
}

export interface MonthlyBreakdown {
  date: string;
  days: number;
  balance: string;
  interest: string;
  cumulative: string;
  accrued: string;
  applied: boolean;
}

export interface CalculationResult {
  totalInterest: string;
  finalAmount: string;
  accruedInterest: string;
  breakdown: MonthlyBreakdown[];
  tierResults: TierResult[];
  totalDays: number;
}

// Format number with Thai Baht decimal places
export function formatTHB(value: string): string {
  return new Decimal(value).toFixed(2, Decimal.ROUND_HALF_UP);
}

// Format number with commas
export function formatNumber(value: string, decimals: number = 2): string {
  const parts = new Decimal(value).toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

// Parse input value (remove commas)
export function parseInputValue(value: string): string {
  return value.replace(/,/g, '');
}

// Check if year is leap year
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Get days in year
function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

// Calculate days between two dates (inclusive)
export function calculateDays(startDate: string, endDate: string): number {
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

// Split amount by tiers
export function splitAmountByTiers(amount: string, tiers: InterestTier[]): TierResult[] {
  const result: TierResult[] = [];
  const totalAmount = new Decimal(amount);
  let processedAmount = new Decimal(0);

  // Sort tiers by minimum amount
  const sortedTiers = [...tiers].sort((a, b) => 
    parseFloat(a.min) - parseFloat(b.min)
  );

  for (const tier of sortedTiers) {
    const tierMin = new Decimal(tier.min);
    const tierMax = tier.max ? new Decimal(tier.max) : null;

    if (processedAmount.gte(totalAmount)) {
      break;
    }

    if (totalAmount.lt(tierMin)) {
      continue;
    }

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
        amount: tierAmount.toString(),
        interest: '0'
      });
      processedAmount = processedAmount.plus(tierAmount);
    }
  }

  return result;
}

// Calculate simple interest
function calculateSimpleInterest(principal: string, rate: string, days: number): Decimal {
  const P = new Decimal(principal);
  const R = new Decimal(rate).div(100);
  const D = new Decimal(days);
  
  return P.times(R).times(D.div(365));
}

// Calculate compound interest
function calculateCompoundInterest(principal: string, rate: string, days: number): Decimal {
  const P = new Decimal(principal);
  const R = new Decimal(rate).div(100);
  const years = new Decimal(days).div(365);
  
  const A = P.times(Decimal.pow(new Decimal(1).plus(R), years));
  return A.minus(P);
}

// Main calculation function
export function calculateInterest(
  depositAmount: string,
  startDate: string,
  endDate: string,
  tiers: InterestTier[],
  interestType: 'simple' | 'compound',
  applyType: 'daily' | 'monthly' | 'biannually' | 'annually'
): CalculationResult {
  const breakdown: MonthlyBreakdown[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let currentBalance = new Decimal(depositAmount);
  let cumulativeInterest = new Decimal(0);
  let accruedInterest = new Decimal(0);

  // Calculate total days
  const totalDays = calculateDays(startDate, endDate);

  // Generate monthly data
  const monthlyData: { monthStart: Date; monthEnd: Date; displayMonth: string }[] = [];
  const tempDate = new Date(start.getFullYear(), start.getMonth(), 1);
  
  while (tempDate <= end) {
    const monthStart = new Date(tempDate);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    const actualEnd = monthEnd > end ? end : monthEnd;
    
    monthlyData.push({
      monthStart: new Date(monthStart),
      monthEnd: actualEnd,
      displayMonth: monthStart.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    });
    
    tempDate.setMonth(tempDate.getMonth() + 1);
  }

  // Process each month
  for (const monthInfo of monthlyData) {
    const monthStart = monthInfo.monthStart;
    const monthEnd = monthInfo.monthEnd;
    
    const daysInMonth = calculateDays(
      monthStart.toISOString().split('T')[0],
      monthEnd.toISOString().split('T')[0]
    );

    const tierSplit = splitAmountByTiers(currentBalance.toString(), tiers);
    let monthInterest = new Decimal(0);

    for (const tierData of tierSplit) {
      const tierAmount = new Decimal(tierData.amount);
      let interest: Decimal;
      if (interestType === 'simple') {
        interest = calculateSimpleInterest(tierAmount.toString(), tierData.rate, daysInMonth);
      } else {
        interest = calculateCompoundInterest(tierAmount.toString(), tierData.rate, daysInMonth);
      }
      monthInterest = monthInterest.plus(interest);
    }

    // Check if should apply interest this month
    let shouldApply = false;
    
    if (applyType === 'daily') {
      shouldApply = true;
    } else if (applyType === 'monthly') {
      const nextMonthStart = new Date(monthEnd.getFullYear(), monthEnd.getMonth() + 1, 1);
      shouldApply = nextMonthStart <= end;
    } else if (applyType === 'biannually') {
      shouldApply = monthEnd.getMonth() === 5 || monthEnd.getMonth() === 11;
    } else if (applyType === 'annually') {
      shouldApply = monthEnd.getMonth() === 11;
    }

    if (shouldApply) {
      const totalApplyInterest = accruedInterest.plus(monthInterest);
      cumulativeInterest = cumulativeInterest.plus(totalApplyInterest);
      currentBalance = currentBalance.plus(totalApplyInterest);
      accruedInterest = new Decimal(0);

      breakdown.push({
        date: monthInfo.displayMonth,
        days: daysInMonth,
        balance: currentBalance.toString(),
        interest: monthInterest.toString(),
        cumulative: cumulativeInterest.toString(),
        accrued: '0.00',
        applied: true
      });
    } else {
      accruedInterest = accruedInterest.plus(monthInterest);

      breakdown.push({
        date: monthInfo.displayMonth,
        days: daysInMonth,
        balance: currentBalance.toString(),
        interest: monthInterest.toString(),
        cumulative: cumulativeInterest.plus(accruedInterest).toString(),
        accrued: accruedInterest.toString(),
        applied: false
      });
    }
  }

  // Calculate tier results for display
  const tierSplit = splitAmountByTiers(depositAmount, tiers);
  const tierResults: TierResult[] = tierSplit.map(tierData => {
    let interest: Decimal;
    if (interestType === 'simple') {
      interest = calculateSimpleInterest(tierData.amount, tierData.rate, totalDays);
    } else {
      interest = calculateCompoundInterest(tierData.amount, tierData.rate, totalDays);
    }

    return {
      ...tierData,
      interest: interest.toString()
    };
  });

  return {
    totalInterest: cumulativeInterest.plus(accruedInterest).toString(),
    finalAmount: currentBalance.plus(accruedInterest).toString(),
    accruedInterest: accruedInterest.toString(),
    breakdown,
    tierResults,
    totalDays
  };
}
