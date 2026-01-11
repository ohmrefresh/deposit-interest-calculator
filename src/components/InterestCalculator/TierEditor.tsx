import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InterestTier } from "@/lib/interest-calculator";
import { Layers, Plus, Trash2, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { useMemo } from "react";

interface TierEditorProps {
  tiers: InterestTier[];
  setTiers: (tiers: InterestTier[]) => void;
  error?: string;
}

interface TierValidation {
  minValid: boolean;
  maxValid: boolean;
  rateValid: boolean;
  minMessage?: string;
  maxMessage?: string;
  rateMessage?: string;
  overlapWarning?: string;
}

export function TierEditor({ tiers, setTiers, error }: TierEditorProps) {
  const formatWithComma = (value: string): string => {
    if (!value) return '';
    // Remove existing commas
    const cleanValue = value.replace(/,/g, '');
    // Check if it's a valid number
    if (isNaN(parseFloat(cleanValue))) return value;
    
    // Split into integer and decimal parts
    const parts = cleanValue.split('.');
    // Add commas to integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    // Return with original decimal part preserved
    return parts.join('.');
  };

  const formatWithCommaFixed = (value: string): string => {
    if (!value) return '';
    const cleanValue = value.replace(/,/g, '');
    const num = parseFloat(cleanValue);
    if (isNaN(num)) return value;
    const parts = num.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const parseValue = (value: string): string => {
    return value.replace(/,/g, '');
  };

  const updateTier = (index: number, field: keyof InterestTier, value: string) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: parseValue(value) };
    setTiers(newTiers);
  };

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1];
    let newMin = '0.00';
    
    if (lastTier?.max) {
      newMin = (parseFloat(lastTier.max) + 0.01).toFixed(2);
    } else if (lastTier?.min) {
      newMin = (parseFloat(lastTier.min) + 1000000).toFixed(2);
    }
    
    setTiers([...tiers, { min: newMin, max: '', rate: '0.00' }]);
  };

  const removeTier = (index: number) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter((_, i) => i !== index));
    }
  };

  // Validate tiers
  const tierValidations = useMemo((): TierValidation[] => {
    return tiers.map((tier, index) => {
      const validation: TierValidation = {
        minValid: true,
        maxValid: true,
        rateValid: true
      };

      // Min validation
      const minNum = parseFloat(tier.min || '0');
      if (!tier.min || tier.min.trim() === '') {
        validation.minValid = false;
        validation.minMessage = 'Please enter minimum amount';
      } else if (isNaN(minNum)) {
        validation.minValid = false;
        validation.minMessage = 'Invalid number format';
      } else if (minNum < 0) {
        validation.minValid = false;
        validation.minMessage = 'Must be greater than or equal to 0';
      }

      // Max validation (optional field)
      if (tier.max && tier.max.trim() !== '') {
        const maxNum = parseFloat(tier.max);
        if (isNaN(maxNum)) {
          validation.maxValid = false;
          validation.maxMessage = 'Invalid number format';
        } else if (maxNum <= minNum) {
          validation.maxValid = false;
          validation.maxMessage = 'Must be greater than minimum';
        }
      }

      // Rate validation
      const rateNum = parseFloat(tier.rate || '0');
      if (!tier.rate || tier.rate.trim() === '') {
        validation.rateValid = false;
        validation.rateMessage = 'Please enter interest rate';
      } else if (isNaN(rateNum)) {
        validation.rateValid = false;
        validation.rateMessage = 'Invalid number format';
      } else if (rateNum < 0) {
        validation.rateValid = false;
        validation.rateMessage = 'Must be greater than or equal to 0';
      } else if (rateNum > 100) {
        validation.rateValid = false;
        validation.rateMessage = 'Should not exceed 100%';
      }

      // Check for overlap with previous tier
      if (index > 0) {
        const prevTier = tiers[index - 1];
        const prevMax = parseFloat(prevTier.max || '0');
        if (prevTier.max && minNum <= prevMax) {
          validation.overlapWarning = `Overlaps with tier ${index} (should be > ${formatWithComma(prevTier.max)})`;
        }
      }

      return validation;
    });
  }, [tiers]);

  const allValid = tierValidations.every(v => v.minValid && v.rateValid);

  return (
    <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="section-header">
        <div className="p-2 bg-secondary/10 rounded-xl">
          <Layers className="h-4 w-4 text-secondary" />
        </div>
        <h2 className="text-base font-semibold text-foreground">Tiered Interest Rates</h2>
      </div>

      {/* Helper text */}
      <div className="mb-4 p-3 rounded-xl bg-muted/30 border border-border/50">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>Define deposit ranges and different interest rates for each tier</p>
            <p className="text-muted-foreground/70">Leave "Maximum" empty for the last tier (unlimited amount)</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {tiers.map((tier, index) => {
          const validation = tierValidations[index];
          const hasIssue = !validation.minValid || !validation.maxValid || !validation.rateValid || validation.overlapWarning;
          
          return (
            <div
              key={index}
              className={`tier-card p-4 ${hasIssue ? 'border-warning/40' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs font-semibold ${
                    hasIssue ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-sm text-muted-foreground font-medium">Tier {index + 1}</span>
                  {!hasIssue && validation.minValid && validation.rateValid && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  )}
                </div>
                {tiers.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTier(index)}
                    className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Minimum <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={formatWithComma(tier.min)}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/,/g, '');
                      updateTier(index, 'min', rawValue);
                    }}
                    onBlur={(e) => {
                      const rawValue = e.target.value.replace(/,/g, '');
                      if (rawValue && !isNaN(parseFloat(rawValue))) {
                        updateTier(index, 'min', parseFloat(rawValue).toFixed(2));
                      }
                    }}
                    className={`h-10 input-modern text-sm ${!validation.minValid ? 'border-destructive' : ''}`}
                  />
                  {!validation.minValid && validation.minMessage && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validation.minMessage}
                    </p>
                  )}
                  {validation.overlapWarning && (
                    <p className="text-xs text-warning flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validation.overlapWarning}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Maximum
                  </Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="Unlimited"
                    value={tier.max ? formatWithComma(tier.max) : ''}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/,/g, '');
                      updateTier(index, 'max', rawValue);
                    }}
                    onBlur={(e) => {
                      const rawValue = e.target.value.replace(/,/g, '');
                      if (rawValue && !isNaN(parseFloat(rawValue))) {
                        updateTier(index, 'max', parseFloat(rawValue).toFixed(2));
                      }
                    }}
                    className={`h-10 input-modern text-sm ${!validation.maxValid ? 'border-destructive' : ''}`}
                  />
                  {!validation.maxValid && validation.maxMessage && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validation.maxMessage}
                    </p>
                  )}
                  {!tier.max && index === tiers.length - 1 && (
                    <p className="text-[11px] text-muted-foreground">Leave empty = Unlimited</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Rate (% per year) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={tier.rate}
                    onChange={(e) => updateTier(index, 'rate', e.target.value)}
                    className={`h-10 input-modern text-sm font-medium text-primary ${!validation.rateValid ? 'border-destructive' : ''}`}
                  />
                  {!validation.rateValid && validation.rateMessage && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validation.rateMessage}
                    </p>
                  )}
                  {validation.rateValid && parseFloat(tier.rate) > 0 && (
                    <p className="text-[11px] text-success flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {parseFloat(tier.rate) <= 1 ? 'Low rate' : parseFloat(tier.rate) <= 2.5 ? 'Normal rate' : 'High rate'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <Button
          type="button"
          onClick={addTier}
          variant="outline"
          className="w-full h-10 border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors rounded-xl text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Interest Rate Tier
        </Button>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/5 border border-destructive/15">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-destructive font-medium">{error}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Check the data in each tier</p>
            </div>
          </div>
        )}

        {allValid && tiers.length > 0 && !error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/15">
            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
            <p className="text-sm text-success font-medium">
              Interest rate tiers configured ({tiers.length} tier{tiers.length > 1 ? 's' : ''})
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
