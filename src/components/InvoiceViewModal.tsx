import React from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  ShieldCheck, 
  Coins, 
  Phone, 
  MapPin, 
  FileText 
} from 'lucide-react';
import { Invoice, JewelerStoreProfile } from '../types';
import { formatGrams, formatINR } from '../utils/calculator';
import { shareInvoiceViaWhatsAppWithPdf, generateInvoicePdf } from '../utils/pdfGenerator';

interface InvoiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  profile: JewelerStoreProfile;
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  isOpen,
  onClose,
  invoice,
  profile,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    try {
      // 1. Create a dedicated print iframe for maximum cross-browser compatibility
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.top = '-10000px';
      printFrame.style.left = '-10000px';
      printFrame.style.width = '1000px';
      printFrame.style.height = '1000px';
      document.body.appendChild(printFrame);

      const invoiceContainer = document.getElementById('invoice-print-container');
      if (invoiceContainer && printFrame.contentWindow) {
        const doc = printFrame.contentWindow.document;
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Invoice_${invoice.invoiceNumber}_${profile.storeName}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { 
                font-family: 'Plus Jakarta Sans', sans-serif; 
                font-size: 11px; 
                color: #1c1917; 
                padding: 24px; 
                background: #ffffff; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .font-cinzel { font-family: 'Cinzel', serif; }
              .font-mono-num { font-family: 'JetBrains Mono', monospace; }
              table { width: 100%; border-collapse: collapse; margin: 12px 0; }
              th, td { border: 1px solid #e7e5e4; padding: 6px 8px; font-size: 11px; text-align: left; }
              th { background: #f5f5f4; font-weight: 700; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .font-bold { font-weight: 700; }
              .text-amber-900 { color: #78350f; }
              .text-amber-950 { color: #451a03; }
              .text-emerald-800 { color: #065f46; }
              .text-rose-700 { color: #be123c; }
              .bg-amber-50 { background-color: #fffbeb; }
              .bg-rose-50 { background-color: #fff1f2; }
              .bg-emerald-50 { background-color: #ecfdf5; }
              .bg-stone-50 { background-color: #fafaf9; }
              .border { border: 1px solid #e7e5e4; }
              .border-b { border-bottom: 1px solid #e7e5e4; }
              .border-b-2 { border-bottom: 2px solid #78350f; }
              .p-3 { padding: 12px; }
              .p-2 { padding: 8px; }
              .rounded-xl { border-radius: 12px; }
              .rounded-lg { border-radius: 8px; }
              @page { size: A4 portrait; margin: 10mm; }
            </style>
          </head>
          <body>
            ${invoiceContainer.innerHTML}
          </body>
          </html>
        `);
        doc.close();

        setTimeout(() => {
          try {
            printFrame.contentWindow?.focus();
            printFrame.contentWindow?.print();
          } catch {
            window.print();
          } finally {
            setTimeout(() => {
              if (document.body.contains(printFrame)) {
                document.body.removeChild(printFrame);
              }
            }, 1500);
          }
        }, 300);
        return;
      }
    } catch (e) {
      console.warn('Iframe print failed, falling back to window.print', e);
    }

    // Direct fallback
    window.print();
  };

  const handleDownloadBill = () => {
    const invoiceContainer = document.getElementById('invoice-print-container');
    if (!invoiceContainer) return;

    const htmlDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice_${invoice.invoiceNumber}_${profile.storeName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: #1c1917; padding: 32px; background: #fff; max-width: 850px; margin: 0 auto; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .font-cinzel { font-family: 'Cinzel', serif; }
    table { width: 100%; border-collapse: collapse; margin: 14px 0; }
    th, td { border: 1px solid #e7e5e4; padding: 8px 10px; font-size: 11px; text-align: left; }
    th { background: #f5f5f4; font-weight: 700; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 700; }
    @media print { body { padding: 0; max-width: 100%; } }
  </style>
</head>
<body>
  ${invoiceContainer.innerHTML}
  <script>
    window.onload = function() {
      // Auto-trigger print for convenience when opened in browser
      setTimeout(function() { window.print(); }, 400);
    };
  <\/script>
</body>
</html>`;

    const blob = new Blob([htmlDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${invoice.invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateWhatsAppMessage = (): string => {
    const itemsList = invoice.items
      .map(
        (it, idx) =>
          `${idx + 1}. *${it.name}*\n   • Purity: ${it.purityKarat} (${it.purityPercentage}%)\n   • Net Wt: ${formatGrams(it.netWeightGrams)}\n   • Rate: ${formatINR(it.ratePerGramApplied)}/g\n   • Amount: ${formatINR(it.itemTaxableAmount)}`
      )
      .join('\n\n');

    const oldGoldNote = invoice.oldGoldExchange?.enabled
      ? `\n\n🔄 *Old Gold Exchange Credit:*\n- ${invoice.oldGoldExchange.description} (${formatGrams(invoice.oldGoldExchange.weightGrams)}): -${formatINR(invoice.oldGoldExchange.totalExchangeValue)}`
      : '';

    const isPartial = invoice.payment.status === 'partial';
    const isPending = invoice.payment.status === 'pending';

    let paymentBreakdown = '';
    if (isPartial) {
      paymentBreakdown = `\n---------------------------------\n` +
        `💵 *Advance Received:* ${formatINR(invoice.payment.paidAmount)}\n` +
        `⚠️ *PENDING UDHAR BALANCE:* ${formatINR(invoice.payment.balanceAmount)}\n` +
        (invoice.payment.dueDate ? `📅 *Promise Due Date:* ${invoice.payment.dueDate}\n` : '');
    } else if (isPending) {
      paymentBreakdown = `\n---------------------------------\n` +
        `⚠️ *PAYMENT STATUS: FULL CREDIT / UDHAR*\n` +
        `🔴 *Outstanding Balance:* ${formatINR(invoice.payment.balanceAmount || invoice.finalTotal)}\n` +
        (invoice.payment.dueDate ? `📅 *Promise Due Date:* ${invoice.payment.dueDate}\n` : '');
    } else {
      paymentBreakdown = `\n---------------------------------\n` +
        `✅ *Payment Status:* Paid in Full (${formatINR(invoice.finalTotal)})\n` +
        `💳 *Mode:* ${invoice.payment.method.toUpperCase()}\n`;
    }

    return `✨ *TAX INVOICE / BILL ESTIMATE* ✨\n*${profile.storeName.toUpperCase()}*\n${profile.tagline}\n📍 ${profile.address}, ${profile.cityState}\n📞 Contact: ${profile.phone}\nGSTIN: ${profile.gstin} | BIS Hallmark: ${profile.bisHallmarkLicense}\n` +
      `---------------------------------\n` +
      `📄 *Bill No:* ${invoice.invoiceNumber}\n` +
      `📅 *Date:* ${invoice.date}\n` +
      `👤 *Customer:* ${invoice.customer.name} (${invoice.customer.phone})\n` +
      `---------------------------------\n` +
      `*PURCHASED ITEMS:*\n\n${itemsList}${oldGoldNote}\n\n` +
      `---------------------------------\n` +
      `💰 *Taxable Subtotal:* ${formatINR(invoice.subtotalTaxable)}\n` +
      `🏛️ *GST (3%):* ${formatINR(invoice.totalGst)}\n` +
      (invoice.discount > 0 ? `🏷️ *Discount:* -${formatINR(invoice.discount)}\n` : '') +
      `⭐ *TOTAL BILL AMOUNT:* ${formatINR(invoice.finalTotal)}` +
      paymentBreakdown +
      `---------------------------------\n` +
      `Thank you for your patronage! All jewelry is 100% BIS Hallmarked with govt HUID certification.`;
  };

  const [isSharingPdf, setIsSharingPdf] = React.useState(false);

  const handleShareWhatsApp = async () => {
    try {
      setIsSharingPdf(true);
      await shareInvoiceViaWhatsAppWithPdf(invoice, profile);
    } catch (err) {
      console.error('Failed to share PDF via WhatsApp:', err);
      // Fallback to text message
      const rawPhone = invoice.customer.phone.replace(/[^0-9]/g, '');
      const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
      const msg = encodeURIComponent(generateWhatsAppMessage());
      const waUrl = cleanPhone 
        ? `https://wa.me/${cleanPhone}?text=${msg}` 
        : `https://wa.me/?text=${msg}`;
      window.open(waUrl, '_blank');
    } finally {
      setIsSharingPdf(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateWhatsAppMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalGrossWeight = invoice.items.reduce((s, i) => s + i.grossWeightGrams, 0);
  const totalNetWeight = invoice.items.reduce((s, i) => s + i.netWeightGrams, 0);
  const totalMakingCharges = invoice.items.reduce((s, i) => s + i.totalMakingCharge, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-3xl w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-stone-900 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold font-cinzel">
              Tax Invoice #{invoice.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
              title="Print standard A4 / thermal invoice or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF</span>
            </button>

            <button
              onClick={handleDownloadBill}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors border border-stone-700"
              title="Download standalone HTML invoice file for printing or offline record"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
              title="Share clean bill on customer WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleCopyText}
              className="p-1.5 text-stone-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Copy bill text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="invoice-print-container" className="p-6 sm:p-8 bg-white text-stone-900 space-y-6 print-area">
          {/* Header & Jewelry Logo */}
          <div className="border-b-2 border-amber-900/30 pb-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                  ESTD 1984 • BIS HALLMARK CERTIFIED
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-cinzel text-amber-950">
                  {profile.storeName}
                </h1>
                <p className="text-xs text-stone-600 font-medium italic mt-0.5">
                  {profile.tagline}
                </p>
                <p className="text-xs text-stone-600 mt-1">
                  {profile.address}, {profile.cityState}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600 mt-1 font-mono-num">
                  <span>Phone: {profile.phone}</span>
                  <span>GSTIN: <strong>{profile.gstin}</strong></span>
                  <span>BIS Lic: <strong>{profile.bisHallmarkLicense}</strong></span>
                </div>
              </div>

              {/* Invoice Meta Card */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 sm:text-right min-w-[200px]">
                <div className="text-[10px] uppercase font-bold text-amber-800">
                  ORIGINAL TAX INVOICE
                </div>
                <div className="text-base font-bold font-mono-num text-stone-900">
                  {invoice.invoiceNumber}
                </div>
                <div className="text-xs text-stone-600 mt-1">
                  Date: <span className="font-mono-num font-semibold">{invoice.date}</span>
                </div>
                <div className="text-xs text-stone-600">
                  State Code: <span className="font-mono-num">27 (Maharashtra)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Billed To Section */}
          <div className="grid grid-cols-2 gap-4 bg-stone-50/70 p-4 rounded-xl border border-stone-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                Billed To (Customer):
              </span>
              <div className="font-bold text-stone-900 text-sm">{invoice.customer.name}</div>
              <div className="text-stone-600 font-mono-num mt-0.5">Phone: {invoice.customer.phone}</div>
              {invoice.customer.address && (
                <div className="text-stone-600 mt-0.5">{invoice.customer.address}</div>
              )}
            </div>

            <div className="text-right">
              {invoice.customer.panOrAadhaar && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">
                    PAN / Aadhaar:
                  </span>
                  <span className="font-mono-num font-semibold text-stone-900">
                    {invoice.customer.panOrAadhaar}
                  </span>
                </div>
              )}
              <div className="mt-2">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">
                  Payment Status:
                </span>
                <span className="inline-block font-bold uppercase px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {invoice.payment.status} ({invoice.payment.method})
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-900 text-white font-semibold">
                  <th className="p-2.5 text-center w-8">#</th>
                  <th className="p-2.5">Description of Articles</th>
                  <th className="p-2.5 text-center">HSN</th>
                  <th className="p-2.5 text-center">Purity</th>
                  <th className="p-2.5 text-right">Gross Wt</th>
                  <th className="p-2.5 text-right">Net Wt</th>
                  <th className="p-2.5 text-right">Rate / g</th>
                  <th className="p-2.5 text-right">Making</th>
                  <th className="p-2.5 text-right">Taxable Amt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-mono-num">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className="text-stone-800">
                    <td className="p-2.5 text-center text-stone-500">{idx + 1}</td>
                    <td className="p-2.5 font-sans">
                      <div className="font-bold text-stone-900">{item.name}</div>
                      {item.stoneDescription && (
                        <div className="text-[10px] text-purple-700">
                          {item.stoneDescription} (+{formatINR(item.stoneValue)})
                        </div>
                      )}
                    </td>
                    <td className="p-2.5 text-center text-stone-600">{item.hsnCode}</td>
                    <td className="p-2.5 text-center font-bold text-amber-900">
                      {item.purityKarat}
                    </td>
                    <td className="p-2.5 text-right">{formatGrams(item.grossWeightGrams)}</td>
                    <td className="p-2.5 text-right font-bold">{formatGrams(item.netWeightGrams)}</td>
                    <td className="p-2.5 text-right">{formatINR(item.ratePerGramApplied)}</td>
                    <td className="p-2.5 text-right">{formatINR(item.totalMakingCharge)}</td>
                    <td className="p-2.5 text-right font-bold text-stone-950">
                      {formatINR(item.itemTaxableAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-stone-800 font-mono-num font-bold text-stone-900 bg-stone-50">
                <tr>
                  <td colSpan={4} className="p-2 text-right uppercase text-[11px] font-sans">
                    Total Weight:
                  </td>
                  <td className="p-2 text-right">{formatGrams(totalGrossWeight)}</td>
                  <td className="p-2 text-right text-amber-900">{formatGrams(totalNetWeight)}</td>
                  <td></td>
                  <td className="p-2 text-right">{formatINR(totalMakingCharges)}</td>
                  <td className="p-2 text-right text-base">{formatINR(invoice.subtotalTaxable)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Old Gold Trade-In if present */}
          {invoice.oldGoldExchange?.enabled && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-amber-950">Less: Old Metal Return / Exchange</span>
                <p className="text-stone-600">
                  {invoice.oldGoldExchange.description} ({formatGrams(invoice.oldGoldExchange.weightGrams)} @ {invoice.oldGoldExchange.purityPercentage}%)
                </p>
              </div>
              <span className="font-mono-num font-bold text-emerald-800 text-sm">
                -{formatINR(invoice.oldGoldExchange.totalExchangeValue)}
              </span>
            </div>
          )}

          {/* Tax Breakdown & Grand Total */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Left: Notes & Bank / Hallmark info */}
            <div className="space-y-3 text-xs text-stone-600">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="font-bold text-stone-800 block mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Hallmark & HUID Guarantee
                </span>
                <p className="text-[11px] leading-relaxed">
                  All gold jewelry sold contains the official Bureau of Indian Standards (BIS) hallmark, 
                  karat purity stamp, and 6-digit alphanumeric HUID identification code.
                </p>
              </div>

              {invoice.notes && (
                <p className="text-[11px] text-stone-500 italic">
                  <strong>Notes:</strong> {invoice.notes}
                </p>
              )}
            </div>

            {/* Right: Calculations Summary */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-600">Subtotal (Taxable Value):</span>
                <span className="font-mono-num font-semibold">{formatINR(invoice.subtotalTaxable)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-600">CGST (1.5%):</span>
                <span className="font-mono-num font-semibold">+{formatINR(invoice.cgstAmount)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-600">SGST (1.5%):</span>
                <span className="font-mono-num font-semibold">+{formatINR(invoice.sgstAmount)}</span>
              </div>

              {invoice.discount > 0 && (
                <div className="flex justify-between py-1 border-b border-stone-200 text-rose-600 font-semibold">
                  <span>Special Discount:</span>
                  <span className="font-mono-num">-{formatINR(invoice.discount)}</span>
                </div>
              )}

              {invoice.oldGoldExchange?.enabled && (
                <div className="flex justify-between py-1 border-b border-stone-200 text-emerald-700 font-semibold">
                  <span>Old Gold Credit:</span>
                  <span className="font-mono-num">-{formatINR(invoice.oldGoldExchange.totalExchangeValue)}</span>
                </div>
              )}

              <div className="flex justify-between py-1 border-b border-stone-200 text-stone-500">
                <span>Round-off:</span>
                <span className="font-mono-num">{invoice.roundOff >= 0 ? `+${invoice.roundOff}` : invoice.roundOff}</span>
              </div>

              <div className="flex justify-between items-center pt-2 text-stone-950 font-bold border-t border-stone-300">
                <span className="text-sm uppercase font-cinzel">Invoice Grand Total:</span>
                <span className="text-xl font-mono-num text-amber-900 font-extrabold">
                  {formatINR(invoice.finalTotal)}
                </span>
              </div>

              {/* Payment Settlement & Udhar Ledger Breakdown */}
              {invoice.payment.status === 'paid' ? (
                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900 font-bold">
                  <span>Payment Settlement:</span>
                  <span className="uppercase tracking-wide">PAID IN FULL ({invoice.payment.method})</span>
                </div>
              ) : invoice.payment.status === 'partial' ? (
                <div className="mt-2 p-2.5 bg-amber-50 border border-amber-300 rounded-lg space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-emerald-800">
                    <span>Advance Received ({invoice.payment.method}):</span>
                    <span className="font-mono-num">{formatINR(invoice.payment.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-rose-700 pt-1 border-t border-amber-200 text-sm">
                    <span className="uppercase">Pending Udhar Balance Due:</span>
                    <span className="font-mono-num">{formatINR(invoice.payment.balanceAmount)}</span>
                  </div>
                  {invoice.payment.dueDate && (
                    <div className="flex justify-between text-[11px] text-stone-600 pt-0.5">
                      <span>Customer Agreed Due Date:</span>
                      <span className="font-semibold text-stone-900">{invoice.payment.dueDate}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-2 p-2.5 bg-rose-50 border border-rose-300 rounded-lg space-y-1 text-xs">
                  <div className="flex justify-between font-extrabold text-rose-800 text-sm">
                    <span className="uppercase">Full Credit / Udhar:</span>
                    <span className="font-mono-num">{formatINR(invoice.payment.balanceAmount || invoice.finalTotal)}</span>
                  </div>
                  {invoice.payment.dueDate && (
                    <div className="flex justify-between text-[11px] text-stone-600 pt-0.5">
                      <span>Customer Agreed Due Date:</span>
                      <span className="font-semibold text-stone-900">{invoice.payment.dueDate}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Terms & Signature */}
          <div className="pt-4 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-stone-500">
            <div>
              <span className="font-bold text-stone-700 uppercase block mb-1">
                Terms & Conditions:
              </span>
              <ul className="list-disc pl-4 space-y-0.5">
                {profile.termsAndConditions.slice(0, 3).map((term, i) => (
                  <li key={i}>{term}</li>
                ))}
              </ul>
            </div>

            <div className="sm:text-right flex flex-col justify-end">
              <div className="h-12"></div>
              <div className="border-t border-stone-400 inline-block pt-1 text-stone-800 font-bold">
                For {profile.storeName}
              </div>
              <span className="text-[10px] text-stone-500">Authorized Signatory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
