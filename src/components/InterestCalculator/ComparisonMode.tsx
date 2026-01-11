import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, GitCompare, TrendingUp } from "lucide-react";
import {
  InterestTier,
  calculateInterest,
  formatNumber,
  parseInputValue,
} from "@/lib/interest-calculator";

interface Scenario {
  id: string;
  name: string;
  depositAmount: string;
  interestType: 'simple' | 'compound';
  interestApply: 'daily' | 'monthly' | 'biannually' | 'annually';
  color: string;
}

interface ComparisonModeProps {
  startDate: string;
  endDate: string;
  tiers: InterestTier[];
  baseDepositAmount: string;
  baseInterestType: 'simple' | 'compound';
  baseInterestApply: 'daily' | 'monthly' | 'biannually' | 'annually';
}

const SCENARIO_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function ComparisonMode({
  startDate,
  endDate,
  tiers,
  baseDepositAmount,
  baseInterestType,
  baseInterestApply,
}: ComparisonModeProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: "1",
      name: "Scenario 1",
      depositAmount: baseDepositAmount || "1000000",
      interestType: baseInterestType,
      interestApply: baseInterestApply,
      color: SCENARIO_COLORS[0],
    },
    {
      id: "2",
      name: "Scenario 2",
      depositAmount: "2000000",
      interestType: baseInterestType,
      interestApply: baseInterestApply,
      color: SCENARIO_COLORS[1],
    },
  ]);

  const formatWithComma = (value: string): string => {
    if (!value) return '';
    const num = parseFloat(value.replace(/,/g, ''));
    if (isNaN(num)) return value;
    const parts = num.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const addScenario = () => {
    if (scenarios.length >= 5) return;
    const newId = String(Date.now());
    setScenarios([
      ...scenarios,
      {
        id: newId,
        name: `Scenario ${scenarios.length + 1}`,
        depositAmount: "1500000",
        interestType: baseInterestType,
        interestApply: baseInterestApply,
        color: SCENARIO_COLORS[scenarios.length % SCENARIO_COLORS.length],
      },
    ]);
  };

  const removeScenario = (id: string) => {
    if (scenarios.length <= 1) return;
    setScenarios(scenarios.filter((s) => s.id !== id));
  };

  const updateScenario = (id: string, field: keyof Scenario, value: string) => {
    setScenarios(
      scenarios.map((s) =>
        s.id === id ? { ...s, [field]: field === 'depositAmount' ? parseInputValue(value) : value } : s
      )
    );
  };

  // Calculate results for all scenarios
  const results = useMemo(() => {
    if (!startDate || !endDate || tiers.length === 0) return [];

    return scenarios.map((scenario) => {
      const amount = parseInputValue(scenario.depositAmount);
      if (!amount || parseFloat(amount) <= 0) {
        return {
          scenario,
          result: null,
        };
      }

      const result = calculateInterest(
        amount,
        startDate,
        endDate,
        tiers,
        scenario.interestType,
        scenario.interestApply
      );

      return {
        scenario,
        result,
      };
    });
  }, [scenarios, startDate, endDate, tiers]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (results.length === 0 || !results[0].result) return [];

    const maxLength = Math.max(
      ...results.filter((r) => r.result).map((r) => r.result!.breakdown.length)
    );

    const data: Record<string, any>[] = [];

    for (let i = 0; i < maxLength; i++) {
      const entry: Record<string, any> = {};

      results.forEach((r, idx) => {
        if (r.result && r.result.breakdown[i]) {
          if (idx === 0) {
            entry.month = r.result.breakdown[i].date.replace(/\d{4}/, '').trim();
            entry.fullDate = r.result.breakdown[i].date;
          }
          entry[`balance_${r.scenario.id}`] = parseFloat(r.result.breakdown[i].balance);
          entry[`interest_${r.scenario.id}`] = parseFloat(r.result.breakdown[i].cumulative);
          entry[`name_${r.scenario.id}`] = r.scenario.name;
        }
      });

      if (Object.keys(entry).length > 0) {
        data.push(entry);
      }
    }

    return data;
  }, [results]);

  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    scenarios.forEach((s) => {
      config[`balance_${s.id}`] = {
        label: s.name,
        color: s.color,
      };
    });
    return config;
  }, [scenarios]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Comparison Mode
          </h3>
        </div>
        <Button
          onClick={addScenario}
          disabled={scenarios.length >= 5}
          size="sm"
          className="bg-success hover:bg-success/90"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Scenario
        </Button>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scenario, idx) => (
          <Card
            key={scenario.id}
            className="relative"
            style={{ borderLeftColor: scenario.color, borderLeftWidth: 4 }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Input
                  value={scenario.name}
                  onChange={(e) => updateScenario(scenario.id, "name", e.target.value)}
                  className="font-semibold text-base h-8 w-40"
                />
                {scenarios.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeScenario(scenario.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Deposit Amount
                </Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={formatWithComma(scenario.depositAmount)}
                  onChange={(e) => updateScenario(scenario.id, "depositAmount", e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Interest Type
                </Label>
                <Select
                  value={scenario.interestType}
                  onValueChange={(v) => updateScenario(scenario.id, "interestType", v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple Interest</SelectItem>
                    <SelectItem value="compound">Compound Interest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Interest Application
                </Label>
                <Select
                  value={scenario.interestApply}
                  onValueChange={(v) => updateScenario(scenario.id, "interestApply", v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="biannually">Biannually</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Results Comparison Table */}
      {results.some((r) => r.result) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Results Comparison Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium">Item</TableHead>
                    {results.map((r) => (
                      <TableHead
                        key={r.scenario.id}
                        className="text-right font-medium"
                        style={{ color: r.scenario.color }}
                      >
                        {r.scenario.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Deposit Amount</TableCell>
                    {results.map((r) => (
                      <TableCell key={r.scenario.id} className="text-right">
                        {formatNumber(r.scenario.depositAmount)} $
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Total Interest</TableCell>
                    {results.map((r) => (
                      <TableCell
                        key={r.scenario.id}
                        className="text-right font-semibold"
                        style={{ color: r.scenario.color }}
                      >
                        {r.result ? formatNumber(r.result.totalInterest) : "-"} $
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Final Amount</TableCell>
                    {results.map((r) => (
                      <TableCell
                        key={r.scenario.id}
                        className="text-right font-semibold"
                        style={{ color: r.scenario.color }}
                      >
                        {r.result ? formatNumber(r.result.finalAmount) : "-"} $
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Return (%)</TableCell>
                    {results.map((r) => {
                      const returnPct = r.result
                        ? (
                            (parseFloat(r.result.totalInterest) /
                              parseFloat(r.scenario.depositAmount)) *
                            100
                          ).toFixed(2)
                        : "-";
                      return (
                        <TableCell
                          key={r.scenario.id}
                          className="text-right font-semibold"
                          style={{ color: r.scenario.color }}
                        >
                          {returnPct}%
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
