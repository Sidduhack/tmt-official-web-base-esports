import { useState, type FormEvent } from 'react';
import { Competition, FairPlayReport, PlayerProfile, ReportReason } from '../../types';
import { API } from '../../services/api';
import {
  ShieldAlert,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Lock,
  ExternalLink,
  Plus,
  Radio,
  Eye,
  Info,
} from 'lucide-react';

interface Props {
  reports: FairPlayReport[];
  competitions: Competition[];
  currentUser: PlayerProfile | null;
  onRefreshData: () => void;
}

export function FairPlayView({ reports, competitions, currentUser, onRefreshData }: Props) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [targetUid, setTargetUid] = useState('');
  const [reason, setReason] = useState<ReportReason>('HACK_AIMBOT');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [selectedCompId, setSelectedCompId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReport = async (e: FormEvent) => {
    e.preventDefault();
    if (!targetUid || !description) {
      alert('Please fill out all mandatory report fields.');
      return;
    }

    setSubmitting(true);
    try {
      await API.submitFairPlayReport({
        targetPlayerUid: targetUid,
        reason,
        description,
        competitionId: selectedCompId || undefined,
        evidenceUrls: evidenceUrl ? [evidenceUrl] : [],
      });
      setShowReportModal(false);
      setTargetUid('');
      setDescription('');
      setEvidenceUrl('');
      onRefreshData();
      alert('Fair Play report filed successfully. Our verification stewards are reviewing the match telemetry.');
    } catch (err: any) {
      alert(err.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: FairPlayReport['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">Pending Review</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold animate-pulse">Under Telemetry Analysis</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">Action Taken</span>;
      case 'DISMISSED':
        return <span className="px-2.5 py-0.5 rounded bg-slate-700/60 text-slate-400 border border-slate-600 text-xs font-mono font-bold">Dismissed (Clean)</span>;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Fair Play Header Banner */}
      <div className="bg-gradient-to-r from-[#170e1b] via-[#0f1422] to-[#080d1a] p-6 sm:p-8 rounded-3xl border border-red-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold font-mono uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" /> Zero-Tolerance Anti-Cheat Protocol
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-heading">
            TMT Fair Play & Competitive Integrity
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            All TMT Official tournaments strictly prohibit third-party aimbots, script injectors, emulator bypasses, crosshair assistance, and unverified account sharing. Every incident is verified by our adjudication team.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => setShowReportModal(true)}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-red-600/20 transition cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Report Cheat / In-Game Violation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rules & Prohibitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0f1422] p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold font-mono">
            1
          </div>
          <h3 className="text-sm font-bold text-white font-heading">Scripts & Auto-Aim Mods</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Use of modified APKs, lua scripts, config files, headshot drag macros, or memory hooks leads to instantaneous and permanent UID blacklisting.
          </p>
        </div>

        <div className="bg-[#0f1422] p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono">
            2
          </div>
          <h3 className="text-sm font-bold text-white font-heading">Illegal Account Ringers</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Playing on an unregistered Free Fire UID or lending an account to another athlete results in immediate squad disqualification and slot forfeiture.
          </p>
        </div>

        <div className="bg-[#0f1422] p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold font-mono">
            3
          </div>
          <h3 className="text-sm font-bold text-white font-heading">Match Teaming & Feed</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Coordinated non-aggression pacts or kill-feeding between separate squads in Battle Royale lobbies will be stripped of tournament points and prizes.
          </p>
        </div>
      </div>

      {/* Incident Reports Table */}
      <div className="bg-[#0f1422] rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" /> Transparent Case Adjudication Ledger
            </h2>
            <p className="text-xs text-slate-400">
              Public tracking of community reports, telemetry audits, and disciplinary actions.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Total Audits: <strong className="text-white">{reports.length}</strong>
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {reports.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono">
              No reports filed yet. The tournament lobbies are currently clean.
            </div>
          ) : (
            reports.map(report => (
              <div key={report.reportId} className="py-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      Case #{report.reportId}
                    </span>
                    {getStatusBadge(report.status)}
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-red-400 font-mono">
                      Target UID: {report.targetPlayerUid}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(report.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <p>
                    <strong className="text-white">Violation Type:</strong>{' '}
                    <span className="text-amber-400 font-mono">{report.reason.replace(/_/g, ' ')}</span>
                  </p>
                  <p className="text-slate-400 leading-relaxed">{report.description}</p>
                  {report.adminNotes && (
                    <div className="mt-2 p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
                      <p className="font-bold text-emerald-400 font-mono">Adjudication Finding:</p>
                      <p className="text-slate-300 mt-0.5">{report.adminNotes}</p>
                      <p className="text-[11px] text-red-400 font-mono mt-1">Sanction: {report.penaltyApplied}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitReport}
            className="bg-[#0f1422] border border-red-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-white font-heading">Submit In-Game Violation Report</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Accused Player's Free Fire UID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1948201948"
                  value={targetUid}
                  onChange={e => setTargetUid(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono placeholder:text-slate-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Violation Category *</label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value as ReportReason)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="HACK_AIMBOT">Aimbot / Drag Headshot Script</option>
                  <option value="SPEED_HACK">Speed Hack / Teleport</option>
                  <option value="WALL_HACK_ESP">Wall Hack / ESP Box Detection</option>
                  <option value="TEAMING_COLLUSION">Match Teaming / Collusion</option>
                  <option value="UNREGISTERED_PLAYER_UID">Unregistered Player UID (Ringer)</option>
                  <option value="ACCOUNT_SHARING">Account Sharing / Multiple Logins</option>
                  <option value="TOXIC_BEHAVIOR">Harassment / Toxic Behavior</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Related Tournament Lobby (Optional)</label>
                <select
                  value={selectedCompId}
                  onChange={e => setSelectedCompId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="">General In-Game Incident</option>
                  {competitions.map(c => (
                    <option key={c.competitionId} value={c.competitionId}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Detailed Incident Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the match timestamp, spectator observations, and how the violation occurred..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:border-red-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Video / Screenshot Link (YouTube, Drive, Imgur)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={evidenceUrl}
                  onChange={e => setEvidenceUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/30"
              >
                {submitting ? 'Submitting Case...' : 'Submit Report to Stewards'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
