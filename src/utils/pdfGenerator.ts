import jsPDF from 'jspdf';
import { JewelryItem, JewelerStoreProfile, OldGoldExchange, Invoice } from '../types';
import { formatGrams, formatINR } from './calculator';

export interface EstimatePdfData {
  item: JewelryItem;
  oldGoldExchange?: OldGoldExchange;
  profile: JewelerStoreProfile;
}

/**
 * Cleanly generates a formal PDF document for a single Jewelry Price Estimate quotation
 */
export function generateEstimatePdf(data: EstimatePdfData): { doc: jsPDF; filename: string; blob: Blob } {
  const { item, oldGoldExchange, profile } = data;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 18;

  // Header background bar (Luxury Gold / Deep Stone)
  doc.setFillColor(28, 25, 23); // #1c1917
  doc.rect(margin, currentY, contentWidth, 26, 'F');

  // Store Brand Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(profile.storeName.toUpperCase(), margin + 6, currentY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(214, 211, 209);
  doc.text(
    `${profile.tagline || 'Certified Hallmarked Jewelry & Bullion Dealer'}`,
    margin + 6,
    currentY + 16
  );
  doc.text(
    `Tel: ${profile.phone}  |  ${profile.cityState}`,
    margin + 6,
    currentY + 21
  );

  // Estimate Badge on Right
  doc.setFillColor(217, 119, 6); // amber-600
  doc.roundedRect(pageWidth - margin - 52, currentY + 6, 46, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('PRICE ESTIMATE', pageWidth - margin - 29, currentY + 14, { align: 'center' });

  currentY += 32;

  // Document metadata box
  doc.setFillColor(250, 250, 249);
  doc.setDrawColor(231, 229, 228);
  doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(87, 83, 78);
  const estimateNo = `EST-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  doc.text(`Quotation No: ${estimateNo}`, margin + 5, currentY + 9);
  doc.text(`Date: ${dateStr}`, margin + 65, currentY + 9);
  if (profile.gstin) {
    doc.text(`Store GSTIN: ${profile.gstin}`, margin + 120, currentY + 9);
  }

  currentY += 20;

  // Section Heading: Item Specification
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(69, 26, 3);
  doc.text('JEWELRY SPECIFICATIONS & METAL DETAILS', margin, currentY);
  currentY += 4;

  // Table Header
  doc.setFillColor(245, 245, 244);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(68, 64, 60);

  doc.text('DESCRIPTION', margin + 4, currentY + 5);
  doc.text('PURITY', margin + 70, currentY + 5);
  doc.text('GROSS WT', margin + 102, currentY + 5);
  doc.text('NET WT', margin + 128, currentY + 5);
  doc.text('RATE / GRAM', margin + 152, currentY + 5);

  currentY += 7;

  // Item details row
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(28, 25, 23);
  doc.text(item.name, margin + 4, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${item.purityKarat} (${item.purityPercentage}%)`, margin + 70, currentY + 5.5);
  doc.text(formatGrams(item.grossWeightGrams), margin + 102, currentY + 5.5);
  doc.text(formatGrams(item.netWeightGrams), margin + 128, currentY + 5.5);
  doc.text(formatINR(item.ratePerGramApplied), margin + 152, currentY + 5.5);

  // Subtle separator line
  doc.setDrawColor(231, 229, 228);
  doc.line(margin, currentY + 8, margin + contentWidth, currentY + 8);
  currentY += 13;

  // Section: Cost Breakdown Card
  doc.setFillColor(254, 252, 248);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(margin, currentY, contentWidth, 68, 2, 2, 'FD');

  let rowY = currentY + 7;
  const leftX = margin + 6;
  const rightX = margin + contentWidth - 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(120, 53, 15);
  doc.text('COST & CHARGES BREAKDOWN', leftX, rowY);
  rowY += 6;

  const addBreakdownRow = (label: string, value: string, isBold = false, isAccent = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(isAccent ? 180 : 68, isAccent ? 83 : 64, isAccent ? 9 : 60);
    doc.text(label, leftX, rowY);
    doc.text(value, rightX, rowY, { align: 'right' });
    rowY += 5;
  };

  addBreakdownRow(
    `Pure Metal Value (${formatGrams(item.netWeightGrams)} @ ${formatINR(item.ratePerGramApplied)}/g)`,
    formatINR(item.pureMetalCost)
  );

  if (item.wastageGrams > 0) {
    addBreakdownRow(
      `Wastage / Melting Allowance (${formatGrams(item.wastageGrams)})`,
      formatINR(item.wastageCost)
    );
  }

  addBreakdownRow(
    `Making / Crafting Charges (${item.makingChargeType.replace('_', ' ')})`,
    formatINR(item.totalMakingCharge)
  );

  if (item.stoneValue > 0) {
    addBreakdownRow(
      `Stones / Studded Gems Value (${formatGrams(item.stoneWeightGrams)})`,
      formatINR(item.stoneValue)
    );
  }

  if (item.hallmarkFee > 0) {
    addBreakdownRow('Govt. BIS Hallmarking & Laser Inscription Fee', formatINR(item.hallmarkFee));
  }

  // Divider
  doc.setDrawColor(229, 231, 235);
  doc.line(leftX, rowY, rightX, rowY);
  rowY += 5;

  addBreakdownRow('Taxable Subtotal', formatINR(item.itemTaxableAmount), true);

  const gstVal = Math.round((item.itemTaxableAmount * profile.defaultGstPercent) / 100);
  addBreakdownRow(`GST (${profile.defaultGstPercent}% Total)`, `+ ${formatINR(gstVal)}`);

  const grandTotal = item.itemTaxableAmount + gstVal;

  let oldVal = 0;
  if (oldGoldExchange?.enabled && oldGoldExchange.totalExchangeValue > 0) {
    oldVal = oldGoldExchange.totalExchangeValue;
    addBreakdownRow(
      `Less Old Metal Credit (${oldGoldExchange.description || 'Old Exchange'} - ${formatGrams(oldGoldExchange.weightGrams)})`,
      `- ${formatINR(oldVal)}`,
      true,
      true
    );
  }

  currentY += 74;

  // Net Estimated Amount Card (Prominent Gold Banner)
  const netEstimated = Math.max(0, grandTotal - oldVal);
  doc.setFillColor(28, 25, 23);
  doc.roundedRect(margin, currentY, contentWidth, 18, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(253, 230, 138); // amber-200
  doc.text('TOTAL ESTIMATED PRICE (INCL. GST):', margin + 8, currentY + 11);

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(formatINR(netEstimated), margin + contentWidth - 8, currentY + 12, { align: 'right' });

  currentY += 26;

  // Important Terms & Conditions
  doc.setFillColor(245, 245, 244);
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(120, 53, 15);
  doc.text('IMPORTANT TERMS & CONDITIONS:', margin + 5, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(87, 83, 78);
  const terms = [
    '• This is an approximate commercial estimate and not a tax invoice.',
    '• Gold and Silver rates fluctuate daily and are locked only upon order confirmation or advance booking.',
    '• Actual weights may vary minutely (+/-) after final finishing, polish, and hallmarking.',
    '• All gold jewelry is certified 100% compliant with Bureau of Indian Standards (BIS) Hallmark with HUID.',
  ];

  terms.forEach((t, i) => {
    doc.text(t, margin + 5, currentY + 12 + i * 5);
  });

  currentY += 40;

  // Signature Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(28, 25, 23);
  doc.text(`For ${profile.storeName}`, margin + contentWidth - 50, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 113, 108);
  doc.text('Authorized Signatory', margin + contentWidth - 50, currentY + 10);

  const cleanItemName = item.name.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Estimate_${cleanItemName}_${estimateNo}.pdf`;
  const blob = doc.output('blob');

  return { doc, filename, blob };
}

/**
 * Generates and triggers WhatsApp share for an Estimate
 * Uses Web Share API (native WhatsApp file attachment with PDF on mobile & modern browsers),
 * and provides instant fallback download + pre-filled WhatsApp message.
 */
export async function shareEstimateViaWhatsAppWithPdf(data: EstimatePdfData): Promise<{ sharedAsFile: boolean }> {
  const { filename, blob, doc } = generateEstimatePdf(data);
  const { item, oldGoldExchange, profile } = data;

  const gstVal = Math.round((item.itemTaxableAmount * profile.defaultGstPercent) / 100);
  const total = item.itemTaxableAmount + gstVal;
  const oldVal = oldGoldExchange?.enabled ? oldGoldExchange.totalExchangeValue : 0;
  const net = Math.max(0, total - oldVal);

  const summaryMessage = 
    `✨ *OFFICIAL JEWELRY PRICE ESTIMATE PDF* ✨\n` +
    `*${profile.storeName.toUpperCase()}*\n` +
    `📍 ${profile.cityState} • 📞 ${profile.phone}\n` +
    `---------------------------------\n` +
    `💍 *Item:* ${item.name}\n` +
    `• Purity: ${item.purityKarat} (${item.purityPercentage}%)\n` +
    `• Gross Wt: ${formatGrams(item.grossWeightGrams)} | Net Wt: ${formatGrams(item.netWeightGrams)}\n` +
    `• Rate Applied: ${formatINR(item.ratePerGramApplied)}/g\n` +
    `• Total Estimated: *${formatINR(net)}* (Incl. ${profile.defaultGstPercent}% GST)\n` +
    `---------------------------------\n` +
    `📄 *Attached:* Detailed PDF estimate with complete metal & making charges breakdown.`;

  // Create standard File object from PDF blob
  const file = new File([blob], filename, { type: 'application/pdf' });

  // 1. Check if navigator.share supports file sharing (works on Chrome Android, Safari iOS, Edge, macOS)
  if (
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        title: `Jewelry Estimate - ${item.name}`,
        text: summaryMessage,
        files: [file],
      });
      return { sharedAsFile: true };
    } catch (err: any) {
      // User cancelled share or window closed
      if (err.name === 'AbortError') {
        return { sharedAsFile: false };
      }
      console.warn('Native share failed, using fallback:', err);
    }
  }

  // 2. High-reliability fallback (e.g. desktop web browser without native Web Share files):
  // Automatically trigger PDF download so the user has the file, then open WhatsApp with summary text
  doc.save(filename);

  const waUrl = `https://wa.me/?text=${encodeURIComponent(
    summaryMessage + `\n\n*(PDF estimate "${filename}" has been generated and downloaded to your device)*`
  )}`;
  window.open(waUrl, '_blank');

  return { sharedAsFile: false };
}

/**
 * Cleanly generates a formal PDF document for a full Invoice / Tax Bill
 */
export function generateInvoicePdf(invoice: Invoice, profile: JewelerStoreProfile): { doc: jsPDF; filename: string; blob: Blob } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 16;

  // Header Box
  doc.setFillColor(28, 25, 23);
  doc.rect(margin, currentY, contentWidth, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(profile.storeName.toUpperCase(), margin + 6, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(214, 211, 209);
  doc.text(profile.tagline || 'Hallmarked Jewelry & Bullion Merchant', margin + 6, currentY + 17);
  doc.text(`${profile.address}, ${profile.cityState} • Tel: ${profile.phone}`, margin + 6, currentY + 23);

  // Tax Invoice Badge
  doc.setFillColor(217, 119, 6);
  doc.roundedRect(pageWidth - margin - 46, currentY + 7, 40, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('TAX INVOICE', pageWidth - margin - 26, currentY + 15.5, { align: 'center' });

  currentY += 34;

  // Customer & Bill Details 2-Column Box
  doc.setFillColor(250, 250, 249);
  doc.setDrawColor(231, 229, 228);
  doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(69, 26, 3);
  doc.text('BILLED TO (CUSTOMER):', margin + 4, currentY + 6);
  doc.text('INVOICE DETAILS:', margin + 105, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(28, 25, 23);
  doc.text(`Name: ${invoice.customer.name}`, margin + 4, currentY + 12);
  doc.text(`Phone: ${invoice.customer.phone}`, margin + 4, currentY + 17);
  if (invoice.customer.address) {
    doc.text(`Address: ${invoice.customer.address}`, margin + 4, currentY + 21);
  }

  doc.text(`Bill No: ${invoice.invoiceNumber}`, margin + 105, currentY + 12);
  doc.text(`Date: ${invoice.date}`, margin + 105, currentY + 17);
  if (profile.gstin) {
    doc.text(`GSTIN: ${profile.gstin}`, margin + 105, currentY + 21);
  }

  currentY += 28;

  // Items Table
  doc.setFillColor(245, 245, 244);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(68, 64, 60);

  doc.text('#', margin + 2, currentY + 5);
  doc.text('ITEM DESCRIPTION', margin + 8, currentY + 5);
  doc.text('PURITY', margin + 64, currentY + 5);
  doc.text('GROSS WT', margin + 88, currentY + 5);
  doc.text('NET WT', margin + 112, currentY + 5);
  doc.text('RATE/G', margin + 134, currentY + 5);
  doc.text('AMOUNT', margin + contentWidth - 4, currentY + 5, { align: 'right' });

  currentY += 7;

  invoice.items.forEach((it, idx) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(28, 25, 23);

    doc.text(`${idx + 1}`, margin + 2, currentY + 5.5);
    doc.setFont('helvetica', 'bold');
    doc.text(it.name, margin + 8, currentY + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${it.purityKarat}`, margin + 64, currentY + 5.5);
    doc.text(formatGrams(it.grossWeightGrams), margin + 88, currentY + 5.5);
    doc.text(formatGrams(it.netWeightGrams), margin + 112, currentY + 5.5);
    doc.text(formatINR(it.ratePerGramApplied), margin + 134, currentY + 5.5);
    doc.setFont('helvetica', 'bold');
    doc.text(formatINR(it.itemTaxableAmount), margin + contentWidth - 4, currentY + 5.5, { align: 'right' });

    doc.setDrawColor(240, 240, 240);
    doc.line(margin, currentY + 8, margin + contentWidth, currentY + 8);
    currentY += 9;
  });

  currentY += 4;

  // Bill Financial Summary Card
  doc.setFillColor(254, 252, 248);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(margin + 80, currentY, contentWidth - 80, 46, 2, 2, 'FD');

  let sY = currentY + 7;
  const sLeft = margin + 84;
  const sRight = margin + contentWidth - 4;

  const addSummaryRow = (label: string, val: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.setTextColor(bold ? 120 : 68, bold ? 53 : 64, bold ? 15 : 60);
    doc.text(label, sLeft, sY);
    doc.text(val, sRight, sY, { align: 'right' });
    sY += 5;
  };

  addSummaryRow('Taxable Total:', formatINR(invoice.subtotalTaxable));
  addSummaryRow(`Total GST (${profile.defaultGstPercent}%):`, `+ ${formatINR(invoice.totalGst)}`);

  if (invoice.discount > 0) {
    addSummaryRow('Special Discount:', `- ${formatINR(invoice.discount)}`);
  }

  if (invoice.oldGoldExchange?.enabled && invoice.oldGoldExchange.totalExchangeValue > 0) {
    addSummaryRow('Old Metal Credit:', `- ${formatINR(invoice.oldGoldExchange.totalExchangeValue)}`, true);
  }

  doc.setDrawColor(229, 231, 235);
  doc.line(sLeft, sY, sRight, sY);
  sY += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(28, 25, 23);
  doc.text('Final Total:', sLeft, sY);
  doc.text(formatINR(invoice.finalTotal), sRight, sY, { align: 'right' });

  // Payment Status Box on Left
  doc.setFillColor(245, 245, 244);
  doc.roundedRect(margin, currentY, 74, 46, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(28, 25, 23);
  doc.text('PAYMENT DETAILS', margin + 4, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Status: ${invoice.payment.status.toUpperCase()}`, margin + 4, currentY + 14);
  doc.text(`Payment Mode: ${invoice.payment.method.toUpperCase()}`, margin + 4, currentY + 20);
  doc.text(`Paid Amount: ${formatINR(invoice.payment.paidAmount)}`, margin + 4, currentY + 26);
  if (invoice.payment.balanceAmount && invoice.payment.balanceAmount > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(190, 18, 60);
    doc.text(`Pending Balance: ${formatINR(invoice.payment.balanceAmount)}`, margin + 4, currentY + 33);
    if (invoice.payment.dueDate) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(87, 83, 78);
      doc.text(`Due Date: ${invoice.payment.dueDate}`, margin + 4, currentY + 39);
    }
  }

  const filename = `Invoice_${invoice.invoiceNumber}.pdf`;
  const blob = doc.output('blob');
  return { doc, filename, blob };
}

/**
 * Generates and triggers WhatsApp share for an Invoice / Bill with PDF
 */
export async function shareInvoiceViaWhatsAppWithPdf(invoice: Invoice, profile: JewelerStoreProfile): Promise<{ sharedAsFile: boolean }> {
  const { filename, blob, doc } = generateInvoicePdf(invoice, profile);

  const summaryMessage = 
    `📜 *OFFICIAL TAX INVOICE BILL PDF* 📜\n` +
    `*${profile.storeName.toUpperCase()}*\n` +
    `📍 ${profile.cityState} • 📞 ${profile.phone}\n` +
    `---------------------------------\n` +
    `🧾 *Invoice No:* ${invoice.invoiceNumber}\n` +
    `👤 *Customer:* ${invoice.customer.name} (${invoice.customer.phone})\n` +
    `📅 *Date:* ${invoice.date}\n` +
    `💰 *Grand Total:* *${formatINR(invoice.finalTotal)}*\n` +
    `💳 *Status:* ${invoice.payment.status.toUpperCase()}\n` +
    (invoice.payment.balanceAmount && invoice.payment.balanceAmount > 0
      ? `⚠️ *Balance Due:* ${formatINR(invoice.payment.balanceAmount)}\n`
      : '') +
    `---------------------------------\n` +
    `📄 *Attached:* Official Tax Invoice PDF. Thank you for your business!`;

  const file = new File([blob], filename, { type: 'application/pdf' });

  if (
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        title: `Invoice #${invoice.invoiceNumber} - ${profile.storeName}`,
        text: summaryMessage,
        files: [file],
      });
      return { sharedAsFile: true };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { sharedAsFile: false };
      }
      console.warn('Native share failed, using fallback:', err);
    }
  }

  // Fallback: download PDF and open WhatsApp
  doc.save(filename);

  const waUrl = `https://wa.me/${invoice.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    summaryMessage + `\n\n*(Tax Invoice PDF "${filename}" has been generated and downloaded to your device)*`
  )}`;
  window.open(waUrl, '_blank');

  return { sharedAsFile: false };
}
