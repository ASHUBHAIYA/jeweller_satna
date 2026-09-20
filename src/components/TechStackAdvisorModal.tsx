import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Layers, 
  Cpu, 
  Database, 
  Printer, 
  WifiOff, 
  CheckCircle2, 
  Star, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  Scale
} from 'lucide-react';

interface TechStackAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechStackAdvisorModal: React.FC<TechStackAdvisorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'recommendation' | 'comparison' | 'hardware'>('recommendation');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-3xl w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-cinzel">
                Cross-Platform Mobile Tech Stack Advisory
              </h2>
              <p className="text-xs text-stone-400">
                Architectural blueprint for high-performance offline jewelry POS & billing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('recommendation')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === 'recommendation'
                ? 'bg-white text-amber-900 border-amber-600 shadow-2xs'
                : 'text-stone-500 border-transparent hover:text-stone-800'
            }`}
          >
            🏆 Best Architecture (Top Pick)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === 'comparison'
                ? 'bg-white text-amber-900 border-amber-600 shadow-2xs'
                : 'text-stone-500 border-transparent hover:text-stone-800'
            }`}
          >
            ⚖️ Stack Comparison
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hardware')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === 'hardware'
                ? 'bg-white text-amber-900 border-amber-600 shadow-2xs'
                : 'text-stone-500 border-transparent hover:text-stone-800'
            }`}
          >
            🖨️ Jeweler Hardware Checklist
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5 text-stone-800 text-xs leading-relaxed">
          {activeTab === 'recommendation' && (
            <div className="space-y-4">
              {/* Winner Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-bold text-[10px] uppercase tracking-wide flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    RECOMMENDED ARCHITECTURE
                  </span>
                  <span className="font-mono-num font-bold text-amber-900 text-xs">
                    Production Grade
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-stone-900 font-cinzel">
                  React Native (Expo EAS) + WatermelonDB (SQLite) + Cloud Sync
                </h3>
                <p className="text-stone-600 mt-1">
                  The ideal stack for jewelers needing instantaneous barcode scanning, Bluetooth ESC/POS receipt printing, offline speed, and seamless cloud syncing.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
                    <strong className="block text-stone-900 font-bold mb-0.5">Frontend Mobile:</strong>
                    <span className="text-stone-600">React Native 0.76+ with Expo Router & TypeScript</span>
                  </div>

                  <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
                    <strong className="block text-stone-900 font-bold mb-0.5">Local Database:</strong>
                    <span className="text-stone-600">WatermelonDB or op-sqlite (10,000+ items at 60 FPS)</span>
                  </div>

                  <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
                    <strong className="block text-stone-900 font-bold mb-0.5">Cloud Backend:</strong>
                    <span className="text-stone-600">Firebase Firestore / Supabase for real-time backup</span>
                  </div>
                </div>
              </div>

              {/* Why This Wins For Jewelers */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                  Why this stack dominates jewelry retail:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-stone-900">
                      <Zap className="w-4 h-4 text-amber-600" />
                      <span>Zero-Latency Offline POS</span>
                    </div>
                    <p className="text-stone-600">
                      Jewelry showrooms often experience spotty Wi-Fi. SQLite runs locally with sub-millisecond queries, meaning billing never halts during peak Dhanteras/Diwali rush.
                    </p>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-stone-900">
                      <Printer className="w-4 h-4 text-amber-600" />
                      <span>Bluetooth Thermal Printing</span>
                    </div>
                    <p className="text-stone-600">
                      Direct integration with 58mm/80mm ESC/POS Bluetooth receipt printers using <code className="bg-stone-200 px-1 py-0.5 rounded text-[10px]">react-native-esc-pos-printer</code>.
                    </p>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-stone-900">
                      <Smartphone className="w-4 h-4 text-amber-600" />
                      <span>Camera Barcode & RFID</span>
                    </div>
                    <p className="text-stone-600">
                      Fast 2D DataMatrix scanning directly from phone camera to instantly scan tiny jewelry tags with weight and HUID codes.
                    </p>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-stone-900">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Code Sharing with Web App</span>
                    </div>
                    <p className="text-stone-600">
                      You can reuse all business logic, purity math, GST formulas, and CA JSON export schemas from this current React web application with 90%+ code portability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-stone-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-100 text-stone-800 font-bold border-b border-stone-200">
                      <th className="p-3">Framework</th>
                      <th className="p-3">Performance</th>
                      <th className="p-3">Hardware Plugins (BLE/Print)</th>
                      <th className="p-3">Offline Database</th>
                      <th className="p-3">Dev Speed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    <tr className="bg-amber-50/40 font-medium">
                      <td className="p-3 font-bold text-amber-950">
                        React Native + Expo ⭐
                      </td>
                      <td className="p-3 text-emerald-700 font-semibold">9.5/10 (Hermes Engine)</td>
                      <td className="p-3 text-emerald-700">Excellent (Vast native ecosystem)</td>
                      <td className="p-3">WatermelonDB / op-sqlite</td>
                      <td className="p-3 text-emerald-700 font-bold">Fastest (Uses React)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-stone-900">
                        Flutter (Google)
                      </td>
                      <td className="p-3 text-emerald-700 font-semibold">9.8/10 (Skia/Impeller)</td>
                      <td className="p-3">Good (Pub.dev packages)</td>
                      <td className="p-3">Drift / Isar</td>
                      <td className="p-3 text-stone-600">Moderate (Requires Dart)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-stone-900">
                        Capacitor + React (Hybrid)
                      </td>
                      <td className="p-3 text-amber-700 font-semibold">8.0/10 (WebView)</td>
                      <td className="p-3 text-stone-600">Moderate (WebBluetooth/Native bridge)</td>
                      <td className="p-3">IndexedDB / SQLite plugin</td>
                      <td className="p-3 text-emerald-700 font-bold">Instant (Wraps current web app)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <strong className="block text-stone-900 font-bold">Quick Transition Recommendation:</strong>
                <p className="text-stone-600">
                  If you want native Android APK & iOS build in <strong>under 1 hour</strong>, wrap this current codebase using <strong>Capacitor</strong>:
                </p>
                <code className="block bg-stone-900 text-amber-300 p-2.5 rounded-lg font-mono-num text-[11px]">
                  npm install @capacitor/core @capacitor/cli<br />
                  npx cap init "SwarnaVyapar" "com.jeweler.swarnavyapar"<br />
                  npm run build && npx cap add android && npx cap open android
                </code>
              </div>
            </div>
          )}

          {activeTab === 'hardware' && (
            <div className="space-y-4">
              <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                Essential Hardware Integrations for Jewelry Counters:
              </h4>

              <div className="space-y-3">
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                  <Printer className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900 font-bold">
                      1. ESC/POS Thermal Printers (58mm or 80mm)
                    </strong>
                    <p className="text-stone-600 mt-0.5">
                      Jewelers print fast thermal counter receipts for customers and workshop job cards. Recommended models: <em>Epson TM-T82, TVS RP-3200, Everycom 80mm Bluetooth</em>.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                  <Scale className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900 font-bold">
                      2. Precision 0.001g Jewelry Electronic Weighing Scale
                    </strong>
                    <p className="text-stone-600 mt-0.5">
                      Connect via Bluetooth (BLE) or RS-232 serial cable to automatically populate the Gross Weight field in the app without manual typing errors.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900 font-bold">
                      3. 2D DataMatrix Jewelry Tag Scanner & Barcode Printer
                    </strong>
                    <p className="text-stone-600 mt-0.5">
                      Jewelry tags (dumbbell shape) store HUID, net weight, and item code. Zebra or TSC thermal transfer barcode printers (300 DPI for micro-barcodes).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          >
            Close Advisory
          </button>
        </div>
      </div>
    </div>
  );
};
