import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CalculationResult, formatNumber, InterestTier } from "@/lib/interest-calculator";

interface ExportButtonsProps {
  result: CalculationResult;
  depositAmount: string;
  startDate: string;
  endDate: string;
  tiers: InterestTier[];
  interestType: 'simple' | 'compound';
  interestApply: 'daily' | 'monthly' | 'biannually' | 'annually';
}

export function ExportButtons({
  result,
  depositAmount,
  startDate,
  endDate,
  tiers,
  interestType,
  interestApply,
}: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const getInterestTypeLabel = () => {
    return interestType === 'simple' ? 'Simple Interest' : 'Compound Interest';
  };

  const getApplyTypeLabel = () => {
    const labels = {
      daily: 'Daily',
      monthly: 'Monthly',
      biannually: 'Biannually',
      annually: 'Annually',
    };
    return labels[interestApply];
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const resultsElement = document.getElementById('results');
      if (!resultsElement) {
        toast.error('Calculation results not found');
        return;
      }

      // Dynamically import jsPDF
      const { default: jsPDF } = await import('jspdf');
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;

      // Title
      pdf.setFontSize(18);
      pdf.setTextColor(102, 126, 234);
      pdf.text('Deposit Interest Calculation Report', pageWidth / 2, 20, { align: 'center' });

      // Summary info
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      let yPos = 35;

      pdf.text(`Report Date: ${new Date().toLocaleDateString('en-US')}`, margin, yPos);
      yPos += 7;
      pdf.text(`Period: ${startDate} to ${endDate}`, margin, yPos);
      yPos += 7;
      pdf.text(`Interest Type: ${getInterestTypeLabel()}`, margin, yPos);
      yPos += 7;
      pdf.text(`Interest Application: ${getApplyTypeLabel()}`, margin, yPos);
      yPos += 12;

      // Summary box
      pdf.setFillColor(248, 249, 250);
      pdf.rect(margin, yPos, pageWidth - margin * 2, 35, 'F');
      pdf.setDrawColor(102, 126, 234);
      pdf.rect(margin, yPos, pageWidth - margin * 2, 35, 'S');

      pdf.setFontSize(11);
      pdf.setTextColor(50, 50, 50);
      const boxY = yPos + 8;
      pdf.text(`Deposit Amount: ${formatNumber(depositAmount)}`, margin + 5, boxY);
      pdf.text(`Number of Days: ${result.totalDays}`, margin + 5, boxY + 8);
      pdf.setTextColor(102, 126, 234);
      pdf.text(`Total Interest: ${formatNumber(result.totalInterest)}`, margin + 5, boxY + 16);
      pdf.text(`Final Amount: ${formatNumber(result.finalAmount)}`, margin + 5, boxY + 24);

      yPos += 45;

      // Tier breakdown table
      pdf.setFontSize(12);
      pdf.setTextColor(50, 50, 50);
      pdf.text('Breakdown by Interest Rate Tier', margin, yPos);
      yPos += 8;

      // Table header
      pdf.setFillColor(102, 126, 234);
      pdf.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Amount Range', margin + 3, yPos + 5.5);
      pdf.text('Rate (%)', margin + 55, yPos + 5.5);
      pdf.text('Amount', margin + 85, yPos + 5.5);
      pdf.text('Interest', margin + 130, yPos + 5.5);
      yPos += 8;

      // Table rows
      pdf.setTextColor(50, 50, 50);
      result.tierResults.forEach((tier, idx) => {
        const bgColor = idx % 2 === 0 ? 255 : 245;
        pdf.setFillColor(bgColor, bgColor, bgColor);
        pdf.rect(margin, yPos, pageWidth - margin * 2, 7, 'F');

        const range = tier.max
          ? `${formatNumber(tier.min)} - ${formatNumber(tier.max)}`
          : `${formatNumber(tier.min)} and above`;

        pdf.text(range, margin + 3, yPos + 5);
        pdf.text(formatNumber(tier.rate, 2), margin + 55, yPos + 5);
        pdf.text(formatNumber(tier.amount), margin + 85, yPos + 5);
        pdf.text(formatNumber(tier.interest, 4), margin + 130, yPos + 5);
        yPos += 7;
      });

      yPos += 10;

      // Monthly breakdown (limited to fit page)
      if (yPos < pageHeight - 60) {
        pdf.setFontSize(12);
        pdf.text('Monthly Breakdown', margin, yPos);
        yPos += 8;

        pdf.setFillColor(102, 126, 234);
        pdf.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        pdf.text('Month', margin + 3, yPos + 5.5);
        pdf.text('Days', margin + 40, yPos + 5.5);
        pdf.text('Balance', margin + 55, yPos + 5.5);
        pdf.text('Interest', margin + 95, yPos + 5.5);
        pdf.text('Cumulative', margin + 130, yPos + 5.5);
        pdf.text('Status', margin + 160, yPos + 5.5);
        yPos += 8;

        pdf.setTextColor(50, 50, 50);
        const maxRows = Math.min(result.breakdown.length, Math.floor((pageHeight - yPos - 20) / 6));
        
        for (let i = 0; i < maxRows; i++) {
          const entry = result.breakdown[i];
          const bgColor = i % 2 === 0 ? 255 : 245;
          pdf.setFillColor(bgColor, bgColor, bgColor);
          pdf.rect(margin, yPos, pageWidth - margin * 2, 6, 'F');

          pdf.text(entry.date.substring(0, 15), margin + 3, yPos + 4);
          pdf.text(String(entry.days), margin + 40, yPos + 4);
          pdf.text(formatNumber(entry.balance), margin + 55, yPos + 4);
          pdf.text(formatNumber(entry.interest, 4), margin + 95, yPos + 4);
          pdf.text(formatNumber(entry.cumulative, 4), margin + 130, yPos + 4);
          pdf.text(entry.applied ? 'Applied' : 'Pending', margin + 160, yPos + 4);
          yPos += 6;
        }

        if (result.breakdown.length > maxRows) {
          pdf.setFontSize(8);
          pdf.setTextColor(150, 150, 150);
          pdf.text(`... and ${result.breakdown.length - maxRows} more entries (see full details in Excel)`, margin, yPos + 5);
        }
      }

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Generated by Deposit Interest Calculator', pageWidth / 2, pageHeight - 10, { align: 'center' });

      pdf.save(`interest-calculation-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Error exporting PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      // Dynamically import xlsx
      const XLSX = await import('xlsx');
      
      const workbook = XLSX.utils.book_new();

      // Summary sheet
      const summaryData = [
        ['Deposit Interest Calculation Report'],
        [],
        ['General Information'],
        ['Report Date', new Date().toLocaleDateString('en-US')],
        ['Start Date', startDate],
        ['End Date', endDate],
        ['Interest Type', getInterestTypeLabel()],
        ['Interest Application', getApplyTypeLabel()],
        [],
        ['Summary'],
        ['Deposit Amount', parseFloat(depositAmount)],
        ['Total Days', result.totalDays],
        ['Total Interest', parseFloat(result.totalInterest)],
        ['Accrued Interest', parseFloat(result.accruedInterest)],
        ['Final Amount', parseFloat(result.finalAmount)],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      summarySheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Tier breakdown sheet
      const tierData = [
        ['Breakdown by Interest Rate Tier'],
        [],
        ['Amount Range', 'Interest Rate (%)', 'Amount in Tier', 'Interest'],
        ...result.tierResults.map((tier) => {
          const range = tier.max
            ? `${formatNumber(tier.min)} - ${formatNumber(tier.max)}`
            : `${formatNumber(tier.min)} and above`;
          return [range, parseFloat(tier.rate), parseFloat(tier.amount), parseFloat(tier.interest)];
        }),
      ];
      const tierSheet = XLSX.utils.aoa_to_sheet(tierData);
      tierSheet['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 22 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(workbook, tierSheet, 'Interest Rate Tiers');

      // Monthly breakdown sheet
      const monthlyData = [
        ['Monthly Breakdown'],
        [],
        ['Date/Period', 'Days', 'Balance', 'Interest', 'Accrued Interest', 'Cumulative Interest', 'Status'],
        ...result.breakdown.map((entry) => [
          entry.date,
          entry.days,
          parseFloat(entry.balance),
          parseFloat(entry.interest),
          parseFloat(entry.accrued),
          parseFloat(entry.cumulative),
          entry.applied ? 'Applied' : 'Pending',
        ]),
      ];
      const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);
      monthlySheet['!cols'] = [
        { wch: 20 },
        { wch: 10 },
        { wch: 18 },
        { wch: 18 },
        { wch: 20 },
        { wch: 18 },
        { wch: 12 },
      ];
      XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly');

      // Tier settings sheet
      const tierSettingsData = [
        ['Interest Rate Tier Settings'],
        [],
        ['Minimum Amount', 'Maximum Amount', 'Interest Rate (%)'],
        ...tiers.map((tier) => [
          parseFloat(tier.min),
          tier.max ? parseFloat(tier.max) : 'Unlimited',
          parseFloat(tier.rate),
        ]),
      ];
      const tierSettingsSheet = XLSX.utils.aoa_to_sheet(tierSettingsData);
      tierSettingsSheet['!cols'] = [{ wch: 22 }, { wch: 22 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(workbook, tierSettingsSheet, 'Rate Settings');

      XLSX.writeFile(workbook, `interest-calculation-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel exported successfully');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('Error exporting Excel');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPDF} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4 text-red-500" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
