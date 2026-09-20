import React, { useState } from 'react';
import { 
  FileText, 
  Trash2, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  Receipt, 
  Sparkles, 
  CheckCircle2, 
  Percent, 
  Coins, 
  ArrowRight,
  Plus,
  AlertCircle,
  Calendar,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomerInfo, Invoice, JewelryItem, JewelerStoreProfile, MetalRates, OldGoldExchange, PaymentDetails } from '../types';
import { formatGrams, formatINR, isTodayRateEntered } from '../utils/calculator';

interface InvoiceBuilderProps {
  items: JewelryItem[];
  oldGoldExchange?: OldGoldExchange;
  profile: JewelerStoreProfile;
  rates?: MetalRates;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onRemoveOldGold: () => void;
  onSaveAndGenerateInvoice: (invoice: Invoice) => void;
  onSwitchToCalculator: () => void;
  onOpenRatesModal?: () => void;
}

export const InvoiceBuilder: React.FC<InvoiceBuilderProps> = ({
  items,
  oldGoldExchange,
  profile,
  rates,
  onRemoveItem,
  onClearCart,
  onRemoveOldGold,
  onSaveAndGenerateInvoice,
  onSwitchToCalculator,
  onOpenRatesModal,
}) => {
  // Customer Details
  const [customerName, setCustomerName] = useState('Ananya Rao');
  const [customerPhone, setCustomerPhone] = useState('9845012345');
  const [customerAddress, setCustomerAddress] = useState('Jayanagar, Bengaluru');
  const [panOrAadhaar, setPanOrAadhaar] = useState('');
  const [gstin, setGstin] = useState('');

  // Bill Financial Adjustments
  const [discount, setDiscount] = useState<number | ''>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentDetails['method']>('upi');
  const [paymentStatus, setPaymentStatus] = useState<PaymentDetails['status']>('paid');
  const [partialPaidAmount, setPartialPaidAmount] = useState<number | ''>('');
  const [paymentDueDate, setPaymentDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().slice(0, 10);
  });
  const [cashAmount, setCashAmount] = useState<number | ''>('');
  const [digitalAmount, setDigitalAmount] = useState<number | ''>('');
  const [invoiceNotes, setInvoiceNotes] = useState('BIS Hallmark HUID certified jewelry. Thank you for your purchase.');

  // Math calculations
  const subtotalTaxable = items.reduce((sum, item) => sum + item.itemTaxableAmount, 0);
  const gstRate = profile.defaultGstPercent || 3;
  const halfGstRate = gstRate / 2;

  const cgstAmount = Math.round((subtotalTaxable * (halfGstRate / 100)));
  const sgstAmount = Math.round((subtotalTaxable * (halfGstRate / 100)));
  const totalGst = cgstAmount + sgstAmount;

  const totalBeforeDeductions = subtotalTaxable + totalGst;
  const oldGoldVal = oldGoldExchange?.enabled ? oldGoldExchange.totalExchangeValue : 0;
  const disc = Number(discount) || 0;

  const unroundedTotal = totalBeforeDeductions - oldGoldVal - disc;
  // Round to nearest 10 or 1
  const finalTotal = Math.round(unroundedTotal);
  const roundOff = finalTotal - unroundedTotal;

  // Real payment calculations for Partial & Udhar
  const computedPaidAmount = paymentStatus === 'paid'
    ? finalTotal
    : paymentStatus === 'partial'
    ? Math.min(finalTotal, Math.max(0, Number(partialPaidAmount) || 0))
    : 0;

  const computedBalanceAmount = Math.max(0, finalTotal - computedPaidAmount);

  // Estimated profit approximation for jeweler (approx. making charges + 1.5% metal spread + stone margins)
  const estimatedProfit = items.reduce((sum, it) => {
    return sum + it.totalMakingCharge + Math.round(it.pureMetalCost * 0.015) + Math.round(it.stoneValue * 0.2);
  }, 0) - disc;

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();

    if (rates && !isTodayRateEntered(rates)) {
      alert("⚠️ Today's Bullion Rate is required! Please enter or confirm today's gold and silver rates before creating or printing an invoice bill.");
      if (onOpenRatesModal) onOpenRatesModal();
      return;
    }

    if (items.length === 0) {
      alert('Please calculate and add at least one jewelry item to create a bill.');
      return;
    }

    if (!customerName.trim()) {
      alert('Please enter customer name.');
      return;
    }

    if (paymentStatus === 'partial' && (!partialPaidAmount || Number(partialPaidAmount) <= 0)) {
      alert('Please enter the advance amount paid by the customer for partial payment.');
      return;
    }

    const nextInvoiceNumber = `${profile.invoicePrefix}${profile.currentInvoiceNumber}`;

    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: nextInvoiceNumber,
      date: new Date().toISOString().slice(0, 10),
      customer: {
        name: customerName,
        phone: customerPhone,
        address: customerAddress || undefined,
        panOrAadhaar: panOrAadhaar || undefined,
        gstin: gstin || undefined,
      },
      items,
      subtotalTaxable,
      gstRate,
      cgstAmount,
      sgstAmount,
      igstAmount: 0,
      totalGst,
      oldGoldExchange,
      discount: disc,
      roundOff: Number(roundOff.toFixed(2)),
      finalTotal,
      payment: {
        method: paymentMethod,
        cashAmount: paymentMethod === 'split' ? Number(cashAmount) || 0 : undefined,
        digitalAmount: paymentMethod === 'split' ? Number(digitalAmount) || 0 : undefined,
        status: paymentStatus,
        paidAmount: computedPaidAmount,
        balanceAmount: computedBalanceAmount,
        dueDate: paymentStatus !== 'paid' ? paymentDueDate : undefined,
      },
      notes: invoiceNotes,
      syncedToCloud: true,
      createdAt: new Date().toISOString(),
      estimatedProfit: Math.max(0, estimatedProfit),
    };

    // Confetti celebration
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    onSaveAndGenerateInvoice(newInvoice);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <h2 className="text-base font-bold font-cinzel text-stone-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-600" />
            <span>Active Billing & Customer Invoice</span>
          </h2>
          <p className="text-xs text-stone-500">
            Invoice #{profile.invoicePrefix}{profile.currentInvoiceNumber} • Auto-saving enabled
          </p>
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button
              type="button"
              onClick={onClearCart}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2.5 py-1 rounded-lg hover:bg-rose-50 cursor-pointer"
            >
              Clear All Items
            </button>
          )}
          <button
            type="button"
            onClick={onSwitchToCalculator}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-600" />
            <span>Add More Items</span>
          </button>
        </div>
      </div>

      {/* Customer Info Form */}
      <div className="bg-stone-50/80 rounded-xl p-4 border border-stone-200 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-amber-600" />
          Customer Information (Required for Tax Invoice)
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Smt. Priya Sharma"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-medium bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              WhatsApp Phone Number *
            </label>
            <input
              type="tel"
              required
              placeholder="10-digit mobile number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono-num font-medium bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              PAN / Aadhaar (Mandatory &gt; ₹2 Lakhs)
            </label>
            <input
              type="text"
              placeholder="e.g. ABCPS1234K"
              value={panOrAadhaar}
              onChange={(e) => setPanOrAadhaar(e.target.value.toUpperCase())}
              className="w-full px-3 py-1.5 text-xs font-mono-num font-medium bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              Customer Address / City
            </label>
            <input
              type="text"
              placeholder="City, State"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-medium bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Item List Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Bill Items ({items.length})
          </span>
          <span className="text-xs text-stone-500">
            Total Net Weight: <strong className="font-mono-num text-stone-800">{formatGrams(items.reduce((s, i) => s + i.netWeightGrams, 0))}</strong>
          </span>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-xl space-y-2">
            <Coins className="w-8 h-8 text-amber-500/60 mx-auto" />
            <p className="text-xs font-semibold text-stone-700">No items added to current bill yet.</p>
            <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
              Use the jewelry calculator above to configure gold/silver weight, purity, and labor charges, then click "Add to Bill".
            </p>
            <button
              type="button"
              onClick={onSwitchToCalculator}
              className="mt-2 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg cursor-pointer"
            >
              Open Calculator
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100/90 text-stone-700 font-semibold border-b border-stone-200">
                  <th className="p-3">#</th>
                  <th className="p-3">Item & Karat</th>
                  <th className="p-3 text-right">Gross Wt</th>
                  <th className="p-3 text-right">Net Wt</th>
                  <th className="p-3 text-right">Rate / g</th>
                  <th className="p-3 text-right">Making</th>
                  <th className="p-3 text-right">Stones</th>
                  <th className="p-3 text-right">Taxable Amount</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/70 font-mono-num">
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="p-3 text-stone-500">{idx + 1}</td>
                    <td className="p-3 font-sans">
                      <div className="font-semibold text-stone-900">{item.name}</div>
                      <div className="text-[10px] text-stone-500 font-mono-num">
                        HSN {item.hsnCode} • {item.purityKarat} ({item.purityPercentage}%)
                      </div>
                    </td>
                    <td className="p-3 text-right">{formatGrams(item.grossWeightGrams)}</td>
                    <td className="p-3 text-right font-bold text-amber-900">
                      {formatGrams(item.netWeightGrams)}
                    </td>
                    <td className="p-3 text-right">{formatINR(item.ratePerGramApplied)}</td>
                    <td className="p-3 text-right font-sans">
                      <span className="font-mono-num font-medium text-stone-800">
                        {formatINR(item.totalMakingCharge)}
                      </span>
                    </td>
                    <td className="p-3 text-right font-sans">
                      {item.stoneValue > 0 ? (
                        <span className="font-mono-num font-medium text-purple-700">
                          {formatINR(item.stoneValue)}
                        </span>
                      ) : (
                        <span className="text-stone-400">-</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-bold text-stone-900">
                      {formatINR(item.itemTaxableAmount)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(idx)}
                        className="text-stone-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Old Gold Trade-In Banner if present */}
      {oldGoldExchange?.enabled && (
        <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-600" />
            <div>
              <span className="font-bold text-amber-900">Old Metal Exchange Attached: </span>
              <span className="text-amber-800 font-medium">
                {oldGoldExchange.description} ({formatGrams(oldGoldExchange.weightGrams)} @ {oldGoldExchange.purityPercentage}%)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono-num font-bold text-emerald-800 text-sm">
              Credit: -{formatINR(oldGoldExchange.totalExchangeValue)}
            </span>
            <button
              type="button"
              onClick={onRemoveOldGold}
              className="text-rose-600 hover:text-rose-700 text-[11px] font-semibold underline cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Invoice Totals & Payment Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-200">
        {/* Payment Configuration */}
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
            Payment & Settlement Mode
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: 'upi', label: 'UPI / QR' },
              { key: 'cash', label: 'Cash' },
              { key: 'card', label: 'Card / POS' },
              { key: 'bank_transfer', label: 'RTGS / NEFT' },
            ].map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setPaymentMethod(m.key as PaymentDetails['method'])}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                  paymentMethod === m.key
                    ? 'bg-stone-900 text-white border-stone-950 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Settlement Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => {
                  const newStatus = e.target.value as PaymentDetails['status'];
                  setPaymentStatus(newStatus);
                  if (newStatus === 'partial' && (!partialPaidAmount || partialPaidAmount === 0)) {
                    setPartialPaidAmount(Math.round(finalTotal * 0.5));
                  }
                }}
                className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="paid">Paid in Full (Nill Balance)</option>
                <option value="partial">Partial Payment (Advance Received)</option>
                <option value="pending">Full Credit / Udhar (Pending)</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Special Discount (₹)
              </label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs font-mono-num font-bold bg-white border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          {/* Partial Payment Specific Inputs */}
          {paymentStatus === 'partial' && (
            <div className="p-3.5 bg-amber-50/70 border border-amber-300/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  <span>Advance Paid by Customer (₹) *</span>
                </label>
                <div className="flex gap-1 text-[10px] font-bold">
                  {[0.25, 0.5, 0.75].map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setPartialPaidAmount(Math.round(finalTotal * ratio))}
                      className="px-2 py-0.5 bg-white hover:bg-amber-100 text-stone-700 rounded-md border border-amber-200 cursor-pointer"
                    >
                      {ratio * 100}%
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="number"
                min="1"
                max={finalTotal}
                placeholder="Enter advance amount paid"
                value={partialPaidAmount}
                onChange={(e) => setPartialPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono-num font-extrabold text-stone-900 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Received Today</span>
                  <span className="font-mono-num font-bold text-emerald-800 text-sm">
                    {formatINR(computedPaidAmount)}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-rose-200">
                  <span className="text-[10px] uppercase font-bold text-rose-700 block">Remaining Udhar Balance</span>
                  <span className="font-mono-num font-bold text-rose-700 text-sm">
                    {formatINR(computedBalanceAmount)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-700" />
                  <span>Promise / Due Date for Remaining ₹{computedBalanceAmount.toLocaleString('en-IN')}:</span>
                </label>
                <input
                  type="date"
                  value={paymentDueDate}
                  onChange={(e) => setPaymentDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-stone-300 rounded-lg text-stone-800"
                />
              </div>
            </div>
          )}

          {/* Full Credit / Udhar Specific Notice */}
          {paymentStatus === 'pending' && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Full Credit / Udhar Transaction (₹{finalTotal.toLocaleString('en-IN')})</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                The entire amount will be logged under customer udhar/khata. No payment is collected today.
              </p>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-rose-600" />
                  <span>Payment Promise / Due Date:</span>
                </label>
                <input
                  type="date"
                  value={paymentDueDate}
                  onChange={(e) => setPaymentDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-stone-300 rounded-lg text-stone-800"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              Invoice Remarks / HUID Tag Notes
            </label>
            <input
              type="text"
              value={invoiceNotes}
              onChange={(e) => setInvoiceNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
            />
          </div>
        </div>

        {/* Invoice Summary Box */}
        <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2.5 text-xs">
          <div className="flex justify-between py-1 border-b border-stone-200">
            <span className="text-stone-600">Total Taxable Value:</span>
            <span className="font-mono-num font-semibold text-stone-900">{formatINR(subtotalTaxable)}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-stone-200">
            <span className="text-stone-600">CGST ({halfGstRate}%):</span>
            <span className="font-mono-num font-semibold text-stone-900">+{formatINR(cgstAmount)}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-stone-200">
            <span className="text-stone-600">SGST ({halfGstRate}%):</span>
            <span className="font-mono-num font-semibold text-stone-900">+{formatINR(sgstAmount)}</span>
          </div>

          {oldGoldVal > 0 && (
            <div className="flex justify-between py-1 border-b border-stone-200 text-amber-700 font-semibold">
              <span>Less Old Gold Credit:</span>
              <span className="font-mono-num">-{formatINR(oldGoldVal)}</span>
            </div>
          )}

          {disc > 0 && (
            <div className="flex justify-between py-1 border-b border-stone-200 text-rose-600 font-semibold">
              <span>Less Store Discount:</span>
              <span className="font-mono-num">-{formatINR(disc)}</span>
            </div>
          )}

          <div className="flex justify-between py-1 border-b border-stone-200 text-stone-500">
            <span>Round-off Adjustment:</span>
            <span className="font-mono-num">{roundOff >= 0 ? `+${roundOff.toFixed(2)}` : roundOff.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center pt-2 text-stone-900 font-bold text-base border-t border-stone-300">
            <span className="font-cinzel">Total Bill Amount:</span>
            <span className="text-xl text-amber-800 font-mono-num font-extrabold">{formatINR(finalTotal)}</span>
          </div>

          {/* If Partial or Pending, Show Paid vs Udhar breakdown */}
          {paymentStatus !== 'paid' && (
            <div className="bg-amber-100/60 p-2.5 rounded-lg border border-amber-200 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-emerald-800">
                <span>Advance Paid Today:</span>
                <span className="font-mono-num">{formatINR(computedPaidAmount)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-rose-700">
                <span>Pending Udhar Balance:</span>
                <span className="font-mono-num">{formatINR(computedBalanceAmount)}</span>
              </div>
              {paymentDueDate && (
                <div className="flex justify-between text-[11px] text-stone-600 pt-1 border-t border-amber-200/60">
                  <span>Due Date:</span>
                  <span className="font-semibold">{paymentDueDate}</span>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            disabled={items.length === 0}
            onClick={handleCreateInvoice}
            className="w-full mt-3 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Generate & Issue Tax Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
};
