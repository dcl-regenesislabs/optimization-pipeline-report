import { useOptimizationStats } from '../hooks/useOptimizationStats';
import type { WearableEmoteStats } from '../types';
import { formatNumber } from '../utils/formatters';

function EntityStatsGroup({ title, icon, stats }: { title: string; icon: string; stats: WearableEmoteStats }) {
  return (
    <div className="entity-stats-group">
      <h3>{icon} {title}</h3>
      <div className="worlds-stats">
        <div className="stat-card">
          <div className="stat-value">{formatNumber(stats.total)}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card optimized">
          <div className="stat-value">{formatNumber(stats.success)}</div>
          <div className="stat-label">Optimized</div>
        </div>
        <div className="stat-card not-optimized">
          <div className="stat-value">{formatNumber(stats.failed)}</div>
          <div className="stat-label">Failed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.optimizationPercentage}%</div>
          <div className="stat-label">Success Rate</div>
        </div>
      </div>
    </div>
  );
}

export function WearablesEmotesSection() {
  const { data, isLoading, error } = useOptimizationStats();

  if (isLoading) {
    return <div className="loading">Loading optimization stats...</div>;
  }

  if (error) {
    return <div className="error-message">Failed to load stats: {error}</div>;
  }

  if (!data) {
    return <div className="loading">No data available.</div>;
  }

  const hasData = data.wearables.total > 0 || data.emotes.total > 0;

  if (!hasData) {
    return (
      <div className="wearables-emotes-section">
        <p>No wearable or emote optimization data available yet. Data will appear here once the pipeline processes wearables and emotes.</p>
      </div>
    );
  }

  return (
    <div className="wearables-emotes-section">
      <EntityStatsGroup title="Wearables" icon="👕" stats={data.wearables} />
      <EntityStatsGroup title="Emotes" icon="💃" stats={data.emotes} />
    </div>
  );
}
