'use client';

import { Clock, FileText, CheckCircle } from 'lucide-react';
import { formatINR } from '@/lib/format';

export type VersionEntry = {
  id: string;
  timestamp: number;
  snapshot?: any; // Optional snapshot data for preview
};

type Props = {
  open: boolean;
  versions: VersionEntry[];
  onClose: () => void;
  onRestore: (versionId: string) => void;
  currentVersionId?: string;
};

export function VersionHistoryModal({ open, versions, onClose, currentVersionId }: Props) {
  if (!open) return null;

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getVersionSummary = (version: VersionEntry) => {
    if (!version.snapshot) return null;

    const snapshot = version.snapshot;
    console.log('snapshot', snapshot);
    const itemCount = snapshot.services?.length || 0;
    const total = snapshot.grandTotal || snapshot.total || 0;

    return {
      itemCount,
      total,
      hasIntro: !!snapshot.introHTML,
      hasTerms: !!snapshot.termsText,
    };
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-2xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Version History</h3>
            <span className="text-sm text-gray-500">
              ({versions.length} version{versions.length !== 1 ? 's' : ''})
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Version List */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {versions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No versions saved yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Versions are automatically saved when you make changes
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {versions.map((version, index) => {
                const summary = getVersionSummary(version);
                const isCurrent = version.id === currentVersionId;

                return (
                  <li
                    key={version.id}
                    className={`rounded-lg border ${
                      isCurrent
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } transition-all`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              Version {versions.length - index}
                            </span>
                            {isCurrent && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">
                                <CheckCircle className="h-3 w-3" />
                                Current
                              </span>
                            )}
                            {index === 0 && !isCurrent && (
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                Latest
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-gray-600">
                            {formatTimestamp(version.timestamp)}
                          </p>

                          {summary && (
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                              <span>
                                {summary.itemCount} item{summary.itemCount !== 1 ? 's' : ''}
                              </span>
                              <span>•</span>
                              <span>Total: {formatINR(summary.total)}</span>
                              {summary.hasIntro && (
                                <>
                                  <span>•</span>
                                  <span>✓ Introduction</span>
                                </>
                              )}
                              {summary.hasTerms && (
                                <>
                                  <span>•</span>
                                  <span>✓ Terms</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
      </div>
    </div>
  );
}
