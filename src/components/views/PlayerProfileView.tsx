import { useState, type FormEvent } from 'react';
import { PlayerProfile } from '../../types';
import { API } from '../../services/api';
import {
  User,
  ShieldCheck,
  Award,
  Crosshair,
  Trophy,
  Database,
  MapPin,
  Mail,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Save,
  Flame,
  Zap,
} from 'lucide-react';

interface Props {
  currentUser: PlayerProfile | null;
  onRefreshData: () => void;
}

export function PlayerProfileView({ currentUser, onRefreshData }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [freeFireUid, setFreeFireUid] = useState(currentUser?.freeFireUid || '');
  const [freeFireIgn, setFreeFireIgn] = useState(currentUser?.freeFireIgn || '');
  const [ffLevel, setFfLevel] = useState(currentUser?.ffLevel || 65);
  const [ffRank, setFfRank] = useState(currentUser?.ffRank || 'MASTER');
  const [state, setState] = useState(currentUser?.state || 'Maharashtra');
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);

  if (!currentUser) {
    return (
      <div className="py-20 text-center text-slate-400 font-mono text-xs">
        No active athlete session found. Select a persona in the top navigation bar.
      </div>
    );
  }

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.updateProfile({
        displayName,
        freeFireUid,
        freeFireIgn,
        ffLevel: Number(ffLevel),
        ffRank,
        state,
      });
      setIsEditing(false);
      onRefreshData();
      alert('Athlete profile updated across distributed database node.');
    } catch (err: any) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestUidVerification = async () => {
    setVerifying(true);
    try {
      await API.requestUidVerification();
      onRefreshData();
      alert('UID verified with in-game telemetry cross-check.');
    } catch (err: any) {
      alert(err.message || 'Verification request failed.');
    } finally {
      setVerifying(false);
    }
  };

  const stats = currentUser.stats || {
    matchesPlayed: 240,
    wins: 92,
    kills: 1180,
    mvpCount: 18,
    winRate: 38.3,
    kdRatio: 4.9,
    headshotRate: 64.2,
    tournamentTrophies: 5,
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Top Banner Card */}
      <div className="bg-[#0f1422] rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-500/50 shadow-xl"
              />
              <span className="absolute -bottom-2 -right-2 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full font-mono shadow">
                LVL {currentUser.ffLevel}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                  {currentUser.displayName}
                </h1>
                {currentUser.isUidVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED ATHLETE
                  </span>
                ) : (
                  <button
                    onClick={handleRequestUidVerification}
                    disabled={verifying}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono transition cursor-pointer"
                  >
                    <AlertCircle className="w-3.5 h-3.5" /> {verifying ? 'Verifying...' : 'Verify UID'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap">
                <span>
                  IGN: <strong className="text-white">{currentUser.freeFireIgn}</strong>
                </span>
                <span>•</span>
                <span>
                  UID: <strong className="text-amber-400">{currentUser.freeFireUid}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <MapPin className="w-3 h-3 text-slate-400" /> {currentUser.state}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-bold font-mono">
                  Role: {currentUser.role.replace(/_/g, ' ')}
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[11px] font-mono">
                  Shard: {currentUser.database_id}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition self-start md:self-auto cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Close Editor' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Editing Drawer / Box */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-heading">Update Profile Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Free Fire In-Game Name (IGN)</label>
                <input
                  type="text"
                  value={freeFireIgn}
                  onChange={e => setFreeFireIgn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Free Fire Player UID</label>
                <input
                  type="text"
                  value={freeFireUid}
                  onChange={e => setFreeFireUid(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">FF In-Game Rank</label>
                <select
                  value={ffRank}
                  onChange={e => setFfRank(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="GRANDMASTER">Grandmaster</option>
                  <option value="MASTER">Master</option>
                  <option value="HEROIC">Heroic</option>
                  <option value="DIAMOND">Diamond</option>
                  <option value="PLATINUM">Platinum</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">In-Game Level</label>
                <input
                  type="number"
                  value={ffLevel}
                  onChange={e => setFfLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Indian State / Region</label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Punjab">Punjab</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Kerala">Kerala</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-amber-500 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Official Combat Telemetry Stats Matrix */}
      <div className="bg-[#0f1422] rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" /> Lifetime Tournament Performance Telemetry
            </h2>
            <p className="text-xs text-slate-400">
              Aggregated from verified TMT Official custom room match logs.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
            RANK: {currentUser.ffRank}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-mono uppercase">Total Kills</span>
            <p className="text-2xl font-black text-white font-mono">{stats.kills.toLocaleString()}</p>
            <span className="text-[10px] text-emerald-400 font-mono">Top 5% Fragger</span>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-mono uppercase">K/D Ratio</span>
            <p className="text-2xl font-black text-amber-400 font-mono">{stats.kdRatio}</p>
            <span className="text-[10px] text-slate-400 font-mono">Per Elimination</span>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-mono uppercase">Headshot Rate</span>
            <p className="text-2xl font-black text-red-400 font-mono">{stats.headshotRate}%</p>
            <span className="text-[10px] text-red-400/80 font-mono">Precision Telemetry</span>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-mono uppercase">Win Rate</span>
            <p className="text-2xl font-black text-cyan-400 font-mono">{stats.winRate}%</p>
            <span className="text-[10px] text-cyan-400/80 font-mono">{stats.matchesPlayed} Matches</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs text-slate-400 font-mono">Matches Won</span>
              <p className="text-lg font-bold text-white">{stats.wins}</p>
            </div>
            <Award className="w-6 h-6 text-amber-400" />
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs text-slate-400 font-mono">Official MVP Honors</span>
              <p className="text-lg font-bold text-white">{stats.mvpCount} Times</p>
            </div>
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs text-slate-400 font-mono">Championship Trophies</span>
              <p className="text-lg font-bold text-white">{stats.tournamentTrophies}</p>
            </div>
            <Trophy className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Cross-Database Identity Registry Card */}
      <div className="bg-[#0f1422] rounded-3xl border border-slate-800 p-6 shadow-xl space-y-3 text-xs">
        <h3 className="font-bold text-white font-heading flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" /> Global Identity & Shard Routing Card
        </h3>
        <p className="text-slate-400 leading-relaxed">
          TMT Official YT uses unified identity records (<code className="text-amber-300 font-mono">{currentUser.global_user_id}</code>). Your profile and tournament rosters reside in shard node <code className="text-cyan-300 font-mono">{currentUser.database_id}</code> with encrypted cross-shard communication.
        </p>
      </div>
    </div>
  );
}
