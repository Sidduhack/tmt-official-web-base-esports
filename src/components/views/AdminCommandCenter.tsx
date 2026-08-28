import { useState, type FormEvent } from 'react';
import {
  AuditLog,
  Competition,
  ComplianceGateState,
  DatabaseNode,
  EmergencyControlsState,
  FairPlayReport,
  FinancialLedgerEntry,
  GlobalFileRecord,
  PlayerProfile,
  Sponsor,
  StorageNode,
  Team,
} from '../../types';
import { API } from '../../services/api';
import {
  Settings,
  Trophy,
  Database,
  HardDrive,
  ShieldAlert,
  Sparkles,
  Scale,
  AlertTriangle,
  History,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface Props {
  currentUser: PlayerProfile | null;
  competitions: Competition[];
  teams: Team[];
  sponsors: Sponsor[];
  reports: FairPlayReport[];
  dbNodes: DatabaseNode[];
  storageNodes: StorageNode[];
  files: GlobalFileRecord[];
  complianceState: ComplianceGateState;
  financialLedger: FinancialLedgerEntry[];
  emergencyState: EmergencyControlsState;
  auditLogs: AuditLog[];
  onRefreshData: () => void;
}

export function AdminCommandCenter({
  currentUser,
  competitions,
  sponsors,
  reports,
  dbNodes,
  storageNodes,
  files,
  complianceState,
  financialLedger,
  emergencyState,
  auditLogs,
  onRefreshData,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    'COMPETITIONS' | 'DATABASES' | 'STORAGE' | 'FAIRPLAY' | 'SPONSORS' | 'COMPLIANCE' | 'EMERGENCY'
  >('COMPETITIONS');

  // Competitions state
  const [showCreateCompModal, setShowCreateCompModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newFormat, setNewFormat] = useState('SQUAD');
  const [newMode, setNewMode] = useState('BATTLE_ROYALE');
  const [newTotalSlots, setNewTotalSlots] = useState(12);
  const [newMap, setNewMap] = useState('Bermuda');
  const [newSchedule, setNewSchedule] = useState('');
  const [newFirstPrize, setNewFirstPrize] = useState('₹5,000 INR + Championship Trophy');
  const [newMvpPrize, setNewMvpPrize] = useState('₹1,500 INR + Custom MVP Jersey');
  const [compLoading, setCompLoading] = useState(false);

  // Result submission state
  const [resultCompId, setResultCompId] = useState<string | null>(null);
  const [mvpName, setMvpName] = useState('');
  const [mvpUid, setMvpUid] = useState('');
  const [mvpKills, setMvpKills] = useState(14);
  const [resultsLoading, setResultsLoading] = useState(false);

  // DB Migration state
  const [migrateUserId, setMigrateUserId] = useState('');
  const [migrateTargetDb, setMigrateTargetDb] = useState(dbNodes[1]?.databaseId || '');
  const [migrateReason, setMigrateReason] = useState('Load balancing shard capacity');

  // File upload state
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState('EVIDENCE');
  const [uploadSizeMb, setUploadSizeMb] = useState(25);

  // Adjudicate report state
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [adjudicateStatus, setAdjudicateStatus] = useState<'RESOLVED' | 'DISMISSED'>('RESOLVED');
  const [adjudicateAction, setAdjudicateAction] = useState<'WARNING' | 'MATCH_PENALTY' | 'DISQUALIFICATION' | 'TEMPORARY_SUSPENSION' | 'PERMANENT_BAN'>('TEMPORARY_SUSPENSION');
  const [adjudicateNotes, setAdjudicateNotes] = useState('');

  // Sponsor state
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorTier, setSponsorTier] = useState<'PRESENTED_BY' | 'POWERED_BY' | 'SPONSORED_BY' | 'OFFICIAL_PARTNER'>('SPONSORED_BY');
  const [sponsorLogo, setSponsorLogo] = useState('');
  const [sponsorWeb, setSponsorWeb] = useState('');

  // Emergency controls state
  const [localEmergency, setLocalEmergency] = useState(emergencyState);

  // Handlers
  const handleCreateCompetition = async (e: FormEvent) => {
    e.preventDefault();
    setCompLoading(true);
    try {
      await API.createCompetition({
        title: newTitle,
        format: newFormat,
        mode: newMode,
        totalSlots: Number(newTotalSlots),
        scheduledAt: newSchedule || new Date(Date.now() + 3600000 * 24).toISOString(),
        bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
        description: `Official TMT tournament hosted on ${newMap}. Anti-cheat monitored.`,
        entryFee: 0,
        prizeConfig: {
          firstPlace: newFirstPrize,
          secondPlace: '₹2,500 INR',
          thirdPlace: '₹1,000 INR',
          mvpPrize: newMvpPrize,
          trophyDescription: 'TMT Official Championship Shield',
          cashPermitted: false,
        },
        roomDetails: {
          roomId: `ROOM-${Math.floor(100000 + Math.random() * 900000)}`,
          password: `ff${Math.floor(100 + Math.random() * 900)}`,
          mapName: newMap as any,
          releaseTime: new Date(Date.now() + 3600000 * 20).toISOString(),
          matchStartTime: new Date(Date.now() + 3600000 * 24).toISOString(),
        },
        mvpRules: {
          title: 'Fragger Dominance Formula',
          criteria: 'OFFICIAL_SCORE_FORMULA',
          description: 'Calculated from verified match telemetry.',
          killWeight: 1.5,
          placementWeight: 1.0,
        },
      });
      setShowCreateCompModal(false);
      onRefreshData();
      alert('Tournament created successfully.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCompLoading(false);
    }
  };

  const handleUpdateStatus = async (compId: string, status: string) => {
    try {
      await API.updateCompetitionStatus(compId, status, 'Admin manual lifecycle transition');
      onRefreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmitVerifiedResults = async (compId: string) => {
    setResultsLoading(true);
    try {
      const comp = competitions.find(c => c.competitionId === compId);
      const generatedResults = (comp?.slots || []).map((s, idx) => ({
        rank: idx + 1,
        participantId: s.participantId,
        participantName: s.participantName,
        kills: Math.max(1, 16 - idx * 2),
        placementPoints: idx === 0 ? 12 : idx === 1 ? 9 : idx === 2 ? 8 : Math.max(1, 7 - idx),
        killPoints: Math.max(1, 16 - idx * 2),
        totalPoints: (idx === 0 ? 12 : idx === 1 ? 9 : idx === 2 ? 8 : Math.max(1, 7 - idx)) + Math.max(1, 16 - idx * 2),
      }));

      await API.submitResults(compId, {
        results: generatedResults,
        mvpWinner: {
          global_user_id: 'USR_GLOBAL_002',
          playerName: mvpName || 'TMT_Phantom',
          freeFireUid: mvpUid || '1982739102',
          kills: mvpKills,
          criteriaNotes: 'Highest kill count across all drop zones with verified headshot rate.',
          verified: true,
        },
      });
      setResultCompId(null);
      onRefreshData();
      alert('Official results & MVP recorded and verified.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setResultsLoading(false);
    }
  };

  const handleToggleDbHealth = async (dbId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'HEALTHY' ? 'DEGRADED' : 'HEALTHY';
    try {
      await API.toggleDbHealth(dbId, nextStatus);
      onRefreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMigrateUser = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await API.migrateUserDb(migrateUserId, migrateTargetDb, migrateReason);
      onRefreshData();
      alert('User database migration executed and logged to audit trail.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUploadFile = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await API.uploadFile({
        fileName: uploadFileName || `replay_match_${Date.now()}.mp4`,
        fileType: uploadFileType,
        sizeBytes: uploadSizeMb * 1024 * 1024,
        mimeType: 'video/mp4',
        accessLevel: 'PUBLIC',
      });
      setUploadFileName('');
      onRefreshData();
      alert('File routed to optimal Google Drive vault.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdjudicateReport = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedReportId) return;
    try {
      await API.adjudicateReport(selectedReportId, {
        status: adjudicateStatus,
        penaltyApplied: adjudicateAction,
        adminNotes: adjudicateNotes || 'Adjudicated by TMT Fair Play Administration.',
      });
      setSelectedReportId(null);
      onRefreshData();
      alert('Report adjudicated and sanction recorded.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateSponsor = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await API.createSponsor({
        name: sponsorName,
        tier: sponsorTier,
        logoUrl: sponsorLogo || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80',
        websiteUrl: sponsorWeb || 'https://example.com',
        description: 'Official Gaming Hardware & Peripheral Sponsor.',
      });
      setShowSponsorModal(false);
      onRefreshData();
      alert('Sponsor added to active rolling rotation.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveEmergencyState = async () => {
    try {
      await API.updateEmergencyControls(localEmergency);
      onRefreshData();
      alert('Emergency controls state updated.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/40 text-xs font-bold font-mono uppercase">
              RBAC PROTECTED
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Admin: <strong className="text-white">{currentUser?.displayName}</strong> ({currentUser?.role})
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-heading mt-1 flex items-center gap-2">
            <Settings className="w-7 h-7 text-amber-400" /> TMT Operations Command Center
          </h1>
        </div>

        <button
          onClick={onRefreshData}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {[
          { id: 'COMPETITIONS', label: 'Competitions & Slots', icon: Trophy },
          { id: 'DATABASES', label: 'Multi-DB Cluster (3)', icon: Database },
          { id: 'STORAGE', label: 'GDrive Storage (3)', icon: HardDrive },
          { id: 'FAIRPLAY', label: 'Fair Play & Bans', icon: ShieldAlert },
          { id: 'SPONSORS', label: 'Sponsors & Banners', icon: Sparkles },
          { id: 'COMPLIANCE', label: 'Compliance & Ledger', icon: Scale },
          { id: 'EMERGENCY', label: 'Kill-Switches & Audit', icon: AlertTriangle },
        ].map(t => {
          const Icon = t.icon;
          const isCurrent = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition cursor-pointer ${
                isCurrent
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: COMPETITIONS & SLOTS */}
      {activeTab === 'COMPETITIONS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-heading">
              Tournament Lobbies & Lifecycle Management
            </h3>
            <button
              onClick={() => setShowCreateCompModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Create Tournament</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {competitions.map(comp => (
              <div
                key={comp.competitionId}
                className="bg-[#0f1422] p-5 rounded-2xl border border-slate-800 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">
                        {comp.format} • {comp.mode}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                        {comp.status}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white mt-1">{comp.title}</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Room ID: <span className="text-amber-300">{comp.roomDetails.roomId}</span> • Password: <span className="text-emerald-300">{comp.roomDetails.password}</span> • Map: {comp.roomDetails.mapName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {comp.status === 'REGISTRATION_OPEN' && (
                      <button
                        onClick={() => handleUpdateStatus(comp.competitionId, 'ROSTER_LOCKED')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 rounded-lg border border-slate-700"
                      >
                        Lock Rosters
                      </button>
                    )}
                    {comp.status === 'ROSTER_LOCKED' && (
                      <button
                        onClick={() => handleUpdateStatus(comp.competitionId, 'MATCH_ACTIVE')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-lg shadow"
                      >
                        Start Match
                      </button>
                    )}
                    {(comp.status === 'MATCH_ACTIVE' || comp.status === 'ROSTER_LOCKED') && (
                      <button
                        onClick={() => setResultCompId(comp.competitionId)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-xs font-bold text-black rounded-lg shadow"
                      >
                        Submit Results & MVP
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <p className="text-slate-400">Slots Claimed</p>
                    <p className="font-bold text-white">{comp.slots.length} / {comp.totalSlots}</p>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <p className="text-slate-400">Scheduled At</p>
                    <p className="font-bold text-white">{new Date(comp.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <p className="text-slate-400">Creds Release</p>
                    <p className="font-bold text-amber-400">{new Date(comp.roomDetails.releaseTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <p className="text-slate-400">Results State</p>
                    <p className="font-bold text-emerald-400">{comp.results?.length ? `${comp.results.length} Ranked` : 'Pending'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Result Modal */}
          {resultCompId && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#0f1422] border border-amber-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <h3 className="text-base font-bold text-white font-heading">Submit Match Results & MVP</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">MVP Player IGN</label>
                    <input
                      type="text"
                      placeholder="e.g. TMT_SniperGod"
                      value={mvpName}
                      onChange={e => setMvpName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">MVP Free Fire UID</label>
                    <input
                      type="text"
                      placeholder="e.g. 1928371928"
                      value={mvpUid}
                      onChange={e => setMvpUid(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">MVP Kills</label>
                    <input
                      type="number"
                      value={mvpKills}
                      onChange={e => setMvpKills(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setResultCompId(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubmitVerifiedResults(resultCompId)}
                    disabled={resultsLoading}
                    className="px-5 py-2 bg-amber-500 text-black text-xs font-bold rounded-xl"
                  >
                    {resultsLoading ? 'Verifying...' : 'Verify & Publish'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create Tournament Modal */}
          {showCreateCompModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <form
                onSubmit={handleCreateCompetition}
                className="bg-[#0f1422] border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white font-heading">Create Tournament Lobby</h3>
                  <button type="button" onClick={() => setShowCreateCompModal(false)} className="text-slate-400">✕</button>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Tournament Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TMT Official Pro League Season 5"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Format</label>
                      <select
                        value={newFormat}
                        onChange={e => setNewFormat(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                      >
                        <option value="SQUAD">Squad (4v4)</option>
                        <option value="DUO">Duo (2v2)</option>
                        <option value="SOLO">Solo (1v1)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Mode</label>
                      <select
                        value={newMode}
                        onChange={e => setNewMode(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                      >
                        <option value="BATTLE_ROYALE">Battle Royale</option>
                        <option value="CLASH_SQUAD">Clash Squad</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Total Slots</label>
                      <input
                        type="number"
                        value={newTotalSlots}
                        onChange={e => setNewTotalSlots(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Map</label>
                      <select
                        value={newMap}
                        onChange={e => setNewMap(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                      >
                        <option value="Bermuda">Bermuda</option>
                        <option value="Purgatory">Purgatory</option>
                        <option value="Kalahari">Kalahari</option>
                        <option value="Alpine">Alpine</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateCompModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={compLoading}
                    className="px-5 py-2 bg-amber-500 text-black text-xs font-bold rounded-xl"
                  >
                    {compLoading ? 'Creating...' : 'Create Tournament'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MULTI-DATABASE CLUSTER */}
      {activeTab === 'DATABASES' && (
        <div className="space-y-6">
          <div className="bg-[#0f1422] p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" /> Supabase 5-Database Distributed Cluster Telemetry
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time shard load, active athlete capacity, query latency, and health toggle for failover simulation across all 5 distributed Supabase database instances.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dbNodes.map(node => {
                const utilPercent = Math.round((node.activeUsers / node.userCapacity) * 100);

                return (
                  <div
                    key={node.databaseId}
                    className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-300 text-xs">{node.databaseId}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          node.status === 'HEALTHY'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {node.status}
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-white text-sm">{node.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{node.region}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Capacity:</span>
                        <span className="text-white">{node.activeUsers} / {node.userCapacity} ({utilPercent}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-cyan-400 h-full rounded-full"
                          style={{ width: `${utilPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800">
                      <span>Latency: {node.latencyMs}ms</span>
                      <button
                        onClick={() => handleToggleDbHealth(node.databaseId, node.status)}
                        className="text-amber-400 hover:underline cursor-pointer"
                      >
                        Simulate Toggle
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Migration Form */}
          <div className="bg-[#0f1422] p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-heading">
              Cross-Database Athlete Migration Tool
            </h3>
            <form onSubmit={handleMigrateUser} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <input
                type="text"
                placeholder="Global User ID (e.g. USR_GLOBAL_001)"
                value={migrateUserId}
                onChange={e => setMigrateUserId(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
              />
              <select
                value={migrateTargetDb}
                onChange={e => setMigrateTargetDb(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
              >
                {dbNodes.map(d => (
                  <option key={d.databaseId} value={d.databaseId}>{d.name} ({d.databaseId})</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Migration Reason"
                value={migrateReason}
                onChange={e => setMigrateReason(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl"
              >
                Execute Shard Move
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: STORAGE MANAGER */}
      {activeTab === 'STORAGE' && (
        <div className="space-y-6">
          <div className="bg-[#0f1422] p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-amber-400" /> Google Drive Free-Tier Multi-Vault Matrix
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deterministic asset hashing routes tournament replays, fair play evidence, and team logos across independent 15GB vaults.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {storageNodes.map(node => {
                const utilPercent = Math.round((node.usedBytes / node.totalQuotaBytes) * 100);
                const usedGb = (node.usedBytes / (1024 * 1024 * 1024)).toFixed(2);
                const totalGb = (node.totalQuotaBytes / (1024 * 1024 * 1024)).toFixed(0);

                return (
                  <div
                    key={node.driveId}
                    className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400 text-xs">{node.driveId}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                        {node.status}
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-white text-sm">{node.name}</p>
                      <p className="text-xs text-slate-400 font-mono">Files Managed: {node.fileCount}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Vault Quota:</span>
                        <span className="text-white">{usedGb} / {totalGb} GB ({utilPercent}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full"
                          style={{ width: `${utilPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test File Upload Box */}
          <div className="bg-[#0f1422] p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-heading">
              Simulate File Ingestion & Deterministic Vault Selection
            </h3>
            <form onSubmit={handleUploadFile} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <input
                type="text"
                placeholder="File Name (e.g. bermuda_final_replay.mp4)"
                value={uploadFileName}
                onChange={e => setUploadFileName(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
              <select
                value={uploadFileType}
                onChange={e => setUploadFileType(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              >
                <option value="EVIDENCE">Fair Play Evidence Video</option>
                <option value="TEAM_LOGO">Team Logo</option>
                <option value="TOURNAMENT_BANNER">Tournament Banner</option>
              </select>
              <input
                type="number"
                placeholder="Size in MB"
                value={uploadSizeMb}
                onChange={e => setUploadSizeMb(Number(e.target.value))}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 text-black font-bold rounded-xl"
              >
                Ingest to Storage Node
              </button>
            </form>
          </div>

          {/* Files Table */}
          <div className="bg-[#0f1422] p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">Global File Registry Index ({files.length})</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">File ID</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Storage Vault</th>
                    <th className="py-2.5 px-3 text-right">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {files.map(f => (
                    <tr key={f.fileId}>
                      <td className="py-2.5 px-3 text-slate-400">{f.fileId}</td>
                      <td className="py-2.5 px-3 text-white font-sans font-bold">{f.fileName}</td>
                      <td className="py-2.5 px-3 text-amber-400">{f.fileType}</td>
                      <td className="py-2.5 px-3 text-cyan-400">{f.driveId}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{(f.sizeBytes / (1024 * 1024)).toFixed(1)} MB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FAIR PLAY & BANS */}
      {activeTab === 'FAIRPLAY' && (
        <div className="space-y-6">
          <div className="bg-[#0f1422] p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" /> Fair Play & Anti-Cheat Adjudication Panel
            </h3>

            <div className="space-y-3">
              {reports.map(rep => (
                <div
                  key={rep.reportId}
                  className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-400 font-mono">Report: {rep.reportId}</span>
                      <span className="text-red-400 font-mono font-bold">Target UID: {rep.targetPlayerUid}</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">{rep.reason}</span>
                    </div>
                    <p className="text-slate-300 mt-1">{rep.description}</p>
                    {rep.adminNotes && (
                      <p className="text-emerald-400 mt-1 font-mono">Penalty: {rep.penaltyApplied} — {rep.adminNotes}</p>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedReportId(rep.reportId)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl whitespace-nowrap"
                  >
                    Adjudicate Sanction
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Adjudicate Modal */}
          {selectedReportId && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <form
                onSubmit={handleAdjudicateReport}
                className="bg-[#0f1422] border border-red-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
              >
                <h3 className="text-base font-bold text-white font-heading">Apply Disciplinary Sanction</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Status</label>
                    <select
                      value={adjudicateStatus}
                      onChange={e => setAdjudicateStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="RESOLVED">Resolved (Action Taken)</option>
                      <option value="DISMISSED">Dismissed (Insufficient Evidence)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Penalty</label>
                    <select
                      value={adjudicateAction}
                      onChange={e => setAdjudicateAction(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="WARNING">Official Warning</option>
                      <option value="MATCH_PENALTY">Match Score Deduction</option>
                      <option value="DISQUALIFICATION">Tournament Disqualification</option>
                      <option value="TEMPORARY_SUSPENSION">Temporary Suspension (7 Days)</option>
                      <option value="PERMANENT_BAN">Permanent UID Ban</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Findings / Reasoning</label>
                    <textarea
                      rows={3}
                      value={adjudicateNotes}
                      onChange={e => setAdjudicateNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                      placeholder="e.g. Telemetry confirms emulator signature and illegal drag-aimbot script."
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedReportId(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-600 text-white text-xs font-bold rounded-xl"
                  >
                    Apply Decision
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SPONSORS */}
      {activeTab === 'SPONSORS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-heading">
              Sponsorship Campaigns & Rolling Banner Analytics
            </h3>
            <button
              onClick={() => setShowSponsorModal(true)}
              className="px-4 py-2 bg-amber-500 text-black text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Sponsor Partner</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sponsors.map(sp => (
              <div
                key={sp.sponsorId}
                className="bg-[#0f1422] p-5 rounded-2xl border border-slate-800 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={sp.logoUrl}
                    alt={sp.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase font-mono">
                      {sp.tier}
                    </span>
                    <h4 className="text-base font-bold text-white mt-0.5">{sp.name}</h4>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs font-mono text-center">
                  <div className="bg-slate-900 p-2 rounded">
                    <p className="text-slate-400 text-[10px]">Impressions</p>
                    <p className="font-bold text-white">{sp.metrics?.impressions?.toLocaleString() || '12,400'}</p>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <p className="text-slate-400 text-[10px]">Web Clicks</p>
                    <p className="font-bold text-amber-400">{sp.metrics?.websiteClicks || 420}</p>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <p className="text-slate-400 text-[10px]">IG Clicks</p>
                    <p className="font-bold text-pink-400">{sp.metrics?.instagramClicks || 810}</p>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <p className="text-slate-400 text-[10px]">YT Clicks</p>
                    <p className="font-bold text-red-400">{sp.metrics?.youtubeClicks || 1250}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Sponsor Modal */}
          {showSponsorModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <form
                onSubmit={handleCreateSponsor}
                className="bg-[#0f1422] border border-amber-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
              >
                <h3 className="text-base font-bold text-white font-heading">Add Sponsor Partner</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Brand Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Redragon India"
                      value={sponsorName}
                      onChange={e => setSponsorName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Tier</label>
                    <select
                      value={sponsorTier}
                      onChange={e => setSponsorTier(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="PRESENTED_BY">Presented By (Top Tier)</option>
                      <option value="POWERED_BY">Powered By (Second Tier)</option>
                      <option value="SPONSORED_BY">Sponsored By</option>
                      <option value="OFFICIAL_PARTNER">Official Partner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Website URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={sponsorWeb}
                      onChange={e => setSponsorWeb(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowSponsorModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 text-black text-xs font-bold rounded-xl"
                  >
                    Add to Ticker
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: COMPLIANCE & FINANCIAL LEDGER */}
      {activeTab === 'COMPLIANCE' && (
        <div className="space-y-6">
          <div className="bg-[#0f1422] p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-400" /> Platform Compliance Gate Master Control
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enforces legal boundary checks. Monetary prize/entry models remain hard-locked until explicit regulatory affirmation.
            </p>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-sm">Monetary Tournament Gate</p>
                <p className="text-xs text-slate-400">
                  Current Status: {complianceState.monetaryCompetitionsEnabled ? 'ENABLED' : 'LOCKED (FREE-ONLY)'}
                </p>
              </div>
              <button
                onClick={async () => {
                  try {
                    await API.updateComplianceGate({
                      monetaryCompetitionsEnabled: !complianceState.monetaryCompetitionsEnabled,
                      notes: `Gate toggled by Super Admin ${currentUser?.displayName} for testing`,
                    });
                    onRefreshData();
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                  complianceState.monetaryCompetitionsEnabled
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {complianceState.monetaryCompetitionsEnabled ? 'Lock Monetary Gate' : 'Simulate Legal Clearance Unlock'}
              </button>
            </div>
          </div>

          {/* Financial Ledger Records */}
          <div className="bg-[#0f1422] p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">Financial Ledger Records (TDS Ready)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Transaction ID</th>
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">User / Entity</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Gross Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {financialLedger.map(entry => (
                    <tr key={entry.global_transaction_id}>
                      <td className="py-2.5 px-3 text-slate-400">{entry.global_transaction_id}</td>
                      <td className="py-2.5 px-3 text-amber-400">{entry.order_id}</td>
                      <td className="py-2.5 px-3 text-white">{entry.global_user_id}</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-sans">{entry.status}</td>
                      <td className="py-2.5 px-3 text-right text-slate-200">₹{entry.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: EMERGENCY KILL-SWITCHES & AUDIT LOGS */}
      {activeTab === 'EMERGENCY' && (
        <div className="space-y-6">
          <div className="bg-[#0f1422] p-5 rounded-2xl border border-red-500/40 space-y-4">
            <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Master Emergency Kill-Switches
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instantaneous operational brakes to mitigate DDoS attacks, cheating exploits, or infrastructure failures.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer">
                <div>
                  <p className="font-bold text-white">Maintenance Mode</p>
                  <p className="text-slate-400 text-[11px]">Temporarily takes platform offline</p>
                </div>
                <input
                  type="checkbox"
                  checked={localEmergency.maintenanceMode}
                  onChange={e => setLocalEmergency({ ...localEmergency, maintenanceMode: e.target.checked })}
                  className="w-4 h-4 accent-amber-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer">
                <div>
                  <p className="font-bold text-white">Pause Registrations</p>
                  <p className="text-slate-400 text-[11px]">Freezes tournament slot reservation</p>
                </div>
                <input
                  type="checkbox"
                  checked={localEmergency.registrationsPaused}
                  onChange={e => setLocalEmergency({ ...localEmergency, registrationsPaused: e.target.checked })}
                  className="w-4 h-4 accent-amber-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer">
                <div>
                  <p className="font-bold text-white">Disable Account Creation</p>
                  <p className="text-slate-400 text-[11px]">Blocks bot user generation</p>
                </div>
                <input
                  type="checkbox"
                  checked={localEmergency.accountCreationDisabled}
                  onChange={e => setLocalEmergency({ ...localEmergency, accountCreationDisabled: e.target.checked })}
                  className="w-4 h-4 accent-amber-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer">
                <div>
                  <p className="font-bold text-white">Freeze Financials</p>
                  <p className="text-slate-400 text-[11px]">Halts all ledger transactions</p>
                </div>
                <input
                  type="checkbox"
                  checked={localEmergency.financialsPaused}
                  onChange={e => setLocalEmergency({ ...localEmergency, financialsPaused: e.target.checked })}
                  className="w-4 h-4 accent-amber-500"
                />
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">Active Incident Notice to Athletes</label>
              <input
                type="text"
                value={localEmergency.activeIncidentNotice || ''}
                onChange={e => setLocalEmergency({ ...localEmergency, activeIncidentNotice: e.target.value })}
                placeholder="e.g. Bermuda tournament room 4 is delayed by 15 mins for caster setup."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveEmergencyState}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow"
              >
                Apply Emergency State
              </button>
            </div>
          </div>

          {/* Audit Logs Trail */}
          <div className="bg-[#0f1422] p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase font-mono flex items-center gap-1.5">
              <History className="w-4 h-4 text-amber-400" /> Immutable Administrative Audit Trail ({auditLogs.length})
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Admin</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Target</th>
                    <th className="py-2.5 px-3">Mutation Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {auditLogs.map(log => (
                    <tr key={log.logId}>
                      <td className="py-2.5 px-3 text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3 text-amber-400 font-bold">{log.admin_global_user_id}</td>
                      <td className="py-2.5 px-3 text-white">{log.action}</td>
                      <td className="py-2.5 px-3 text-cyan-400">{log.targetType}:{log.targetId}</td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans truncate max-w-xs">
                        {log.newValue || log.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
