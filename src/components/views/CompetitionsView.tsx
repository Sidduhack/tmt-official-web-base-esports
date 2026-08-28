import { useState } from 'react';
import { Competition, CompetitionFormat, CompetitionStatus, PlayerProfile, Team } from '../../types';
import { API } from '../../services/api';
import {
  Trophy,
  Filter,
  Users,
  Calendar,
  Clock,
  Swords,
  Award,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldAlert,
  Lock,
  Plus,
} from 'lucide-react';

interface Props {
  competitions: Competition[];
  teams: Team[];
  currentUser: PlayerProfile | null;
  onSelectCompetition: (id: string) => void;
  onRefreshData: () => void;
}

export function CompetitionsView({
  competitions,
  teams,
  currentUser,
  onSelectCompetition,
  onRefreshData,
}: Props) {
  const [formatFilter, setFormatFilter] = useState<'ALL' | CompetitionFormat>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [registeringComp, setRegisteringComp] = useState<Competition | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  const filteredCompetitions = competitions.filter(c => {
    if (formatFilter !== 'ALL' && c.format !== formatFilter) return false;
    if (statusFilter === 'OPEN' && c.status !== 'REGISTRATION_OPEN') return false;
    if (statusFilter === 'ACTIVE' && c.status !== 'MATCH_ACTIVE') return false;
    if (statusFilter === 'COMPLETED' && c.status !== 'COMPLETED' && c.status !== 'RESULTS_VERIFIED') return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleOpenRegisterModal = (comp: Competition) => {
    setRegisteringComp(comp);
    setRegisterError(null);
    setRegisterSuccess(null);
    if (currentUser?.currentTeamId) {
      setSelectedTeamId(currentUser.currentTeamId);
    } else if (teams.length > 0) {
      setSelectedTeamId(teams[0].teamId);
    }
  };

  const handleExecuteRegistration = async () => {
    if (!registeringComp) return;
    setRegisterLoading(true);
    setRegisterError(null);
    try {
      const res = await API.registerForCompetition(
        registeringComp.competitionId,
        registeringComp.format === 'SOLO' ? undefined : selectedTeamId
      );
      setRegisterSuccess(res.message);
      onRefreshData();
      setTimeout(() => {
        setRegisteringComp(null);
        onSelectCompetition(registeringComp.competitionId);
      }, 1500);
    } catch (err: any) {
      setRegisterError(err.message || 'Registration failed.');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-heading flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-400" /> Free Fire Tournaments & Scrims
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Discover and enter verified competitive lobbies across Bermuda, Purgatory, and Kalahari.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            {filteredCompetitions.length} Available Lobbies
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f1422] p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <input
          type="text"
          placeholder="Search tournament title or map..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full md:w-72 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 placeholder-slate-500"
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFormatFilter('ALL')}
              className={`px-3 py-1 rounded font-semibold transition ${
                formatFilter === 'ALL' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Formats
            </button>
            <button
              onClick={() => setFormatFilter('SOLO')}
              className={`px-3 py-1 rounded font-semibold transition ${
                formatFilter === 'SOLO' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Solo
            </button>
            <button
              onClick={() => setFormatFilter('DUO')}
              className={`px-3 py-1 rounded font-semibold transition ${
                formatFilter === 'DUO' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Duo
            </button>
            <button
              onClick={() => setFormatFilter('SQUAD')}
              className={`px-3 py-1 rounded font-semibold transition ${
                formatFilter === 'SQUAD' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Squad
            </button>
          </div>

          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded font-semibold transition ${
                statusFilter === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('OPEN')}
              className={`px-2.5 py-1 rounded font-semibold transition ${
                statusFilter === 'OPEN' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-2.5 py-1 rounded font-semibold transition ${
                statusFilter === 'COMPLETED' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Tournament Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCompetitions.map(comp => {
          const isFull = comp.slots.length >= comp.totalSlots;
          const isUserRegistered = comp.slots.some(
            s =>
              s.participantId === currentUser?.global_user_id ||
              s.rosterUids.includes(currentUser?.freeFireUid || '')
          );

          return (
            <div
              key={comp.competitionId}
              className="bg-[#0f1422] border border-slate-800 hover:border-amber-500/40 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl transition-all group"
            >
              <div>
                {/* Banner Thumbnail */}
                <div className="h-40 w-full relative overflow-hidden bg-slate-900">
                  <img
                    src={comp.bannerUrl}
                    alt={comp.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1422] via-transparent to-black/60"></div>

                  {/* Badges on Banner */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur text-amber-400 text-[11px] font-bold uppercase font-mono border border-amber-500/30">
                      {comp.format} • {comp.mode === 'BATTLE_ROYALE' ? 'BR' : 'CS'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 backdrop-blur text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                      FREE ENTRY
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
                    <span className="font-mono text-amber-300 font-semibold flex items-center gap-1">
                      🗺️ {comp.roomDetails.mapName}
                    </span>
                    <span className="bg-slate-900/80 px-2 py-0.5 rounded text-[11px] font-mono">
                      {new Date(comp.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition font-heading line-clamp-2">
                    {comp.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {comp.description}
                  </p>

                  {/* Slot Meter */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-amber-400" /> Slot Reservation
                      </span>
                      <span className="font-bold font-mono text-white">
                        {comp.slots.length} / {comp.totalSlots} {isFull ? '(FULL)' : ''}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull ? 'bg-red-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                        }`}
                        style={{ width: `${(comp.slots.length / comp.totalSlots) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Prizes */}
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs">
                    <p className="text-slate-400 text-[11px] mb-0.5">Top Prize & Recognition</p>
                    <p className="font-bold text-amber-300 truncate">{comp.prizeConfig.firstPlace}</p>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 pt-0 flex items-center gap-2">
                <button
                  id={`comp-details-btn-${comp.competitionId}`}
                  onClick={() => onSelectCompetition(comp.competitionId)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Lobby Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {comp.status === 'REGISTRATION_OPEN' && !isFull && (
                  <button
                    id={`comp-register-btn-${comp.competitionId}`}
                    onClick={() => handleOpenRegisterModal(comp)}
                    disabled={isUserRegistered}
                    className={`py-2 px-4 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 shadow ${
                      isUserRegistered
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black'
                    }`}
                  >
                    {isUserRegistered ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Registered</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Register</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slot Registration Modal */}
      {registeringComp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1422] border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" /> Slot Reservation
              </h3>
              <button
                onClick={() => setRegisteringComp(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm">{registeringComp.title}</h4>
              <p className="text-xs text-slate-400 mt-1">
                Format: <span className="text-amber-400 font-bold">{registeringComp.format}</span> • Entry Fee:{' '}
                <span className="text-emerald-400 font-bold">₹0 (Free)</span>
              </p>
            </div>

            {registerError && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-lg text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{registerError}</span>
              </div>
            )}

            {registerSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{registerSuccess}</span>
              </div>
            )}

            {registeringComp.format === 'SOLO' ? (
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <p className="font-bold text-white">Solo Athlete Details</p>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Display Name:</span>
                  <span className="text-white font-mono">{currentUser?.displayName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Free Fire UID:</span>
                  <span className="text-amber-400 font-mono font-bold">{currentUser?.freeFireUid}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Free Fire IGN:</span>
                  <span className="text-white font-mono">{currentUser?.freeFireIgn}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  Select Participating Squad / Duo:
                </label>
                <select
                  value={selectedTeamId}
                  onChange={e => setSelectedTeamId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  {teams.map(t => (
                    <option key={t.teamId} value={t.teamId}>
                      {t.name} [{t.tag}] — {t.members.length} Members
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  * All roster members must have verified Free Fire UIDs. Emulators and unverified ringers are disqualified.
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRegisteringComp(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRegistration}
                disabled={registerLoading || !!registerSuccess}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-bold rounded-xl shadow cursor-pointer disabled:opacity-50"
              >
                {registerLoading ? 'Locking Slot...' : 'Confirm Registration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
