import { GitHubRepo, GitHubUser, GitHubPushFixRequest, GitHubPushFixResult, Project } from '../types';

export interface GitHubAuthUrlResponse {
  configured: boolean;
  url: string | null;
  redirectUri: string;
  message?: string;
}

export interface GitHubImportResponse {
  success: boolean;
  project: Project;
  repoInfo: {
    fullName: string;
    defaultBranch: string;
    isPrivate: boolean;
    stars: number;
    url: string;
  };
  error?: string;
}

export async function getGitHubAuthUrl(): Promise<GitHubAuthUrlResponse> {
  const origin = window.location.origin;
  const res = await fetch(`/api/auth/github/url?origin=${encodeURIComponent(origin)}`);
  if (!res.ok) {
    throw new Error('Failed to retrieve GitHub auth URL');
  }
  return res.json();
}

export async function fetchGitHubUser(token: string): Promise<GitHubUser> {
  const res = await fetch('/api/github/user', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to authenticate with GitHub');
  }

  const data = await res.json();
  return data.user;
}

export async function fetchGitHubRepos(token: string): Promise<GitHubRepo[]> {
  const res = await fetch('/api/github/repos', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch repositories from GitHub');
  }

  const data = await res.json();
  return data.repos || [];
}

export async function importGitHubRepo(
  owner: string,
  repo: string,
  branch?: string,
  token?: string
): Promise<GitHubImportResponse> {
  const res = await fetch('/api/github/import-repo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({
      owner,
      repo,
      branch,
      token
    })
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to import repository ${owner}/${repo}`);
  }

  return res.json();
}

export async function pushFixToGitHub(
  payload: GitHubPushFixRequest,
  token: string
): Promise<GitHubPushFixResult> {
  const res = await fetch('/api/github/push-fix', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to push fix to GitHub');
  }

  return res.json();
}
