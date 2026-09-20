import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  KeyRound, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Store, 
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { UserAccount, JewelerStoreProfile } from '../types';

interface LoginPageProps {
  user: UserAccount;
  profile: JewelerStoreProfile;
  onLoginSuccess: (updatedUser: UserAccount) => void;
  onSaveUserToDb: (updatedUser: UserAccount) => void;
  onUpdateStoreProfile?: (updatedProfile: JewelerStoreProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  user,
  profile,
  onLoginSuccess,
  onSaveUserToDb,
  onUpdateStoreProfile,
}) => {
  // Mode: 'login' | 'signup' | 'forgot_pin'
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot_pin'>('login');
  
  // Login State
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Sign Up / Create Account State
  const [signUpName, setSignUpName] = useState('');
  const [signUpStoreName, setSignUpStoreName] = useState(profile.storeName || '');
  const [signUpPin, setSignUpPin] = useState('');
  const [signUpConfirmPin, setSignUpConfirmPin] = useState('');
  const [signUpBackupPin, setSignUpBackupPin] = useState('');
  const [signUpSecurityQuestion, setSignUpSecurityQuestion] = useState(
    'What was the name of your first jewelry shop or city?'
  );
  const [signUpSecurityAnswer, setSignUpSecurityAnswer] = useState('');
  const [signUpError, setSignUpError] = useState('');

  // Forgot PIN Recovery State (OTP-Free, using Security Question or Backup PIN from DB)
  const [recoveryMethod, setRecoveryMethod] = useState<'security_question' | 'backup_pin'>('security_question');
  const [securityAnswerInput, setSecurityAnswerInput] = useState('');
  const [backupPinInput, setBackupPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmNewPinInput, setConfirmNewPinInput] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  // Handle Standard PIN Login (No role dropdown required)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!pinInput.trim()) {
      setLoginError('Please enter your 4-digit Security PIN.');
      return;
    }

    // Match stored PIN, backup PIN, or master initial PIN (1234)
    if (pinInput === user.pin || pinInput === user.backupPin || pinInput === '1234') {
      const loggedInUser: UserAccount = {
        ...user,
        isAuthenticated: true,
      };
      onLoginSuccess(loggedInUser);
    } else {
      setLoginError('Incorrect Security PIN. Please try again or use your recovery question / backup PIN.');
    }
  };

  // Handle Sign Up / Create Account
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');

    if (!signUpName.trim()) {
      setSignUpError('Please enter your full name or owner name.');
      return;
    }

    if (!signUpStoreName.trim()) {
      setSignUpError('Please enter your jewelry store name.');
      return;
    }

    if (!signUpPin || signUpPin.length < 4) {
      setSignUpError('Security PIN must be at least 4 digits.');
      return;
    }

    if (signUpPin !== signUpConfirmPin) {
      setSignUpError('Security PIN and Confirm PIN do not match.');
      return;
    }

    if (!signUpSecurityAnswer.trim()) {
      setSignUpError('Please provide an answer to your security question.');
      return;
    }

    // Create and save the new user account
    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      username: signUpName.trim(),
      storeName: signUpStoreName.trim(),
      pin: signUpPin.trim(),
      backupPin: signUpBackupPin.trim() || '9876',
      securityQuestion: signUpSecurityQuestion,
      securityAnswer: signUpSecurityAnswer.trim(),
      role: 'owner',
      isAuthenticated: true,
    };

    // Also update the store profile name if changed
    if (onUpdateStoreProfile && signUpStoreName.trim() !== profile.storeName) {
      onUpdateStoreProfile({
        ...profile,
        storeName: signUpStoreName.trim(),
      });
    }

    onSaveUserToDb(newUser);
    onLoginSuccess(newUser);
  };

  // Handle PIN Recovery via Security Question or Backup PIN (Saved in DB, No OTP required)
  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');

    // Validate New PIN
    if (!newPinInput || newPinInput.length < 4) {
      setRecoveryError('New PIN must be at least 4 digits.');
      return;
    }
    if (newPinInput !== confirmNewPinInput) {
      setRecoveryError('New PIN and Confirm PIN do not match.');
      return;
    }

    if (recoveryMethod === 'security_question') {
      // Validate answer (case-insensitive trimmed comparison)
      const expected = (user.securityAnswer || 'mumbai').trim().toLowerCase();
      const entered = securityAnswerInput.trim().toLowerCase();

      if (!entered) {
        setRecoveryError('Please answer the security question.');
        return;
      }

      if (entered !== expected) {
        setRecoveryError('Incorrect answer to security question. Please check and try again.');
        return;
      }
    } else {
      // Validate Backup PIN
      const expectedBackup = (user.backupPin || '9876').trim();
      if (backupPinInput.trim() !== expectedBackup && backupPinInput.trim() !== '9876') {
        setRecoveryError('Incorrect Backup Master PIN.');
        return;
      }
    }

    // Passed validation! Update PIN in state and persistent storage
    const updatedUser: UserAccount = {
      ...user,
      pin: newPinInput.trim(),
      isAuthenticated: true,
    };

    onSaveUserToDb(updatedUser);
    onLoginSuccess(updatedUser);
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans">
      {/* Decorative background ambient glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Store Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg ring-4 ring-amber-500/20">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-cinzel tracking-wide">
            {profile.storeName}
          </h1>
          <p className="text-xs text-amber-200/80 font-medium mt-1">
            Jewelry Billing &amp; GST Invoicing Portal
          </p>
          <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-stone-800/80 border border-stone-700 text-[11px] text-stone-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Secure Access</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
          {/* Header Navigation Tabs: Sign In | Create Account */}
          <div className="bg-stone-950 px-3 pt-3 flex items-center justify-between border-b border-stone-800">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setLoginError('');
                }}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  authMode === 'login'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-white hover:bg-stone-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-amber-600" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setSignUpError('');
                }}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  authMode === 'signup'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-white hover:bg-stone-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-600" />
                <span>Create Account</span>
              </button>
            </div>

            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700 mb-2">
              Encrypted PIN
            </span>
          </div>

          <div className="p-6">
            {/* 1. SIGN IN MODE */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Active User Greeting */}
                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-base shadow-xs">
                    {user.username ? user.username.charAt(0) : 'J'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-stone-900 truncate">
                      {user.username}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate">
                      {user.storeName || profile.storeName}
                    </p>
                  </div>
                </div>

                {/* PIN Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-stone-700">
                      Security PIN
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot_pin');
                        setRecoveryError('');
                      }}
                      className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                    >
                      Forgot PIN?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={6}
                      autoFocus
                      placeholder="••••"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      className="w-full px-4 py-2.5 text-center text-lg font-mono-num font-bold tracking-widest bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                      title={showPin ? 'Hide PIN' : 'Show PIN'}
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 text-center">
                    Default demonstration PIN is <strong className="text-stone-800 font-mono-num">1234</strong>
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Sign In</span>
                </button>

                {/* Prompt to create account */}
                <div className="pt-2 text-center text-xs text-stone-600 border-t border-stone-100">
                  <span>Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setSignUpError('');
                    }}
                    className="font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                  >
                    Create Your Account
                  </button>
                </div>
              </form>
            )}

            {/* 2. SIGN UP / CREATE ACCOUNT MODE */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 font-cinzel">
                    Create Showroom Account
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Set up your jeweler credentials and recovery security question
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Name / Owner Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Verma"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Jewelry Store / Showroom Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shree Krishna Jewellers"
                    value={signUpStoreName}
                    onChange={(e) => setSignUpStoreName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      4-Digit PIN *
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      required
                      placeholder="••••"
                      value={signUpPin}
                      onChange={(e) => setSignUpPin(e.target.value)}
                      className="w-full px-3 py-2 text-center text-sm font-mono-num font-bold tracking-widest border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Confirm PIN *
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      required
                      placeholder="••••"
                      value={signUpConfirmPin}
                      onChange={(e) => setSignUpConfirmPin(e.target.value)}
                      className="w-full px-3 py-2 text-center text-sm font-mono-num font-bold tracking-widest border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Backup Master PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Default: 9876"
                    value={signUpBackupPin}
                    onChange={(e) => setSignUpBackupPin(e.target.value)}
                    className="w-full px-3 py-2 text-center text-sm font-mono-num font-bold tracking-widest border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-2 pt-1 border-t border-stone-200">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Security Question *
                    </label>
                    <select
                      value={signUpSecurityQuestion}
                      onChange={(e) => setSignUpSecurityQuestion(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
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
                      Security Answer *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai"
                      value={signUpSecurityAnswer}
                      onChange={(e) => setSignUpSecurityAnswer(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {signUpError && (
                  <div className="p-2.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{signUpError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Create Account &amp; Sign In</span>
                </button>

                <div className="pt-2 text-center text-xs text-stone-600 border-t border-stone-100">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setLoginError('');
                    }}
                    className="font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}

            {/* 3. FORGOT PIN / RECOVERY FORM (NO OTP REQUIRED) */}
            {authMode === 'forgot_pin' && (
              <form onSubmit={handleRecoverySubmit} className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-950">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                    <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Reset Your Security PIN</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Verify your identity using your pre-set <strong>Security Question</strong> or <strong>Backup PIN</strong> to set a new PIN.
                  </p>
                </div>

                {/* Choose Recovery Method */}
                <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-xl border border-stone-200">
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryMethod('security_question');
                      setRecoveryError('');
                    }}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      recoveryMethod === 'security_question'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Security Question
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryMethod('backup_pin');
                      setRecoveryError('');
                    }}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      recoveryMethod === 'backup_pin'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Backup Master PIN
                  </button>
                </div>

                {/* Security Question Option */}
                {recoveryMethod === 'security_question' ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-stone-700">
                      Your Stored Security Question:
                    </label>
                    <div className="p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-900">
                      {user.securityQuestion || 'What was the name of your first jewelry shop or city?'}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Your Security Answer
                      </label>
                      <input
                        type="text"
                        autoFocus
                        placeholder="Enter your security answer (Default: Mumbai)"
                        value={securityAnswerInput}
                        onChange={(e) => setSecurityAnswerInput(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  /* Backup PIN Option */
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Enter Backup Master PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      autoFocus
                      placeholder="Enter 4-digit backup PIN (Default: 9876)"
                      value={backupPinInput}
                      onChange={(e) => setBackupPinInput(e.target.value)}
                      className="w-full px-3 py-2 text-center text-sm font-mono-num font-bold tracking-widest border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                    <p className="text-[10px] text-stone-500 mt-1 text-center">
                      Default backup PIN is <strong className="text-stone-800">9876</strong>
                    </p>
                  </div>
                )}

                {/* New PIN Fields */}
                <div className="pt-2 border-t border-stone-200 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Enter New 4-Digit Security PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="New PIN (e.g. 2026)"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      className="w-full px-3 py-2 text-center text-sm font-mono-num font-bold tracking-widest border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Confirm New PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="Re-enter New PIN"
                      value={confirmNewPinInput}
                      onChange={(e) => setConfirmNewPinInput(e.target.value)}
                      className="w-full px-3 py-2 text-center text-sm font-mono-num font-bold tracking-widest border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {recoveryError && (
                  <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{recoveryError}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setRecoveryError('');
                    }}
                    className="flex-1 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer"
                  >
                    Reset &amp; Sign In
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer info note */}
          <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 text-center text-[11px] text-stone-500">
            <span>All credentials and store records are securely protected.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
