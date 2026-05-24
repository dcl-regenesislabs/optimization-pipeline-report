import { useState, useCallback, useEffect } from 'react';
import type { TabName, OverviewSection } from '../types';
import { useReportData } from '../hooks/useReportData';
import { Header } from './Header';
import { TabNavigation } from './TabNavigation';
import { OverviewSubTabs } from './OverviewSubTabs';
import { GenesisCitySection } from './GenesisCitySection';
import { WorldsList } from './WorldsList';
import { WearablesEmotesSection } from './WearablesEmotesSection';
import { HistoryView } from './HistoryView';
import { PipelineMonitor } from './PipelineMonitor';
import { RankingView } from './RankingView';
import { FailingView } from './FailingView';

const TAB_HASH_MAP: Record<string, TabName> = {
  '#overview': 'overview',
  '#pipeline': 'pipeline',
  '#ranking': 'ranking',
  '#failing': 'failing',
  '#history': 'history',
};

const VALID_TABS: TabName[] = ['overview', 'pipeline', 'ranking', 'failing', 'history'];

function getTabFromHash(): TabName {
  const hash = window.location.hash;
  if (hash === '#worlds') return 'overview';
  return TAB_HASH_MAP[hash] || 'overview';
}

function getOverviewSectionFromHash(): OverviewSection {
  if (window.location.hash === '#worlds') return 'worlds';
  return 'genesis-city';
}

export default function App() {
  const { data, isLoading, error, generatingStatus } = useReportData();
  const [activeTab, setActiveTab] = useState<TabName>(getTabFromHash);
  const [overviewSection, setOverviewSection] = useState<OverviewSection>(getOverviewSectionFromHash);

  const handleTabChange = useCallback((tab: TabName) => {
    setActiveTab(tab);
    window.location.hash = tab;
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#worlds') {
        setActiveTab('overview');
        setOverviewSection('worlds');
        return;
      }
      const newTab = getTabFromHash();
      if (VALID_TABS.includes(newTab)) {
        setActiveTab(newTab);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const reportNotReady = !data && (isLoading || generatingStatus || error);

  const renderReportLoadingStatus = () => {
    if (isLoading && !generatingStatus) {
      return <div className="loading">Loading report data...</div>;
    }

    if (generatingStatus) {
      return (
        <div className="generating-status">
          <h2>{generatingStatus.generating ? 'Generating Report...' : 'Waiting for Report'}</h2>
          <p className="generating-message">{generatingStatus.progressMessage}</p>
          {generatingStatus.generating && (
            <div className="generating-progress">
              <div className="generating-progress-bar">
                <div
                  className="generating-progress-fill"
                  style={{ width: `${generatingStatus.progress}%` }}
                />
              </div>
              <span className="generating-progress-text">{generatingStatus.progress.toFixed(1)}%</span>
            </div>
          )}
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-message">
          Failed to load report: {error}
        </div>
      );
    }

    return null;
  };

  const renderOverviewContent = () => {
    if (overviewSection === 'wearables-emotes') {
      return <WearablesEmotesSection />;
    }

    if (reportNotReady) {
      return renderReportLoadingStatus();
    }

    if (!data) return null;

    if (overviewSection === 'genesis-city') {
      return (
        <GenesisCitySection
          lands={data.lands}
          stats={data.stats}
          sceneColorIndices={data.sceneColorIndices}
        />
      );
    }

    if (overviewSection === 'worlds') {
      return <WorldsList worlds={data.worlds} stats={data.worldsStats} />;
    }

    return null;
  };

  return (
    <div className="container">
      <Header generatedAt={data?.generatedAt || null} />
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === 'overview' && (
        <div className="tab-content active">
          <OverviewSubTabs activeSection={overviewSection} onSectionChange={setOverviewSection} />
          {renderOverviewContent()}
        </div>
      )}

      {activeTab === 'pipeline' && (
        <div className="tab-content active">
          <PipelineMonitor />
        </div>
      )}

      {activeTab === 'ranking' && (
        <div className="tab-content active">
          <RankingView />
        </div>
      )}

      {activeTab === 'failing' && (
        <div className="tab-content active">
          <FailingView
            worlds={data?.worlds || []}
            lands={data?.lands || []}
            generatingStatus={generatingStatus}
          />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="tab-content active">
          <HistoryView />
        </div>
      )}
    </div>
  );
}
