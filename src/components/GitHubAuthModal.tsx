import React, { useState, useEffect } from 'react';
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
  Info,
  CheckCircle2,
  HelpCircle
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
  const [authMode, setAuthMode] = useState<'oauth' | 'pat'>('pat');
  const [patInput, setPatInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCallback, setCopiedCallback] = useState(false);

  // Auto detect if OAuth is configured; if not, prefer PAT tab seamlessly
  useEffect(() => {
    if (oauthConfig && oauthConfig.configured) {
      setAuthMode('oauth');
    } else {
      setAuthMode('pat');
    }
  }, [oauthConfig]);

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
      if (!oauthConfig?.configured) {
        setAuthMode('pat');
        setIsSubmitting(false);
        return;
      }
      await loginWithOAuth();
    } catch (err: any) {
      console.warn('OAuth flow note:', err);
      // If OAuth not configured, fallback to PAT cleanly
      setAuthMode('pat');
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
              onClick={() => setAuthMode('pat')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                authMode === 'pat'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Key size={14} />
              <span>Personal Access Token (Instant)</span>
            </button>
            <button
              onClick={() => setAuthMode('oauth')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                authMode === 'oauth'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Github size={14} />
              <span>OAuth Sign-In</span>
            </button>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start space-x-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {authMode === 'pat' ? (
            <form onSubmit={handlePatSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-300 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-slate-900 dark:text-white font-semibold">
                    <Sparkles size={14} className="text-indigo-500" />
                    <span>Instant Direct Token Authentication</span>
                  </div>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo,read:user&description=Colens+AI+Code+Reviewer"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 text-[11px] font-semibold flex items-center space-x-1"
                  >
                    <span>1-Click Generate Token</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
                <p className="text-[12px] leading-relaxed text-slate-500 dark:text-zinc-400">
                  Generate a Personal Access Token on GitHub with <code className="bg-slate-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-300 font-mono">repo</code> and <code className="bg-slate-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-300 font-mono">read:user</code> scopes to access your repositories securely.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>GitHub Token (Classic or Fine-Grained)</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">Starts with ghp_ or github_pat_</span>
                </label>
                <input
                  type="password"
                  value={patInput}
                  onChange={(e) => setPatInput(e.target.value)}
                  placeholder="Paste ghp_... or github_pat_..."
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs font-mono text-slate-900 dark:text-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !patInput.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Key size={14} />
                <span>{isSubmitting ? 'Verifying Token & Scopes...' : 'Connect GitHub Token'}</span>
              </button>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                <span className="flex items-center gap-1">
                  <Lock size={12} className="text-emerald-500" />
                  <span>Stored securely in local browser session</span>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-indigo-500" />
                  <span>5,000 API req/hr</span>
                </span>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-300 space-y-2">
                <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold">
                  <Sparkles size={15} className="text-indigo-500" />
                  <span>GitHub OAuth App Authorization</span>
                </div>
                <p className="text-[12px] leading-relaxed text-slate-500 dark:text-zinc-400">
                  Connect through a registered GitHub OAuth application to grant instant repository access and 1-click Pull Request push abilities.
                </p>
              </div>

              {oauthConfig?.configured ? (
                <button
                  onClick={handleOAuthClick}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50"
                >
                  <Github size={18} />
                  <span>{isSubmitting ? 'Opening GitHub Authorization...' : 'Sign in with GitHub'}</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs space-y-2">
                  <div className="flex items-center space-x-1.5 font-semibold">
                    <Info size={14} className="text-amber-500 shrink-0" />
                    <span>OAuth App Not Configured</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-zinc-400">
                    To use OAuth sign-in, define <code className="font-mono bg-amber-500/20 px-1 py-0.5 rounded text-amber-800 dark:text-amber-200">GITHUB_CLIENT_ID</code> and <code className="font-mono bg-amber-500/20 px-1 py-0.5 rounded text-amber-800 dark:text-amber-200">GITHUB_CLIENT_SECRET</code> in your environment variables.
                  </p>
                  <button
                    onClick={() => setAuthMode('pat')}
                    className="mt-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-sm"
                  >
                    <Key size={13} />
                    <span>Switch to Personal Access Token (Instant)</span>
                  </button>
                </div>
              )}

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
          )}
        </div>
      )}
    </Modal>
  );
}
