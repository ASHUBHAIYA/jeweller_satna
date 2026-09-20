import React, { useState } from 'react';
import { X, Lock, ShieldCheck, KeyRound, User, CheckCircle2, HelpCircle, AlertCircle, LogOut } from 'lucide-react';
import { UserAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onUpdateUser: (user: UserAccount) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  
  // Profile settings
  const [username, setUsername] = useState(user.username);
  const [selectedRole, setSelectedRole] = useState(user.role);
  
  // PIN & Security Question settings
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState(user.pin);
  const [backupPin, setBackupPin] = useState(user.backupPin || '9876');
  const [securityQuestion, setSecurityQuestion] = useState(
    user.securityQuestion || 'What was the name of your first jewelry shop or city?'
  );
  const [securityAnswer, setSecurityAnswer] = useState(user.securityAnswer || 'Mumbai');

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      username,
      role: selectedRole,
    });
    setMessage({ text: 'User profile details updated.', type: 'success' });
    setTimeout(() => onClose(), 800);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setMessage({ text: 'PIN must be at least 4 digits.', type: 'error' });
      return;
    }
    if (!securityAnswer.trim()) {
      setMessage({ text: 'Security answer cannot be empty.', type: 'error' });
      return;
    }

    onUpdateUser({
      ...user,
      pin: newPin.trim(),
      backupPin: backupPin.trim(),
      securityQuestion,
      securityAnswer: securityAnswer.trim(),
    });

    setMessage({ text: 'Security PIN & recovery question saved to database.', type: 'success' });
    setTimeout(() => onClose(), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold font-cinzel">
              Account Security &amp; PIN Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-5 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            User Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`pb-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Security PIN &amp; Recovery
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {message && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {activeTab === 'profile' ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm">
                  {user.username.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">{user.username}</div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active Session
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Cashier / User Name
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 border-t border-stone-200 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="flex-1 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSaveSecurity} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Security PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-3 py-2 text-center text-sm font-mono-num font-bold tracking-widest border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-stone-500 block mt-0.5">Used for daily login</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Backup Master PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={backupPin}
                    onChange={(e) => setBackupPin(e.target.value)}
                    className="w-full px-3 py-2 text-center text-sm font-mono-num font-bold tracking-widest border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-stone-500 block mt-0.5">Emergency backup PIN</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-200">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Recovery Security Question
                  </label>
                  <select
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="What was the name of your first jewelry shop or city?">
                      What was the name of your first jewelry shop or city?
                    </option>
                    <option value="What is the name of your family ancestral town/village?">
                      What is the name of your family ancestral town/village?
                    </option>
                    <option value="What was the year your jewelry business was established?">
                      What was the year your jewelry business was established?
                    </option>
                    <option value="What is the name of your favorite temple or deity?">
                      What is the name of your favorite temple or deity?
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Security Answer
                  </label>
                  <input
                    type="text"
                    value={securityAnswer}
                    placeholder="Enter answer for password reset"
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-stone-500">
                    Used to reset your PIN if forgotten.
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Save Security Settings
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
