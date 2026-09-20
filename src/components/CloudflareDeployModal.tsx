import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  Terminal, 
  GitBranch, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Globe,
  Sparkles,
  FileCode
} from 'lucide-react';

interface CloudflareDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudflareDeployModal: React.FC<CloudflareDeployModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'git' | 'cli'>('git');

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/70 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-2xl w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-cinzel tracking-wide">
                  Deploy to Cloudflare Pages
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  Ready to Deploy
                </span>
              </div>
              <p className="text-xs text-orange-100">
                Host your jewelry billing system on Cloudflare's global edge network with free SSL
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cloudflare Pre-configurations Banner */}
        <div className="bg-orange-50 border-b border-orange-200/80 px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-orange-950 font-medium">
            <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
            <span>Pre-configured files generated: <code>_redirects</code> (SPA routing), <code>_headers</code>, and <code>wrangler.toml</code></span>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Build Verified
          </span>
        </div>

        {/* Method Switcher Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('git')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer border-t border-x ${
              activeTab === 'git'
                ? 'bg-white text-stone-900 border-stone-200 -mb-px'
                : 'text-stone-500 hover:text-stone-800 border-transparent'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-orange-600" />
            <span>Method 1: Connect Git Repository (Recommended)</span>
          </button>

          <button
            onClick={() => setActiveTab('cli')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer border-t border-x ${
              activeTab === 'cli'
                ? 'bg-white text-stone-900 border-stone-200 -mb-px'
                : 'text-stone-500 hover:text-stone-800 border-transparent'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-600" />
            <span>Method 2: 1-Click Terminal (Wrangler CLI)</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {activeTab === 'git' ? (
            <div className="space-y-4">
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs">1</span>
                  <span>Push or Export to GitHub</span>
                </div>
                <p className="text-xs text-stone-600 ml-7 leading-relaxed">
                  Export this app to your GitHub account using the export menu in AI Studio (or push your repository).
                </p>

                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm pt-2">
                  <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs">2</span>
                  <span>Connect to Cloudflare Pages</span>
                </div>
                <p className="text-xs text-stone-600 ml-7 leading-relaxed">
                  Go to the{' '}
                  <a 
                    href="https://dash.cloudflare.com/?to=/:account/pages" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-orange-700 underline font-semibold inline-flex items-center gap-0.5 hover:text-orange-900"
                  >
                    Cloudflare Pages Dashboard <ExternalLink className="w-3 h-3" />
                  </a>
                  , click <strong>Create application</strong> &gt; <strong>Pages</strong> &gt; <strong>Connect to Git</strong>.
                </p>

                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm pt-2">
                  <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs">3</span>
                  <span>Set Build Configuration</span>
                </div>
                <div className="ml-7 bg-white p-3 rounded-lg border border-stone-200 space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-stone-100">
                    <span className="text-stone-500 font-sans font-medium">Framework Preset:</span>
                    <span className="font-bold text-stone-900">Vite</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-stone-100">
                    <span className="text-stone-500 font-sans font-medium">Build Command:</span>
                    <span className="font-bold text-orange-700">npm run build</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-stone-500 font-sans font-medium">Build Output Directory:</span>
                    <span className="font-bold text-emerald-700">dist</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm pt-2">
                  <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs">4</span>
                  <span>Click "Save and Deploy"</span>
                </div>
                <p className="text-xs text-stone-600 ml-7 leading-relaxed">
                  Cloudflare builds your app in under 40 seconds and provides a custom URL (e.g. <code>https://swarnavyapar.pages.dev</code>) plus free custom domain mapping for your showroom website.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-stone-900 text-stone-200 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="flex items-center gap-1.5 font-bold text-amber-400">
                    <Terminal className="w-3.5 h-3.5" /> Direct Cloudflare CLI Deployment
                  </span>
                  <span>Terminal</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <p className="text-stone-400 text-[11px] font-sans">1. Build static production assets:</p>
                  <div className="bg-stone-950 p-2.5 rounded-lg flex items-center justify-between border border-stone-800">
                    <code className="text-emerald-400">npm run build</code>
                    <button
                      onClick={() => handleCopy('npm run build', 'cmd-build')}
                      className="p-1 text-stone-400 hover:text-white cursor-pointer"
                      title="Copy command"
                    >
                      {copiedCmd === 'cmd-build' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <p className="text-stone-400 text-[11px] font-sans pt-1">2. Deploy directly to Cloudflare Pages:</p>
                  <div className="bg-stone-950 p-2.5 rounded-lg flex items-center justify-between border border-stone-800">
                    <code className="text-amber-300">npx wrangler pages deploy dist --project-name=swarnavyapar-billing</code>
                    <button
                      onClick={() => handleCopy('npx wrangler pages deploy dist --project-name=swarnavyapar-billing', 'cmd-deploy')}
                      className="p-1 text-stone-400 hover:text-white cursor-pointer"
                      title="Copy command"
                    >
                      {copiedCmd === 'cmd-deploy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-stone-400 leading-relaxed pt-1">
                  Wrangler will prompt you once to authorize your free Cloudflare account, then upload the <code>dist</code> folder in seconds.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-stone-700">
                <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Tip:</strong> We have already added <code>npm run deploy:cf</code> and <code>npm run deploy:cf:prod</code> scripts into your <code>package.json</code> for instant single-command deployment.
                </p>
              </div>
            </div>
          )}

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center space-y-1">
              <Globe className="w-4 h-4 text-orange-600 mx-auto" />
              <div className="text-xs font-bold text-stone-800">Global Edge CDN</div>
              <div className="text-[11px] text-stone-500">&lt;50ms response in India & globally</div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto" />
              <div className="text-xs font-bold text-stone-800">Free SSL & Custom Domain</div>
              <div className="text-[11px] text-stone-500">Attach billing.yourbrand.com</div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center space-y-1">
              <FileCode className="w-4 h-4 text-blue-600 mx-auto" />
              <div className="text-xs font-bold text-stone-800">Full Offline Cache</div>
              <div className="text-[11px] text-stone-500">IndexedDB local storage active</div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Cloudflare Pages Free Tier includes unlimited bandwidth.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
