import React, { useState } from 'react';
import { X, Check, Store, ShieldCheck, FileText, Plus, Trash2 } from 'lucide-react';
import { JewelerStoreProfile } from '../types';

interface StoreSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: JewelerStoreProfile;
  onSaveProfile: (profile: JewelerStoreProfile) => void;
}

export const StoreSettingsModal: React.FC<StoreSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<JewelerStoreProfile>({ ...profile });
  const [newTerm, setNewTerm] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  const handleAddTerm = () => {
    if (!newTerm.trim()) return;
    setFormData((prev) => ({
      ...prev,
      termsAndConditions: [...prev.termsAndConditions, newTerm.trim()],
    }));
    setNewTerm('');
  };

  const handleRemoveTerm = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      termsAndConditions: prev.termsAndConditions.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-xl w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold font-cinzel">
              Jewelry Store Profile & Billing Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">
                Showroom / Jewelry Store Name *
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3 py-1.5 font-bold font-cinzel text-stone-900 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">
                Store Tagline / Subtitle
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                GSTIN Number (Mandatory)
              </label>
              <input
                type="text"
                required
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="w-full px-3 py-1.5 font-mono-num font-semibold border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                BIS Hallmark License No.
              </label>
              <input
                type="text"
                value={formData.bisHallmarkLicense}
                onChange={(e) => setFormData({ ...formData, bisHallmarkLicense: e.target.value })}
                className="w-full px-3 py-1.5 font-mono-num font-semibold border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Proprietor / Owner Name
              </label>
              <input
                type="text"
                value={formData.proprietorName}
                onChange={(e) => setFormData({ ...formData, proprietorName: e.target.value })}
                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Contact Phone (for Bills)
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-1.5 font-mono-num border border-stone-300 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">
                Showroom Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                City, State & Pincode
              </label>
              <input
                type="text"
                value={formData.cityState}
                onChange={(e) => setFormData({ ...formData, cityState: e.target.value })}
                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Invoice Number Prefix
              </label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                className="w-full px-3 py-1.5 font-mono-num border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Default GST Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.defaultGstPercent}
                onChange={(e) => setFormData({ ...formData, defaultGstPercent: Number(e.target.value) })}
                className="w-full px-3 py-1.5 font-mono-num border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Default BIS Hallmark Fee (₹)
              </label>
              <input
                type="number"
                value={formData.defaultHallmarkFee}
                onChange={(e) => setFormData({ ...formData, defaultHallmarkFee: Number(e.target.value) })}
                className="w-full px-3 py-1.5 font-mono-num border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          {/* Terms & Conditions Editor */}
          <div className="pt-2 border-t border-stone-100 space-y-2 text-xs">
            <label className="block font-bold text-stone-700">
              Invoice Terms & Conditions / Return Policy
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {formData.termsAndConditions.map((term, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-1.5 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="text-stone-700 text-[11px] truncate flex-1">{term}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTerm(idx)}
                    className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add new condition / disclaimer"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                className="flex-1 px-3 py-1 text-xs border border-stone-300 rounded-lg"
              />
              <button
                type="button"
                onClick={handleAddTerm}
                className="px-3 py-1 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
