import { describe, it, expect } from 'vitest';
import { parseGitUrl } from './gitUrlService';

describe('gitUrlService parseGitUrl', () => {
  it('parses standard GitHub repository URLs', () => {
    const result = parseGitUrl('https://github.com/facebook/react');
    expect(result).toEqual({
      provider: 'github',
      owner: 'facebook',
      repo: 'react',
      branch: 'main',
    });
  });

  it('parses GitHub URLs with .git suffix', () => {
    const result = parseGitUrl('https://github.com/vuejs/core.git');
    expect(result).toEqual({
      provider: 'github',
      owner: 'vuejs',
      repo: 'core',
      branch: 'main',
    });
  });

  it('parses GitHub tree branch URLs', () => {
    const result = parseGitUrl('https://github.com/vercel/next.js/tree/canary');
    expect(result).toEqual({
      provider: 'github',
      owner: 'vercel',
      repo: 'next.js',
      branch: 'canary',
    });
  });

  it('parses owner/repo shorthand notation', () => {
    const result = parseGitUrl('tailwindlabs/tailwindcss');
    expect(result).toEqual({
      provider: 'github',
      owner: 'tailwindlabs',
      repo: 'tailwindcss',
      branch: 'main',
    });
  });

  it('parses GitLab URLs with branch specification', () => {
    const result = parseGitUrl('https://gitlab.com/gitlab-org/gitlab/-/tree/master');
    expect(result).toEqual({
      provider: 'gitlab',
      owner: 'gitlab-org',
      repo: 'gitlab',
      branch: 'master',
    });
  });

  it('returns null for invalid inputs', () => {
    expect(parseGitUrl('')).toBeNull();
    expect(parseGitUrl('   ')).toBeNull();
    expect(parseGitUrl('invalid-single-token')).toBeNull();
  });
});
