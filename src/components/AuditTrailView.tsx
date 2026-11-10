/**
 * Immutable Audit Trail & Medical-Legal Governance Explorer.
 * Cryptographic SHA-256 provenance logging for FDA SaMD compliance.
 */
import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  FileSpreadsheet,
  Clock
} from 'lucide-react';
import { AuditLogEntry, ReviewStatus } from '../types/medical';

interface AuditTrailViewProps {
  auditLogs: AuditLogEntry[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.accessionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.clinicalNotes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.tamperProofHash.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      log.newStatus === statusFilter ||
      (statusFilter === 'APPROVED' && log.actionType.includes('APPROVED')) ||
      (statusFilter === 'REJECTED' && log.actionType.includes('REJECTED'));

    return matchesSearch && matchesStatus;
  });

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `radpulse_audit_trail_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportToCsv = () => {
    const headers = ['Timestamp', 'Accession', 'Image Title', 'Reviewer', 'Role', 'Action', 'Previous Status', 'New Status', 'SHA256 Hash', 'Notes'];
    const rows = auditLogs.map((log) => [
      `"${log.timestamp}"`,
      `"${log.accessionNumber}"`,
      `"${log.imageTitle}"`,
      `"${log.reviewerName}"`,
      `"${log.reviewerRole}"`,
      `"${log.actionType}"`,
      `"${log.previousStatus}"`,
      `"${log.newStatus}"`,
      `"${log.tamperProofHash}"`,
      `"${log.clinicalNotes.replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `radpulse_audit_trail_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/70 border border-emerald-800/40 rounded-lg text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Immutable Clinical Decision Audit Trail</h2>
            <p className="text-xs text-slate-400">
              Cryptographically chained SHA-256 event logs for hospital compliance and legal chain of custody.
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportToJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={exportToCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Accession, Doctor, Hash, or Notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Status Filter Segmented Controls */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          {(['ALL', 'APPROVED', 'REJECTED', 'OVERREAD_REQUESTED', 'BOARD_REVIEW'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Study Accession</th>
                <th className="py-3 px-4">Reviewer / Physician</th>
                <th className="py-3 px-4">Action & Status</th>
                <th className="py-3 px-4">Cryptographic Hash (SHA-256)</th>
                <th className="py-3 px-4">Clinical Findings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{log.timestamp}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-cyan-400 font-semibold whitespace-nowrap">
                        {log.accessionNumber}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-200">{log.reviewerName}</div>
                        <div className="text-[10px] text-slate-500">{log.reviewerRole}</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {log.newStatus === 'APPROVED' ? (
                            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approved
                            </span>
                          ) : log.newStatus === 'REJECTED' ? (
                            <span className="flex items-center gap-1 text-rose-400 font-semibold">
                              <XCircle className="w-3.5 h-3.5" />
                              Rejected
                            </span>
                          ) : log.newStatus === 'OVERREAD_REQUESTED' ? (
                            <span className="flex items-center gap-1 text-amber-400 font-semibold">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Overread
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-purple-400 font-semibold">
                              <Users className="w-3.5 h-3.5" />
                              Board Review
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 font-mono">
                            ({log.previousStatus} → {log.newStatus})
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5 bg-slate-950/60 px-2 py-1 rounded border border-slate-800 w-fit">
                          <span className="text-slate-400 truncate max-w-[120px]">
                            {log.tamperProofHash.slice(0, 16)}...
                          </span>
                          <button
                            onClick={() => copyToClipboard(log.tamperProofHash)}
                            className="text-slate-400 hover:text-cyan-400 transition-colors p-0.5 cursor-pointer"
                            title="Copy full SHA-256 hash"
                          >
                            {copiedHash === log.tamperProofHash ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-300 max-w-[280px] truncate" title={log.clinicalNotes}>
                        {log.clinicalNotes}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
