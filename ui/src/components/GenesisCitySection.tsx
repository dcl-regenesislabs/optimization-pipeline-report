import { useState, useCallback } from 'react';
import type { MapView, LandData, Stats } from '../types';
import { StatsGrid } from './StatsGrid';
import { ProgressBar } from './ProgressBar';
import { WorldMap } from './WorldMap/WorldMap';
import { ViewToggle } from './ViewToggle';
import { Legend } from './Legend';
import { Tooltip } from './Tooltip';
import { ReportModal } from './ReportModal';

interface GenesisCitySectionProps {
  lands: LandData[];
  stats: Stats;
  sceneColorIndices: Record<string, number>;
}

export function GenesisCitySection({ lands, stats, sceneColorIndices }: GenesisCitySectionProps) {
  const [mapView, setMapView] = useState<MapView>('optimization');
  const [hoveredLand, setHoveredLand] = useState<{ land: LandData; x: number; y: number } | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);

  const handleLandClick = useCallback((land: LandData) => {
    if (land.sceneId) {
      setSelectedSceneId(land.sceneId);
    }
  }, []);

  const handleLandHover = useCallback((land: LandData | null, x: number, y: number) => {
    if (land) {
      setHoveredLand({ land, x, y });
    } else {
      setHoveredLand(null);
    }
  }, []);

  return (
    <>
      <ProgressBar percentage={stats.optimizationPercentage} />
      <StatsGrid stats={stats} />

      <div className="map-section">
        <h2 className="map-title">Interactive World Map</h2>
        <ViewToggle currentView={mapView} onViewChange={setMapView} />
        <WorldMap
          lands={lands}
          sceneColorIndices={sceneColorIndices}
          view={mapView}
          onLandClick={handleLandClick}
          onLandHover={handleLandHover}
        />
        <Legend view={mapView} />
      </div>

      {hoveredLand && (
        <Tooltip land={hoveredLand.land} x={hoveredLand.x} y={hoveredLand.y} />
      )}

      <ReportModal sceneId={selectedSceneId} entityType="scene" onClose={() => setSelectedSceneId(null)} />
    </>
  );
}
