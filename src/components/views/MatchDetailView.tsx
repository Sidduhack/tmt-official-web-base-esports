import { useState, useEffect } from 'react';
import { Competition, PlayerProfile, Sponsor, Team } from '../../types';
import { API } from '../../services/api';
import {
  Trophy,
  ArrowLeft,
  Calendar,
  Clock,
  Key,
  Lock,
  Unlock,
  ShieldCheck,
  Radio,
  ExternalLink,
  Users,
  Award,
  Medal,
  Flame,
  CheckCircle2,
  Copy,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  competitionId: string;
  currentUser: PlayerProfile | null;
  teams: Team[];
  sponsors: Sponsor[];
  onBack: () => void;
  onRefreshData: () => void;
}

export function MatchDetailView({
  competitionId,
  currentUser,
  teams,
  sponsors,
  onBack,
  onRefreshData,
}: Props) {
  const [compData, setCompData] = useState<{
    competition: Competition;
    userRegistration: { isRegistered: boolean; canViewRoomCredentials: boolean; releaseTimePassed: boolean };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await API.getCompetition(competitionId);
      setCompData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [competitionId]);

  if (loading || !compData) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-slate-400 font-mono">Loading Match Lobby Matrix...</p>
      </div>
    );
  }

  const { competition: comp, userRegistration } = compData;
  const matchSponsors = sponsors.filter(s => comp.sponsorIds.includes(s.sponsorId));
  const releaseDate = new Date(comp.roomDetails.releaseTime);
  const timeToReleaseMs = releaseDate.getTime() - now.getTime();

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return 'Credentials Available Now';
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Navigation Top Bar */}
      <button
        onClick={onBack}
        className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Competitions
      </button>

      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#0f1422] shadow-2xl">
        <div className="h-56 md:h-64 w-full relative bg-black">
          <img
            src={comp.bannerUrl}
            alt={comp.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1422] via-[#0f1422]/60 to-transparent"></div>

          <div className="absolute bottom-4 left-4 right-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-500 text-black text-xs font-bold uppercase font-mono">
                  {comp.format} • {comp.mode.replace('_', ' ')}
                </span>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase">
                  {comp.status.replace('_', ' ')}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 text-xs font-mono">
                  MAP: {comp.roomDetails.mapName}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white font-heading">
                {comp.title}
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Organized by <strong className="text-amber-400">{comp.organizer}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {comp.roomDetails.youtubeLiveId && (
                <a
                  href={`https://youtube.com/watch?v=${comp.roomDetails.youtubeLiveId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Watch Stream</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {comp.roomDetails.discordVoiceChannel && (
                <a
                  href={comp.roomDetails.discordVoiceChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
                >
                  <span>Discord Lobby</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Room Info & Schedule on Left, Slots & Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Room Credentials Box & Match Rules */}
        <div className="space-y-6">
          {/* Room ID & Password Automated Security Box */}
          <div className="bg-[#0f1422] rounded-2xl border border-amber-500/30 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" /> Custom Room Credentials
              </h3>
              {userRegistration.canViewRoomCredentials ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Unlock className="w-3 h-3" /> UNLOCKED
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> PROTECTED
                </span>
              )}
            </div>

            {userRegistration.canViewRoomCredentials ? (
              <div className="space-y-3">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">Room ID</p>
                    <p className="text-base font-bold font-mono text-amber-300">
                      {comp.roomDetails.roomId}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(comp.roomDetails.roomId, 'roomId')}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Copy Room ID"
                  >
                    {copiedField === 'roomId' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">Room Password</p>
                    <p className="text-base font-bold font-mono text-emerald-300">
                      {comp.roomDetails.password}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(comp.roomDetails.password || '', 'password')}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Copy Password"
                  >
                    {copiedField === 'password' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  ⚠️ Join Free Fire custom lobby immediately and sit only in your designated slot number.
                </p>
              </div>
            ) : (
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-center space-y-3">
                <Lock className="w-8 h-8 text-amber-400 mx-auto opacity-75" />
                <div>
                  <p className="text-xs text-slate-300 font-semibold">
                    {userRegistration.isRegistered
                      ? 'Room ID & Password will unlock automatically:'
                      : 'Room credentials are encrypted & restricted to verified athletes in this lobby.'}
                  </p>
                  {userRegistration.isRegistered && (
                    <p className="text-lg font-mono font-extrabold text-amber-400 mt-1">
                      ⏳ {formatCountdown(timeToReleaseMs)}
                    </p>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 font-mono">
                  Release Time: {releaseDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
                </p>
              </div>
            )}

            {/* Schedule & Lobby details */}
            <div className="pt-2 border-t border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Match Start Time:
                </span>
                <span className="font-bold text-white font-mono">
                  {new Date(comp.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Slots Filled:</span>
                <span className="font-bold text-amber-400 font-mono">
                  {comp.slots.length} / {comp.totalSlots}
                </span>
              </div>
            </div>
          </div>

          {/* MVP Rule Specification Box */}
          <div className="bg-[#0f1422] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" /> MVP Rules & Criteria
            </h3>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300">{comp.mvpRules.title}</span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">
                  {comp.mvpRules.criteria}
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                {comp.mvpRules.description}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                <div>Kill Multiplier: <strong className="text-white">{comp.mvpRules.killWeight}x</strong></div>
                <div>Placement Weight: <strong className="text-white">{comp.mvpRules.placementWeight}x</strong></div>
              </div>
            </div>
          </div>

          {/* Rules & Fair Play Matrix */}
          <div className="bg-[#0f1422] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Match Rulebook
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {comp.rules.map((r, i) => (
                <li key={i} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-amber-400 font-mono font-bold">{i + 1}.</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right 2 Columns: Official Slot Roster & Verified Results Podium */}
        <div className="lg:col-span-2 space-y-6">
          {/* Verified Results & MVP Podium (if completed or results verified) */}
          {comp.results && comp.results.length > 0 && (
            <div className="bg-[#0f1422] rounded-2xl border border-amber-500/40 p-5 md:p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-white font-heading">
                    Official Match Results & MVP
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  VERIFIED AUTHORITATIVE
                </span>
              </div>

              {/* MVP Highlight Card */}
              {comp.mvpWinner && (
                <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-orange-950/60 p-4 rounded-xl border border-amber-500/40 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center font-extrabold text-black text-xl shadow-lg">
                      MVP
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-400 font-mono uppercase font-bold">
                          TOURNAMENT MVP
                        </span>
                        <span className="text-xs bg-black/60 px-2 py-0.2 rounded text-slate-300 font-mono">
                          UID: {comp.mvpWinner.freeFireUid}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-white">
                        {comp.mvpWinner.playerName}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{comp.mvpWinner.criteriaNotes}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-extrabold font-mono text-amber-400">{comp.mvpWinner.kills}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-mono">Match Kills</p>
                  </div>
                </div>
              )}

              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Rank</th>
                      <th className="py-2.5 px-3">Participant / Squad</th>
                      <th className="py-2.5 px-3 text-center">Kills</th>
                      <th className="py-2.5 px-3 text-center">Placement Pts</th>
                      <th className="py-2.5 px-3 text-center">Kill Pts</th>
                      <th className="py-2.5 px-3 text-right">Total Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {comp.results.map((res, i) => (
                      <tr
                        key={i}
                        className={`hover:bg-slate-800/40 transition ${
                          res.rank === 1 ? 'bg-amber-500/10 font-bold' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <span
                            className={`w-6 h-6 rounded flex items-center justify-center font-bold ${
                              res.rank === 1
                                ? 'bg-amber-500 text-black'
                                : res.rank === 2
                                ? 'bg-slate-300 text-black'
                                : res.rank === 3
                                ? 'bg-amber-800 text-white'
                                : 'text-slate-400'
                            }`}
                          >
                            #{res.rank}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-white font-sans font-bold">
                          {res.participantName}
                          {res.mvpPlayerName && (
                            <span className="text-[10px] text-amber-400 block font-normal">
                              MVP: {res.mvpPlayerName}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-200">{res.kills}</td>
                        <td className="py-3 px-3 text-center text-slate-200">{res.placementPoints}</td>
                        <td className="py-3 px-3 text-center text-slate-200">{res.killPoints}</td>
                        <td className="py-3 px-3 text-right text-amber-400 font-bold text-sm">
                          {res.totalPoints} PTS
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Slot Allocation Matrix */}
          <div className="bg-[#0f1422] rounded-2xl border border-slate-800 p-5 md:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" /> Slot Reservation Matrix
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Slot numbers match in-game Free Fire lobby positions. Anti-cheat verified UIDs only.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                {comp.slots.length} of {comp.totalSlots} Slots Claimed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: comp.totalSlots }).map((_, idx) => {
                const slotNumber = idx + 1;
                const allocation = comp.slots.find(s => s.slotNumber === slotNumber);

                return (
                  <div
                    key={slotNumber}
                    className={`p-3.5 rounded-xl border transition-all text-xs ${
                      allocation
                        ? 'bg-slate-900/80 border-slate-700/80 hover:border-amber-500/40'
                        : 'bg-slate-950/40 border-dashed border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-extrabold text-amber-400">
                        SLOT #{slotNumber}
                      </span>
                      {allocation ? (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {allocation.status}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 uppercase font-mono">AVAILABLE</span>
                      )}
                    </div>

                    {allocation ? (
                      <div className="space-y-1">
                        <p className="font-bold text-white text-sm truncate">
                          {allocation.participantName}
                          {allocation.participantTag && ` [${allocation.participantTag}]`}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">
                          Captain UID: {allocation.captainUid}
                        </p>
                        <div className="flex items-center gap-1 flex-wrap pt-1">
                          {allocation.rosterUids.map((uid, uIdx) => (
                            <span
                              key={uIdx}
                              className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono"
                            >
                              UID: {uid}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic py-2">Open Slot</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tournament Official Sponsors */}
          {matchSponsors.length > 0 && (
            <div className="bg-[#0f1422] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                Official Tournament Partners & Sponsors
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {matchSponsors.map(s => (
                  <div
                    key={s.sponsorId}
                    className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-3"
                  >
                    <img
                      src={s.logoUrl}
                      alt={s.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-lg object-cover border border-slate-700"
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] text-amber-400 font-bold uppercase">{s.tier.replace('_', ' ')}</p>
                      <p className="text-xs font-bold text-white truncate">{s.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
