import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber, parseInputValue } from "@/lib/interest-calculator";
import { Banknote, Calendar, Calculator, RefreshCw, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useState, useEffect } from "react";

interface DepositFormProps {
  depositAmount: string;
  setDepositAmount: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  interestType: 'simple' | 'compound';
  setInterestType: (value: 'simple' | 'compound') => void;
  interestApply: 'daily' | 'monthly' | 'biannually' | 'annually';
  setInterestApply: (value: 'daily' | 'monthly' | 'biannually' | 'annually') => void;
  errors: Record<string, string>;
}

interface ValidationState {
  isValid: boolean;
  message: string;
  hint?: string;
}

export function DepositForm({
  depositAmount,
  setDepositAmount,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  interestType,
  setInterestType,
  interestApply,
  setInterestApply,
  errors
}: DepositFormProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [liveValidation, setLiveValidation] = useState<Record<string, ValidationState>>({});

  // Live validation for deposit amount
  useEffect(() => {
    if (!touched.depositAmount) return;
    
    const amount = parseInputValue(depositAmount);
    const numAmount = parseFloat(amount || '0');
    
    if (!depositAmount || depositAmount.trim() === '') {
      setLiveValidation(prev => ({
        ...prev,
        depositAmount: { 
          isValid: false, 
          message: 'Please enter deposit amount',
          hint: 'Example: 100,000 or 1000000'
        }
      }));
    } else if (isNaN(numAmount)) {
      setLiveValidation(prev => ({
        ...prev,
        depositAmount: { 
          isValid: false, 
          message: 'Invalid number format',
          hint: 'Use numbers only, e.g. 100000.00'
        }
      }));
    } else if (numAmount <= 0) {
      setLiveValidation(prev => ({
        ...prev,
        depositAmount: { 
          isValid: false, 
          message: 'Amount must be greater than 0',
          hint: 'Enter the amount you want to deposit'
        }
      }));
    } else if (numAmount > 999999999999) {
      setLiveValidation(prev => ({
        ...prev,
        depositAmount: { 
          isValid: false, 
          message: 'Amount is too large',
          hint: 'Maximum limit is 999,999,999,999'
        }
      }));
    } else {
      setLiveValidation(prev => ({
        ...prev,
        depositAmount: { 
          isValid: true, 
          message: `$${formatNumber(parseInputValue(depositAmount))}`,
          hint: numAmount >= 1000000 ? '💰 Large deposit amount' : undefined
        }
      }));
    }
  }, [depositAmount, touched.depositAmount]);

  // Live validation for dates
  useEffect(() => {
    if (!touched.startDate && !touched.endDate) return;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) {
        setLiveValidation(prev => ({
          ...prev,
          dateRange: { 
            isValid: false, 
            message: 'End date must be after start date',
            hint: 'Select a new end date'
          }
        }));
      } else {
        const years = Math.floor(diffDays / 365);
        const months = Math.floor((diffDays % 365) / 30);
        const days = diffDays % 30;
        
        let durationText = '';
        if (years > 0) durationText += `${years} year${years > 1 ? 's' : ''} `;
        if (months > 0) durationText += `${months} month${months > 1 ? 's' : ''} `;
        if (days > 0) durationText += `${days} day${days > 1 ? 's' : ''}`;
        
        setLiveValidation(prev => ({
          ...prev,
          dateRange: { 
            isValid: true, 
            message: `Duration: ${diffDays} days`,
            hint: durationText.trim() || undefined
          }
        }));
      }
    }
  }, [startDate, endDate, touched.startDate, touched.endDate]);

  const handleAmountChange = (value: string) => {
    setDepositAmount(parseInputValue(value));
  };

  const handleAmountBlur = () => {
    setTouched(prev => ({ ...prev, depositAmount: true }));
    const cleanValue = parseInputValue(depositAmount);
    if (cleanValue && !isNaN(parseFloat(cleanValue))) {
      setDepositAmount(formatNumber(cleanValue));
    }
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'startDate') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  };

  const getValidationIcon = (validation: ValidationState | undefined) => {
    if (!validation) return null;
    if (validation.isValid) {
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    }
    return <AlertCircle className="h-4 w-4 text-destructive" />;
  };

  return (
    <section className="animate-fade-in">
      <div className="section-header">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Banknote className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-base font-semibold text-foreground">Deposit Information</h2>
      </div>
      
      <div className="space-y-5">
        {/* Deposit Amount Field */}
        <div className="space-y-2">
          <Label htmlFor="depositAmount" className="text-sm text-muted-foreground font-medium">
            Deposit Amount
          </Label>
          <div className="relative">
            <Input
              id="depositAmount"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={depositAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              onBlur={handleAmountBlur}
              onFocus={() => setTouched(prev => ({ ...prev, depositAmount: true }))}
              className={`text-base h-11 input-modern pr-10 ${
                errors.depositAmount 
                  ? 'border-destructive focus-visible:ring-destructive/20' 
                  : liveValidation.depositAmount?.isValid 
                    ? 'border-success/40' 
                    : ''
              }`}
            />
            {touched.depositAmount && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {getValidationIcon(liveValidation.depositAmount)}
              </div>
            )}
          </div>
          
          {/* Error or validation feedback */}
          {errors.depositAmount ? (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-destructive/5 border border-destructive/15">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-destructive font-medium">{errors.depositAmount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Example: 100,000 or 1,000,000.00</p>
              </div>
            </div>
          ) : liveValidation.depositAmount && touched.depositAmount ? (
            <div className={`flex items-start gap-2 p-2.5 rounded-xl border ${
              liveValidation.depositAmount.isValid 
                ? 'bg-success/5 border-success/15' 
                : 'bg-warning/5 border-warning/15'
            }`}>
              {liveValidation.depositAmount.isValid ? (
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
              ) : (
                <Info className="h-4 w-4 text-warning mt-0.5 shrink-0" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  liveValidation.depositAmount.isValid ? 'text-success' : 'text-warning'
                }`}>
                  {liveValidation.depositAmount.message}
                </p>
               
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Info className="h-3 w-3" />
              Enter the amount to calculate interest
            </p>
          )}
        </div>

        {/* Date Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-primary/60" />
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className={`h-11 input-modern ${errors.startDate ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
            />
            {errors.startDate && (
              <div className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.startDate}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-primary/60" />
              End Date
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className={`h-11 input-modern ${errors.endDate ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
            />
            {errors.endDate && (
              <div className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.endDate}
              </div>
            )}
          </div>
        </div>

        {/* Date range validation feedback */}
        {liveValidation.dateRange && (touched.startDate || touched.endDate) && (
          <div className={`flex items-start gap-2 p-2.5 rounded-xl border ${
            liveValidation.dateRange.isValid 
              ? 'bg-muted/30 border-border/60' 
              : 'bg-destructive/5 border-destructive/15'
          }`}>
            {liveValidation.dateRange.isValid ? (
              <Calendar className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            )}
            <div>
              <p className={`text-sm font-medium ${
                liveValidation.dateRange.isValid ? 'text-foreground' : 'text-destructive'
              }`}>
                {liveValidation.dateRange.message}
              </p>
              {liveValidation.dateRange.hint && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {liveValidation.dateRange.hint}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Interest Type & Apply Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <Calculator className="h-3.5 w-3.5 text-primary/60" />
              Interest Calculation Type
            </Label>
            <Select value={interestType} onValueChange={(v) => setInterestType(v as 'simple' | 'compound')}>
              <SelectTrigger className="h-11 input-modern">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple Interest</SelectItem>
                <SelectItem value="compound">Compound Interest (Annually)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {interestType === 'simple' 
                ? 'Calculated from original principal throughout the period' 
                : 'Interest is added to principal every year'}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 text-primary/60" />
              Interest Application
            </Label>
            <Select value={interestApply} onValueChange={(v) => setInterestApply(v as 'daily' | 'monthly' | 'biannually' | 'annually')}>
              <SelectTrigger className="h-11 input-modern">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="biannually">Biannually</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {interestApply === 'daily' && 'Interest is added to account daily'}
              {interestApply === 'monthly' && 'Interest is added at the end of each month'}
              {interestApply === 'biannually' && 'Interest is added every 6 months'}
              {interestApply === 'annually' && 'Interest is added once per year'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
