import { useState, type FormEvent } from 'react';
import { PlayerProfile, Team, TeamMember } from '../../types';
import { API } from '../../services/api';
import {
  Users,
  Shield,
  Plus,
  UserPlus,
  Trash2,
  Trophy,
  Award,
  CheckCircle2,
  AlertCircle,
  Database,
  ExternalLink,
  Crown,
  Sparkles,
} from 'lucide-react';

interface Props {
  teams: Team[];
  currentUser: PlayerProfile | null;
  onRefreshData: () => void;
}

export function TeamsView({ teams, currentUser, onRefreshData }: Props) {
  const [selectedTeam, setSelectedTeam] = useState<Team>(teams[0] || null);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Create team form state
  const [teamName, setTeamName] = useState('');
  const [teamTag, setTeamTag] = useState('');
  const [teamLogo, setTeamLogo] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Add member form state
  const [targetUidOrId, setTargetUidOrId] = useState('');
  const [memberRole, setMemberRole] = useState<'MAIN_ROSTER' | 'SUBSTITUTE'>('MAIN_ROSTER');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const isCaptain = selectedTeam && currentUser && selectedTeam.captainId === currentUser.global_user_id;

  const handleCreateTeam = async (e: FormEvent) => {
    e.preventDefault();
    if (!teamName || !teamTag) return;
    setCreateLoading(true);
    setCreateError(null);
    try {
      const res = await API.createTeam({
        name: teamName,
        tag: teamTag,
        logoUrl: teamLogo || undefined,
      });
      setShowCreateTeamModal(false);
      setTeamName('');
      setTeamTag('');
      setTeamLogo('');
      onRefreshData();
      setSelectedTeam(res.team);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create team.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !targetUidOrId) return;
    setAddLoading(true);
    setAddError(null);
    try {
      const res = await API.addTeamMember(selectedTeam.teamId, {
        targetUserIdOrUid: targetUidOrId,
        roleInTeam: memberRole,
      });
      setShowAddMemberModal(false);
      setTargetUidOrId('');
      onRefreshData();
      setSelectedTeam(res.team);
    } catch (err: any) {
      setAddError(err.message || 'Failed to add member.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedTeam) return;
    if (!confirm('Are you sure you want to remove this athlete from the active roster?')) return;
    try {
      const res = await API.removeTeamMember(selectedTeam.teamId, memberId);
      onRefreshData();
      setSelectedTeam(res.team);
    } catch (err: any) {
      alert(err.message || 'Failed to remove member.');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-heading flex items-center gap-2">
            <Users className="w-7 h-7 text-amber-400" /> Esports Teams & Cross-DB Rosters
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build and manage verified competitive Free Fire rosters transparently resolved across Supabase clusters.
          </p>
        </div>

        <button
          id="create-team-open-modal-btn"
          onClick={() => setShowCreateTeamModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold rounded-xl text-sm flex items-center gap-2 shadow cursor-pointer active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Team</span>
        </button>
      </div>

      {/* Cross-Database Architecture Callout */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-amber-950/40 p-4 rounded-xl border border-blue-500/30 flex items-start gap-3">
        <Database className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold text-white">5-Database Supabase Interoperability</p>
          <p className="text-slate-300 mt-0.5">
            Athletes stored across 5 physical database instances (<span className="text-amber-300 font-mono">DB-01 Mumbai</span>, <span className="text-amber-300 font-mono">DB-02 Bengaluru</span>, <span className="text-amber-300 font-mono">DB-03 Delhi</span>, <span className="text-amber-300 font-mono">DB-04 Hyderabad</span>, <span className="text-amber-300 font-mono">DB-05 Kolkata</span>) form seamless, unified team rosters under TMT’s central Global Identity Layer.
          </p>
        </div>
      </div>

      {/* Main 2-Column Layout: Teams List on Left, Active Roster on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Team Directory */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
            Registered Squads ({teams.length})
          </h3>
          <div className="space-y-2">
            {teams.map(team => {
              const isSelected = selectedTeam?.teamId === team.teamId;
              const hasUser = team.members.some(m => m.global_user_id === currentUser?.global_user_id);

              return (
                <div
                  key={team.teamId}
                  onClick={() => setSelectedTeam(team)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-lg'
                      : 'bg-[#0f1422] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={team.logoUrl}
                      alt={team.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-white text-sm">{team.name}</h4>
                        {team.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Tag: [{team.tag}] • {team.members.length}/{team.maxMembers} Players
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {hasUser && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        MY TEAM
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Selected Team Profile & Roster Manager */}
        {selectedTeam && (
          <div className="lg:col-span-2 space-y-5">
            {/* Team Hero Header */}
            <div className="bg-[#0f1422] rounded-2xl border border-slate-800 p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedTeam.logoUrl}
                    alt={selectedTeam.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover border border-amber-500/30 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white font-heading">
                        {selectedTeam.name}
                      </h2>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 text-xs font-mono font-bold">
                        [{selectedTeam.tag}]
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      Team ID: {selectedTeam.teamId} • Created: {new Date(selectedTeam.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {isCaptain && (
                  <button
                    id="add-roster-member-btn"
                    onClick={() => setShowAddMemberModal(true)}
                    disabled={selectedTeam.members.length >= selectedTeam.maxMembers}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Athlete to Roster</span>
                  </button>
                )}
              </div>

              {/* Team Stats Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                  <p className="text-slate-400 font-mono">Rank Points</p>
                  <p className="text-base font-extrabold text-amber-400 font-mono mt-0.5">
                    {selectedTeam.stats.rankPoints} PTS
                  </p>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                  <p className="text-slate-400 font-mono">Tournaments Won</p>
                  <p className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">
                    {selectedTeam.stats.tournamentsWon} Cups
                  </p>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                  <p className="text-slate-400 font-mono">Matches Played</p>
                  <p className="text-base font-extrabold text-white font-mono mt-0.5">
                    {selectedTeam.stats.tournamentsPlayed}
                  </p>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                  <p className="text-slate-400 font-mono">Total Team Kills</p>
                  <p className="text-base font-extrabold text-red-400 font-mono mt-0.5">
                    {selectedTeam.stats.totalKills}
                  </p>
                </div>
              </div>
            </div>

            {/* Members Roster with Cross-Database Nodes */}
            <div className="bg-[#0f1422] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" /> Active Roster ({selectedTeam.members.length} / {selectedTeam.maxMembers})
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  4 Main Lineup + 2 Substitutes
                </span>
              </div>

              <div className="space-y-2.5">
                {selectedTeam.members.map((member, idx) => {
                  const isMemberCaptain = member.roleInTeam === 'CAPTAIN';

                  return (
                    <div
                      key={member.global_user_id}
                      className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={
                              member.avatarUrl ||
                              `https://api.dicebear.com/7.x/bottts/svg?seed=${member.displayName}`
                            }
                            alt={member.displayName}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                          />
                          {isMemberCaptain && (
                            <span className="absolute -top-1 -right-1 bg-amber-500 text-black p-0.5 rounded-full">
                              <Crown className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm">{member.displayName}</h4>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.2 rounded uppercase font-mono ${
                                isMemberCaptain
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : member.roleInTeam === 'SUBSTITUTE'
                                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              }`}
                            >
                              {member.roleInTeam.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            Free Fire IGN: <span className="text-slate-200">{member.freeFireIgn}</span> • UID:{' '}
                            <span className="text-amber-400 font-bold">{member.freeFireUid}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-center">
                        {/* Physical Database Source Node Badge */}
                        <div className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                          <Database className="w-3 h-3 text-cyan-400" />
                          <span>{member.database_id.split('-')[0]}-{member.database_id.split('-')[1]}</span>
                        </div>

                        {/* Captain Kick action */}
                        {isCaptain && !isMemberCaptain && (
                          <button
                            onClick={() => handleRemoveMember(member.global_user_id)}
                            className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-400 transition cursor-pointer border border-red-800/40"
                            title="Remove from roster"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTeam}
            className="bg-[#0f1422] border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" /> Register Free Fire Squad
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateTeamModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-lg text-xs text-red-300">
                {createError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Squad Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TMT Warriors India"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Clan Tag (2-5 letters) *</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="e.g. TMT"
                  value={teamTag}
                  onChange={e => setTeamTag(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Logo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={teamLogo}
                  onChange={e => setTeamLogo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateTeamModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold rounded-xl shadow disabled:opacity-50"
              >
                {createLoading ? 'Registering...' : 'Create Team'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddMember}
            className="bg-[#0f1422] border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" /> Add Athlete to Roster
              </h3>
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {addError && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-lg text-xs text-red-300">
                {addError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Athlete Free Fire UID or Global User ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1894729104 or USR_GLOBAL_001"
                  value={targetUidOrId}
                  onChange={e => setTargetUidOrId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  * Multi-database resolver will automatically map user from DB-01 through DB-05.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Roster Role</label>
                <select
                  value={memberRole}
                  onChange={e => setMemberRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="MAIN_ROSTER">Main Roster (Starting 4)</option>
                  <option value="SUBSTITUTE">Substitute</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addLoading}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold rounded-xl shadow disabled:opacity-50"
              >
                {addLoading ? 'Adding...' : 'Confirm Member'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
