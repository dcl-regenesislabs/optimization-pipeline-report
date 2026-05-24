import { useState } from 'react';
import { API_BASE_URL } from '../../config';
import type { EntityType } from '../../types';

const COOKIE_NAME = 'queue_trigger_password';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const BATCH_SIZE = 500;

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, maxAge: number): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Strict`;
}

interface EntityToQueue {
  entityId: string;
  entityType: EntityType;
}

interface BulkQueueButtonProps {
  entities: EntityToQueue[];
  label?: string;
}

interface QueueProgress {
  total: number;
  queued: number;
  failed: number;
  done: boolean;
}

export function BulkQueueButton({ entities, label }: BulkQueueButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isQueuing, setIsQueuing] = useState(false);
  const [progress, setProgress] = useState<QueueProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const count = entities.length;

  if (count === 0) return null;

  const handleClick = () => {
    const stored = getCookie(COOKIE_NAME);
    if (stored) {
      setPassword(stored);
    } else {
      setPassword('');
    }
    setShowModal(true);
    setProgress(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!password) return;

    setIsQueuing(true);
    setError(null);
    setProgress({ total: count, queued: 0, failed: 0, done: false });

    // Group by entity type
    const grouped: Record<string, string[]> = {};
    for (const e of entities) {
      if (!grouped[e.entityType]) grouped[e.entityType] = [];
      grouped[e.entityType].push(e.entityId);
    }

    let totalQueued = 0;
    let totalFailed = 0;

    try {
      for (const [entityType, ids] of Object.entries(grouped)) {
        // Send in batches
        for (let i = 0; i < ids.length; i += BATCH_SIZE) {
          const batch = ids.slice(i, i + BATCH_SIZE);

          const response = await fetch(`${API_BASE_URL}/api/monitoring/queue-bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              password,
              sceneIds: batch,
              entityType,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            if (response.status === 401) {
              setError('Invalid password');
              setIsQueuing(false);
              return;
            }
            setError(data.error || 'Failed to queue items');
            setIsQueuing(false);
            return;
          }

          setCookie(COOKIE_NAME, password, COOKIE_MAX_AGE);
          totalQueued += data.queued || 0;
          totalFailed += data.failed || 0;
          setProgress({ total: count, queued: totalQueued, failed: totalFailed, done: false });
        }
      }

      setProgress({ total: count, queued: totalQueued, failed: totalFailed, done: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsQueuing(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setPassword('');
    setProgress(null);
    setError(null);
  };

  return (
    <>
      <button className="add-to-priority-btn" onClick={handleClick}>
        {label || `Re-queue (${count})`}
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content priority-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={handleClose}>&times;</button>
            <h3>Re-queue for Processing</h3>

            {!progress && !isQueuing && (
              <>
                <p className="modal-description">
                  This will add <strong>{count}</strong> item(s) to the priority queue for re-processing.
                </p>
                <div className="modal-form">
                  <label>
                    Password:
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && password && handleSubmit()}
                    />
                  </label>
                </div>
                {error && <div className="modal-error">{error}</div>}
                <div className="modal-actions">
                  <button onClick={handleClose} className="modal-btn cancel">Cancel</button>
                  <button onClick={handleSubmit} className="modal-btn submit" disabled={!password}>
                    Add to Queue
                  </button>
                </div>
              </>
            )}

            {isQueuing && progress && (
              <div className="modal-loading">
                <div className="spinner" />
                <p>Queuing... {progress.queued} / {progress.total}</p>
              </div>
            )}

            {progress?.done && (
              <div className="modal-result">
                <div className={`result-summary ${progress.failed > 0 ? 'partial' : 'success'}`}>
                  <div className="result-icon">{progress.failed === 0 ? '✓' : '⚠'}</div>
                  <div className="result-text">
                    <strong>{progress.queued}</strong> of <strong>{progress.total}</strong> items queued
                    {progress.failed > 0 && <> ({progress.failed} failed)</>}
                  </div>
                </div>
                {error && <div className="modal-error">{error}</div>}
                <div className="modal-actions">
                  <button onClick={handleClose} className="modal-btn submit">Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
