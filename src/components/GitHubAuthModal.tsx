import React, { useState } from 'react';
import { 
  Github, 
  Key, 
  ExternalLink, 
  Check, 
  Copy, 
  AlertCircle, 
  ShieldCheck, 
  Lock, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import Modal from './common/Modal';
import { useGitHub } from '../context/GitHubContext';

interface GitHubAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function GitHubAuthModal({ isOpen, onClose, onSuccess }: GitHubAuthModalProps) {
  const { user, token, isAuthenticated, loginWithOAuth, loginWithToken, logout, oauthConfig, authError, clearError } = useGitHub();
  const [authMode, setAuthMode] = useState<'oauth' | 'pat'>('oauth');
  const [patInput, setPatInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCallback, setCopiedCallback] = useState(false);

  const callbackUrl = oauthConfig?.redirectUri || `${window.location.origin}/auth/callback`;

  const handleCopyCallback = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopiedCallback(true);
    setTimeout(() => setCopiedCallback(false), 2000);
  };

  const handleOAuthClick = async () => {
    setIsSubmitting(true);
    clearError();
    try {
      await loginWithOAuth();
      // Popup handles the rest via message event
    } catch (err: any) {
      console.warn('OAuth flow error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patInput.trim()) return;

    setIsSubmitting(true);
    const success = await loginWithToken(patInput);
    setIsSubmitting(false);
    if (success) {
      setPatInput('');
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center">
            <Github size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isAuthenticated ? 'GitHub Account Connected' : 'Connect GitHub Account'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {isAuthenticated ? `Signed in as @${user?.login}` : 'Import repositories and push code fixes directly'}
            </p>
          </div>
        </div>
      }
    >
      {isAuthenticated && user ? (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-12 h-12 rounded-xl ring-2 ring-indigo-500/30 object-cover"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {user.name || user.login}
                  </h4>
                  <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">@{user.login}</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-zinc-400 mt-1 font-mono">
                  <span>{user.public_repos} Public Repos</span>
                  {user.bio && <span>• {user.bio}</span>}
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Connected</span>
            </span>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
              Permissions & Scopes Active
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex items-start space-x-2.5">
                <ShieldCheck size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-zinc-200">repo:read & write</span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Detect & import code, create fix branches & PRs.</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex items-start space-x-2.5">
                <Lock size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-zinc-200">User Profile</span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Read basic profile and repository metadata.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-zinc-800">
            <a
              href={user.html_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
            >
              <span>View GitHub Profile</span>
              <ExternalLink size={12} />
            </a>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-lg border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer"
            >
              Disconnect GitHub Account
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Tab selector */}
          <div className="flex p-1 bg-slate-100 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-medium">
            <button
              onClick={() => setAuthMode('oauth')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                authMode === 'oauth'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Github size={14} />
              <span>GitHub OAuth (Recommended)</span>
            </button>
            <button
              onClick={() => setAuthMode('pat')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                authMode === 'pat'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Key size={14} />
              <span>Personal Access Token (PAT)</span>
            </button>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start space-x-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {authMode === 'oauth' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-300 space-y-2">
                <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold">
                  <Sparkles size={15} className="text-indigo-500" />
                  <span>Instant 1-Click Authentication</span>
                </div>
                <p className="text-[12px] leading-relaxed text-slate-500 dark:text-zinc-400">
                  Connect your GitHub account to directly list your public and private repositories, run AST scans, and automatically open PRs with verified security patches.
                </p>
              </div>

              <button
                onClick={handleOAuthClick}
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50"
              >
                <Github size={18} />
                <span>{isSubmitting ? 'Opening GitHub Authorization...' : 'Sign in with GitHub'}</span>
                <ArrowRight size={16} />
              </button>

              {/* Developer Configuration Info */}
              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                  <span className="flex items-center space-x-1">
                    <Info size={12} />
                    <span>OAuth App Callback URL:</span>
                  </span>
                  <button
                    onClick={handleCopyCallback}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedCallback ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copiedCallback ? 'Copied!' : 'Copy URL'}</span>
                  </button>
                </div>
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 font-mono text-[11px] text-slate-700 dark:text-zinc-300 break-all select-all">
                  {callbackUrl}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePatSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>GitHub Personal Access Token (classic or fine-grained)</span>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo,read:user"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 text-[11px]"
                  >
                    <span>Generate Token</span>
                    <ExternalLink size={10} />
                  </a>
                </label>
                <input
                  type="password"
                  value={patInput}
                  onChange={(e) => setPatInput(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs font-mono text-slate-900 dark:text-white outline-none"
                />
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Required scopes: <code className="bg-slate-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-300 font-mono">repo</code> (for private repos & PR creation), <code className="bg-slate-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-300 font-mono">read:user</code>.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !patInput.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Key size={14} />
                <span>{isSubmitting ? 'Verifying Token...' : 'Connect with Token'}</span>
              </button>
            </form>
          )}
        </div>
      )}
    </Modal>
  );
}
