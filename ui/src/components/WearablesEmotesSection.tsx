import { useMemo } from 'react';
import { useOptimizationStats } from '../hooks/useOptimizationStats';
import type { WearableEmoteStats } from '../types';
import { formatNumber } from '../utils/formatters';
import { BulkQueueButton } from './shared/BulkQueueButton';

function EntityStatsGroup({ title, icon, stats, entityType }: {
  title: string;
  icon: string;
  stats: WearableEmoteStats;
  entityType: 'wearable' | 'emote';
}) {
  const failedEntities = useMemo(() =>
    stats.failedEntityIds.map(id => ({ entityId: id, entityType })),
    [stats.failedEntityIds, entityType]
  );

  return (
    <div className="entity-stats-group">
      <div className="entity-stats-header">
        <h3>{icon} {title}</h3>
        {failedEntities.length > 0 && (
          <BulkQueueButton
            entities={failedEntities}
            label={`Re-queue Failed (${failedEntities.length})`}
          />
        )}
      </div>
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
      <EntityStatsGroup title="Wearables" icon="👕" stats={data.wearables} entityType="wearable" />
      <EntityStatsGroup title="Emotes" icon="💃" stats={data.emotes} entityType="emote" />
    </div>
  );
}
