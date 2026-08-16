import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { GitHubRepo, GitHubUser } from '../types';
import { fetchGitHubRepos, fetchGitHubUser, getGitHubAuthUrl, GitHubAuthUrlResponse } from '../services/githubService';

const GITHUB_TOKEN_KEY = 'colens_github_token';

interface GitHubContextType {
  user: GitHubUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  repos: GitHubRepo[];
  isLoadingRepos: boolean;
  oauthConfig: GitHubAuthUrlResponse | null;
  authError: string | null;
  loginWithOAuth: () => Promise<void>;
  loginWithToken: (patToken: string) => Promise<boolean>;
  logout: () => void;
  refreshRepos: () => Promise<void>;
  clearError: () => void;
}

const GitHubContext = createContext<GitHubContextType | undefined>(undefined);

export const GitHubProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(GITHUB_TOKEN_KEY));
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState<boolean>(false);
  const [oauthConfig, setOauthConfig] = useState<GitHubAuthUrlResponse | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Fetch OAuth configuration on mount
  useEffect(() => {
    getGitHubAuthUrl()
      .then(config => setOauthConfig(config))
      .catch(err => console.warn('Could not fetch OAuth config:', err));
  }, []);

  // Hydrate user when token changes
  useEffect(() => {
    if (!token) {
      setUser(null);
      setRepos([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setAuthError(null);

    fetchGitHubUser(token)
      .then(userData => {
        if (isMounted) {
          setUser(userData);
          setIsLoading(false);
          // Auto fetch repos
          fetchReposForToken(token);
        }
      })
      .catch(err => {
        console.warn('GitHub token invalid or expired:', err);
        if (isMounted) {
          localStorage.removeItem(GITHUB_TOKEN_KEY);
          setToken(null);
          setUser(null);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const fetchReposForToken = async (authToken: string) => {
    setIsLoadingRepos(true);
    try {
      const fetchedRepos = await fetchGitHubRepos(authToken);
      setRepos(fetchedRepos);
    } catch (err: any) {
      console.warn('Failed to load repos:', err);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  // Listen for OAuth message from callback popup window
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      // Validate origin if needed (preview run.app or localhost)
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }

      if (event.data?.type === 'GITHUB_OAUTH_SUCCESS') {
        const { token: newToken, user: userData } = event.data;
        if (newToken) {
          localStorage.setItem(GITHUB_TOKEN_KEY, newToken);
          setToken(newToken);
          if (userData) {
            setUser(userData);
          }
          setAuthError(null);
        }
      } else if (event.data?.type === 'GITHUB_OAUTH_ERROR') {
        setAuthError(event.data.error || 'GitHub authorization failed');
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const loginWithOAuth = useCallback(async () => {
    setAuthError(null);
    try {
      const config = await getGitHubAuthUrl();
      setOauthConfig(config);

      if (!config.configured || !config.url) {
        throw new Error(config.message || 'GitHub OAuth credentials (GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET) are not configured. You can use a GitHub Personal Access Token (PAT) below.');
      }

      const width = 600;
      const height = 750;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const authWindow = window.open(
        config.url,
        'github_oauth_popup',
        `width=${width},height=${height},top=${top},left=${left},status=no,toolbar=no,menubar=no`
      );

      if (!authWindow) {
        setAuthError('Popup blocked by browser. Please allow popups for this site or use a Personal Access Token.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to initiate GitHub OAuth');
      throw err;
    }
  }, []);

  const loginWithToken = useCallback(async (patToken: string): Promise<boolean> => {
    const cleanToken = patToken.trim();
    if (!cleanToken) {
      setAuthError('Please enter a valid GitHub token');
      return false;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      const userData = await fetchGitHubUser(cleanToken);
      localStorage.setItem(GITHUB_TOKEN_KEY, cleanToken);
      setToken(cleanToken);
      setUser(userData);
      setIsLoading(false);
      fetchReposForToken(cleanToken);
      return true;
    } catch (err: any) {
      setIsLoading(false);
      setAuthError(err.message || 'Invalid GitHub token. Please verify scopes (repo, read:user).');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(GITHUB_TOKEN_KEY);
    setToken(null);
    setUser(null);
    setRepos([]);
    setAuthError(null);
  }, []);

  const refreshRepos = useCallback(async () => {
    if (token) {
      await fetchReposForToken(token);
    }
  }, [token]);

  const clearError = useCallback(() => setAuthError(null), []);

  return (
    <GitHubContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        repos,
        isLoadingRepos,
        oauthConfig,
        authError,
        loginWithOAuth,
        loginWithToken,
        logout,
        refreshRepos,
        clearError
      }}
    >
      {children}
    </GitHubContext.Provider>
  );
};

export const useGitHub = () => {
  const context = useContext(GitHubContext);
  if (!context) {
    throw new Error('useGitHub must be used within a GitHubProvider');
  }
  return context;
};
