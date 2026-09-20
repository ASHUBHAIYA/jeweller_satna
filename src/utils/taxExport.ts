import { CATaxExportSummary, Invoice, JewelerStoreProfile } from '../types';

export function generateCATaxReportJSON(
  invoices: Invoice[],
  profile: JewelerStoreProfile,
  periodLabel: string = 'Current Financial Period'
): CATaxExportSummary {
  let totalTaxableValue = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;
  let totalGSTCollected = 0;
  let totalRevenue = 0;
  let totalGoldWeightSoldGrams = 0;
  let totalSilverWeightSoldGrams = 0;

  const hsnMap: Record<string, {
    description: string;
    uqc: string;
    quantity: number;
    taxable: number;
    cgst: number;
    sgst: number;
    igst: number;
  }> = {
    '7113': {
      description: 'Articles of jewelry and parts thereof, of precious metal (Gold/Platinum)',
      uqc: 'GMS',
      quantity: 0,
      taxable: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
    },
    '7114': {
      description: 'Articles of goldsmiths or silversmiths wares and parts thereof (Silver)',
      uqc: 'GMS',
      quantity: 0,
      taxable: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
    },
  };

  invoices.forEach((inv) => {
    totalTaxableValue += inv.subtotalTaxable;
    totalCGST += inv.cgstAmount;
    totalSGST += inv.sgstAmount;
    totalIGST += inv.igstAmount;
    totalGSTCollected += inv.totalGst;
    totalRevenue += inv.finalTotal;

    inv.items.forEach((item) => {
      const hsn = item.hsnCode || (item.metal === 'silver' ? '7114' : '7113');
      if (!hsnMap[hsn]) {
        hsnMap[hsn] = {
          description: item.metal === 'silver' ? 'Silver Articles' : 'Precious Jewelry',
          uqc: 'GMS',
          quantity: 0,
          taxable: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
        };
      }

      hsnMap[hsn].quantity += item.netWeightGrams;
      hsnMap[hsn].taxable += item.itemTaxableAmount;
      hsnMap[hsn].cgst += Math.round((item.itemTaxableAmount * 0.015));
      hsnMap[hsn].sgst += Math.round((item.itemTaxableAmount * 0.015));

      if (item.metal === 'gold') {
        totalGoldWeightSoldGrams += item.netWeightGrams;
      } else if (item.metal === 'silver') {
        totalSilverWeightSoldGrams += item.netWeightGrams;
      }
    });
  });

  const hsnSummary = Object.entries(hsnMap).map(([code, data]) => ({
    hsnCode: code,
    description: data.description,
    uqc: data.uqc,
    totalQuantityGrams: Number(data.quantity.toFixed(3)),
    totalTaxableValue: Math.round(data.taxable),
    integratedTaxAmount: Math.round(data.igst),
    centralTaxAmount: Math.round(data.cgst),
    stateTaxAmount: Math.round(data.sgst),
  }));

  return {
    exportDate: new Date().toISOString(),
    financialPeriod: periodLabel,
    storeInfo: {
      storeName: profile.storeName,
      gstin: profile.gstin,
      bisLicense: profile.bisHallmarkLicense,
    },
    totalInvoicesCount: invoices.length,
    totalTaxableValue: Math.round(totalTaxableValue),
    totalCGST: Math.round(totalCGST),
    totalSGST: Math.round(totalSGST),
    totalIGST: Math.round(totalIGST),
    totalGSTCollected: Math.round(totalGSTCollected),
    totalRevenue: Math.round(totalRevenue),
    totalGoldWeightSoldGrams: Number(totalGoldWeightSoldGrams.toFixed(3)),
    totalSilverWeightSoldGrams: Number(totalSilverWeightSoldGrams.toFixed(3)),
    hsnSummary,
    transactions: invoices,
  };
}

export function downloadTaxJson(report: CATaxExportSummary, filename?: string): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const name = filename || `GST_Tax_Report_${report.storeInfo.gstin || 'Jeweler'}_${new Date().toISOString().slice(0, 10)}.json`;
  downloadAnchor.setAttribute('download', name);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function generateCATaxCSV(invoices: Invoice[], profile: JewelerStoreProfile): string {
  const headers = [
    'Invoice Number',
    'Date',
    'Customer Name',
    'Customer Phone',
    'Customer PAN/Aadhaar',
    'Items Count',
    'Total Net Weight (g)',
    'Taxable Value (INR)',
    'GST Rate (%)',
    'CGST (INR)',
    'SGST (INR)',
    'Total GST (INR)',
    'Old Gold Adjusted (INR)',
    'Discount (INR)',
    'Round Off (INR)',
    'Invoice Total (INR)',
    'Payment Mode',
    'Payment Status',
  ];

  const rows = invoices.map((inv) => {
    const totalWeight = inv.items.reduce((sum, it) => sum + it.netWeightGrams, 0).toFixed(3);
    const oldGoldVal = inv.oldGoldExchange?.enabled ? inv.oldGoldExchange.totalExchangeValue : 0;
    return [
      `"${inv.invoiceNumber}"`,
      `"${inv.date}"`,
      `"${inv.customer.name.replace(/"/g, '""')}"`,
      `"${inv.customer.phone}"`,
      `"${inv.customer.panOrAadhaar || ''}"`,
      inv.items.length,
      totalWeight,
      inv.subtotalTaxable,
      `${inv.gstRate}%`,
      inv.cgstAmount,
      inv.sgstAmount,
      inv.totalGst,
      oldGoldVal,
      inv.discount,
      inv.roundOff,
      inv.finalTotal,
      `"${inv.payment.method}"`,
      `"${inv.payment.status}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function downloadTaxCSV(invoices: Invoice[], profile: JewelerStoreProfile): void {
  const csvContent = generateCATaxCSV(invoices, profile);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `GSTR1_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
