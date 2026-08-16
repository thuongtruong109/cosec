import React, { useState } from 'react';
import TopNav from './components/TopNav';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import ProjectUpload from './pages/ProjectUpload';
import AnalysisScreen from './pages/AnalysisScreen';
import DashboardView from './pages/DashboardView';
import CodeExplorerView from './pages/CodeExplorerView';
import IssuesView from './pages/IssuesView';
import SecurityView from './pages/SecurityView';
import ArchitectureView from './pages/ArchitectureView';
import DependenciesView from './pages/DependenciesView';
import ChatView from './pages/ChatView';
import RefactorView from './pages/RefactorView';
import TestGeneratorView from './pages/TestGeneratorView';
import ReportView from './pages/ReportView';
import SettingsView from './pages/SettingsView';

import { Project, AnalysisResult } from './types';
import { SAMPLE_PROJECT_PAYMENT_API, SAMPLE_ANALYSIS_RESULT } from './data/sampleProjects';

export default function App() {
  const [activeView, setActiveView] = useState<string>('landing');
  const [project, setProject] = useState<Project | null>(SAMPLE_PROJECT_PAYMENT_API);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(SAMPLE_ANALYSIS_RESULT);

  // Jump to specific file / line in Code Explorer
  const [explorerTarget, setExplorerTarget] = useState<{ file?: string; line?: number }>({});

  const handleNavigateToExplorer = (filePath?: string, line?: number) => {
    setExplorerTarget({ file: filePath, line });
    setActiveView('explorer');
  };

  const handleProjectLoaded = (newProject: Project) => {
    setProject(newProject);
    setActiveView('analysis');
  };

  const handleAnalysisComplete = (newAnalysis: AnalysisResult) => {
    setAnalysis(newAnalysis);
    setActiveView('dashboard');
  };

  // Mutate file content in memory when user applies a fix
  const handleApplyFixToFile = (filePath: string, newContent: string, issueId?: string) => {
    if (!project) return;

    // Update file
    const updatedFiles = project.files.map((f) =>
      f.path === filePath ? { ...f, content: newContent } : f
    );
    setProject({ ...project, files: updatedFiles });

    // Mark issue as fixed if issueId provided
    if (analysis && issueId) {
      const updatedIssues = analysis.issues.map((i) =>
        i.id === issueId ? { ...i, status: 'fixed' as const } : i
      );
      setAnalysis({ ...analysis, issues: updatedIssues });
    }
  };

  const showSidebarAndNav = activeView !== 'landing' && activeView !== 'analysis';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Nav Header */}
      {activeView !== 'landing' && (
        <TopNav
          project={project}
          analysis={analysis}
          onSelectProject={(p) => setProject(p)}
          onNavigate={(v) => setActiveView(v)}
          onSearchSelectFile={(f, l) => handleNavigateToExplorer(f, l)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebarAndNav && (
          <Sidebar
            activeView={activeView}
            onNavigate={(v) => setActiveView(v)}
            project={project}
            analysis={analysis}
          />
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-zinc-950">
          {activeView === 'landing' && (
            <LandingPage
              onStartUpload={() => setActiveView('upload')}
              onExploreDemo={() => {
                setProject(SAMPLE_PROJECT_PAYMENT_API);
                setAnalysis(SAMPLE_ANALYSIS_RESULT);
                setActiveView('dashboard');
              }}
            />
          )}

          {activeView === 'upload' && (
            <ProjectUpload
              onProjectLoaded={handleProjectLoaded}
              onStartDemo={() => {
                setProject(SAMPLE_PROJECT_PAYMENT_API);
                setAnalysis(SAMPLE_ANALYSIS_RESULT);
                setActiveView('dashboard');
              }}
            />
          )}

          {activeView === 'analysis' && project && (
            <AnalysisScreen
              project={project}
              onAnalysisComplete={handleAnalysisComplete}
            />
          )}

          {activeView === 'dashboard' && (
            <DashboardView
              analysis={analysis}
              onNavigateExplorer={handleNavigateToExplorer}
              onNavigateIssues={() => setActiveView('issues')}
            />
          )}

          {activeView === 'explorer' && (
            <CodeExplorerView
              project={project}
              analysis={analysis}
              initialFile={explorerTarget.file}
              initialLine={explorerTarget.line}
              onApplyFixToFile={handleApplyFixToFile}
            />
          )}

          {activeView === 'issues' && (
            <IssuesView
              analysis={analysis}
              onNavigateExplorer={handleNavigateToExplorer}
            />
          )}

          {activeView === 'security' && (
            <SecurityView
              analysis={analysis}
              onNavigateExplorer={handleNavigateToExplorer}
            />
          )}

          {activeView === 'architecture' && (
            <ArchitectureView
              analysis={analysis}
              onAskAIAboutArchitecture={() => setActiveView('chat')}
            />
          )}

          {activeView === 'dependencies' && (
            <DependenciesView analysis={analysis} />
          )}

          {activeView === 'chat' && (
            <ChatView
              project={project}
              onNavigateFile={handleNavigateToExplorer}
            />
          )}

          {activeView === 'refactor' && (
            <RefactorView
              project={project}
              onApplyRefactoredCode={handleApplyFixToFile}
            />
          )}

          {activeView === 'tests' && (
            <TestGeneratorView project={project} />
          )}

          {activeView === 'report' && (
            <ReportView analysis={analysis} />
          )}

          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}
