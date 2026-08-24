import React, { useState, useMemo } from 'react';
import { 
  Github, 
  Search, 
  Star, 
  GitFork, 
  Lock, 
  Globe, 
  GitBranch, 
  RefreshCw, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  FileCode,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { useGitHub } from '../context/GitHubContext';
import { importGitHubRepo } from '../services/githubService';
import { GitHubRepo, Project } from '../types';
import GitHubAuthModal from './GitHubAuthModal';

interface GitHubRepoBrowserProps {
  onProjectImported: (project: Project) => void;
}

export default function GitHubRepoBrowser({ onProjectImported }: GitHubRepoBrowserProps) {
  const { user, token, isAuthenticated, repos, isLoadingRepos, refreshRepos } = useGitHub();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  
  const [importingRepoId, setImportingRepoId] = useState<number | null>(null);
  const [importProgress, setImportProgress] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);

  // Extract unique languages
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    repos.forEach((r) => {
      if (r.language) langs.add(r.language);
    });
    return Array.from(langs).sort();
  }, [repos]);

  // Filtered repositories
  const filteredRepos = useMemo(() => {
    return repos.filter((repo) => {
      if (filterType === 'public' && repo.private) return false;
      if (filterType === 'private' && !repo.private) return false;
      if (selectedLanguage !== 'all' && repo.language !== selectedLanguage) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = repo.name.toLowerCase().includes(q);
        const matchesDesc = repo.description?.toLowerCase().includes(q);
        const matchesLang = repo.language?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesLang) return false;
      }

      return true;
    });
  }, [repos, filterType, selectedLanguage, searchQuery]);

  const handleImport = async (repo: GitHubRepo) => {
    setImportingRepoId(repo.id);
    setImportProgress(`Fetching ${repo.full_name} AST file tree...`);
    setImportError(null);

    try {
      const res = await importGitHubRepo(repo.owner.login, repo.name, repo.default_branch, token || undefined);
      if (res.success && res.project) {
        setImportProgress('Repository indexed! Launching code review...');
        setTimeout(() => {
          onProjectImported(res.project);
        }, 400);
      } else {
        throw new Error(res.error || 'Failed to import repository files');
      }
    } catch (err: any) {
      console.error('Import repository error:', err);
      setImportError(err.message || `Failed to import ${repo.full_name}. Please ensure repository has readable source files.`);
      setImportingRepoId(null);
      setImportProgress('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center mx-auto shadow-lg">
          <Github size={32} />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Connect Your GitHub Account
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Directly detect and list your public and private repositories, review full codebases, and push 1-click automated security patches.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <Github size={16} />
            <span>Connect GitHub Account</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-center space-x-6 text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
          <span className="flex items-center space-x-1.5">
            <Lock size={12} className="text-emerald-500" />
            <span>Private Repos Supported</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <Sparkles size={12} className="text-indigo-500" />
            <span>Automated Pull Requests</span>
          </span>
        </div>

        <GitHubAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header bar with user info & refresh */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <img
            src={user?.avatar_url}
            alt={user?.login}
            className="w-10 h-10 rounded-xl ring-2 ring-indigo-500/20 object-cover"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {user?.name || user?.login}
              </h4>
              <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">@{user?.login}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Showing {filteredRepos.length} of {repos.length} repositories
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => refreshRepos()}
            disabled={isLoadingRepos}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh repository list"
          >
            <RefreshCw size={13} className={isLoadingRepos ? 'animate-spin text-indigo-500' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            Account Settings
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search repositories by name, description or language..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter type */}
        <div className="flex items-center space-x-1 p-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('public')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filterType === 'public'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Public
          </button>
          <button
            onClick={() => setFilterType('private')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filterType === 'private'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Private
          </button>
        </div>

        {/* Language selector if multiple */}
        {availableLanguages.length > 0 && (
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-800 dark:text-zinc-200 outline-none focus:border-indigo-500 cursor-pointer w-full sm:w-auto"
          >
            <option value="all">All Languages</option>
            {availableLanguages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        )}
      </div>

      {importError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start space-x-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{importError}</span>
        </div>
      )}

      {/* Repositories List */}
      {isLoadingRepos ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/2" />
              <div className="h-3 bg-slate-100 dark:bg-zinc-800/60 rounded w-3/4" />
              <div className="h-4 bg-slate-100 dark:bg-zinc-800/40 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredRepos.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
            No repositories found matching your query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredRepos.map((repo) => {
            const isImporting = importingRepoId === repo.id;

            return (
              <div
                key={repo.id}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/40 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-1.5 truncate">
                      {repo.private ? (
                        <Lock size={13} className="text-amber-500 shrink-0" />
                      ) : (
                        <Globe size={13} className="text-slate-400 dark:text-zinc-500 shrink-0" />
                      )}
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-mono">
                        {repo.name}
                      </h4>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700/60 shrink-0 flex items-center space-x-1">
                      <GitBranch size={10} />
                      <span>{repo.default_branch}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1 min-h-[32px]">
                    {repo.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-zinc-400 font-mono">
                    {repo.language && (
                      <span className="flex items-center space-x-1 font-semibold text-slate-700 dark:text-zinc-300">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span>{repo.language}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-0.5">
                      <Star size={12} className="text-amber-500" />
                      <span>{repo.stargazers_count}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleImport(repo)}
                    disabled={isImporting || importingRepoId !== null}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw size={12} className="animate-spin" />
                        <span>Importing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} className="text-indigo-400 dark:text-indigo-600" />
                        <span>Import & Audit</span>
                      </>
                    )}
                  </button>
                </div>

                {isImporting && importProgress && (
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[11px] font-mono flex items-center space-x-2">
                    <RefreshCw size={11} className="animate-spin shrink-0" />
                    <span className="truncate">{importProgress}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <GitHubAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
