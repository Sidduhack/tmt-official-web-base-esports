import { useState } from 'react';
import { Competition, PlayerProfile, Sponsor, Team, YouTubeStreamInfo } from '../../types';
import {
  Trophy,
  Flame,
  Users,
  ShieldCheck,
  Radio,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  Swords,
  Award,
  ExternalLink,
  Lock,
  ChevronRight,
  Play,
  CheckCircle,
} from 'lucide-react';

interface Props {
  competitions: Competition[];
  teams: Team[];
  sponsors: Sponsor[];
  streams: YouTubeStreamInfo[];
  currentUser: PlayerProfile | null;
  onSelectCompetition: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export function HomeView({
  competitions,
  teams,
  sponsors,
  streams,
  currentUser,
  onSelectCompetition,
  onNavigateTab,
}: Props) {
  const featuredCompetition = competitions[0];
  const liveStream = streams.find(s => s.status === 'LIVE') || streams[0];
  const openCompetitions = competitions.filter(c => c.status === 'REGISTRATION_OPEN');

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner Section */}
      <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-[#121826] via-[#0d121c] to-[#1c0e0b] shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 p-6 md:p-10 max-w-4xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> India’s Free Fire Esports Arena
            </span>
            <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> TMT Official YT Broadcasts
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight font-heading leading-tight">
            COMPETE. BOOYAH. <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">DOMINATE.</span>
          </h1>

          <p className="mt-3 text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
            Official competitive battleground by <strong>TMT Official YT</strong>. Register verified Free Fire rosters, secure automated room slots, conquer custom brackets, and rise to the national leaderboard.
          </p>

          {/* Hero CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              id="hero-explore-tournaments-btn"
              onClick={() => onNavigateTab('competitions')}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>Browse Active Tournaments</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-join-team-btn"
              onClick={() => onNavigateTab('teams')}
              className="px-5 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Manage Roster / Team</span>
            </button>

            <button
              id="hero-watch-live-btn"
              onClick={() => onNavigateTab('stream')}
              className="px-5 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold rounded-xl border border-red-500/30 flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Radio className="w-4 h-4 text-red-400" />
              <span>Watch Live Cast</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800">
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-mono">Verified Athletes</p>
              <p className="text-xl font-extrabold text-white font-mono">13,440+</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-mono">Active Teams</p>
              <p className="text-xl font-extrabold text-amber-400 font-mono">1,820+</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-mono">Tournaments Held</p>
              <p className="text-xl font-extrabold text-white font-mono">340+</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-mono">Fair Play Security</p>
              <p className="text-xl font-extrabold text-emerald-400 font-mono">100% UID Verified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Tournament Spotlight */}
      {featuredCompetition && (
        <div className="bg-[#0f1422] rounded-2xl border border-amber-500/20 p-5 md:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-xs font-bold uppercase">
                  FEATURED CHAMPIONSHIP
                </span>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-xs font-semibold">
                  {featuredCompetition.format} • {featuredCompetition.mode.replace('_', ' ')}
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-bold">
                  FREE COMMUNITY ENTRY
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white font-heading">
                {featuredCompetition.title}
              </h2>
            </div>

            <button
              id={`featured-view-match-${featuredCompetition.competitionId}`}
              onClick={() => onSelectCompetition(featuredCompetition.competitionId)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm flex items-center gap-2 shrink-0 transition active:scale-95 cursor-pointer shadow"
            >
              <span>View Match Lobby & Slots</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Match Schedule
              </p>
              <p className="font-bold text-white">
                {new Date(featuredCompetition.scheduledAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <p className="text-xs text-slate-400">
                Lobby: {new Date(featuredCompetition.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
              </p>
            </div>

            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-amber-400" /> Slot Availability
              </p>
              <div className="flex items-center justify-between">
                <p className="font-bold text-white font-mono">
                  {featuredCompetition.slots.length} / {featuredCompetition.totalSlots} Slots Filled
                </p>
                <span className="text-xs text-amber-400 font-bold">
                  {featuredCompetition.totalSlots - featuredCompetition.slots.length} Left
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${(featuredCompetition.slots.length / featuredCompetition.totalSlots) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Award className="w-3.5 h-3.5 text-amber-400" /> Grand Prize & MVP
              </p>
              <p className="font-bold text-amber-300 truncate">{featuredCompetition.prizeConfig.firstPlace}</p>
              <p className="text-xs text-slate-400 truncate">MVP: {featuredCompetition.prizeConfig.mvpPrize}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main 2-Column Content Grid: Open Tournaments & YouTube Live Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Live & Upcoming Match Hub */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
              <Swords className="w-5 h-5 text-amber-400" /> Active & Upcoming Battles
            </h3>
            <button
              onClick={() => onNavigateTab('competitions')}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              View All ({competitions.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {openCompetitions.map(comp => (
              <div
                key={comp.competitionId}
                onClick={() => onSelectCompetition(comp.competitionId)}
                className="bg-[#0f1422] hover:bg-[#141b2e] border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition-all cursor-pointer shadow-md group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-amber-400 font-bold shrink-0">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{comp.format}</span>
                      <span className="text-xs font-mono">{comp.mode === 'BATTLE_ROYALE' ? 'BR' : 'CS'}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          REGISTRATION OPEN
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Map: {comp.roomDetails.mapName}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition mt-0.5">
                        {comp.title}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                        <span>Slots: {comp.slots.length}/{comp.totalSlots}</span>
                        <span>•</span>
                        <span>Fee: ₹{comp.entryFee} (Free)</span>
                        <span>•</span>
                        <span>{new Date(comp.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      className="px-3.5 py-1.5 bg-slate-800 group-hover:bg-amber-500 group-hover:text-black text-slate-200 text-xs font-bold rounded-lg transition"
                    >
                      Join / View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Fair Play & Anti-Cheat Assurance Box */}
          <div className="bg-gradient-to-r from-slate-900 to-[#121a2b] border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">TMT Fair Play & Anti-Cheat Protocol</h4>
                <p className="text-xs text-slate-400">
                  Every participant is verified by in-game Free Fire UID. Zero tolerance for emulators, teaming, or unofficial scripts.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('fairplay')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold whitespace-nowrap cursor-pointer underline"
            >
              View Rules & Report
            </button>
          </div>
        </div>

        {/* Right 1 Column: YouTube Live & Stream Showcase */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-500" /> TMT Official YT Stream
            </h3>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-600 text-white animate-pulse">
              LIVE BROADCAST
            </span>
          </div>

          {liveStream && (
            <div className="bg-[#0f1422] rounded-xl border border-slate-800 overflow-hidden shadow-lg">
              <div className="aspect-video w-full bg-black relative">
                <iframe
                  src={liveStream.embedUrl}
                  title={liveStream.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-3.5 space-y-2">
                <h4 className="text-xs font-bold text-white line-clamp-2">{liveStream.title}</h4>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-red-400 font-semibold">{liveStream.viewerCount?.toLocaleString()} watching</span>
                  <a
                    href="https://youtube.com/@tmtofficialyt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Open on YT <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Top Teams Spotlight */}
          <div className="bg-[#0f1422] rounded-xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" /> Top Ranked Squads
              </h4>
              <button
                onClick={() => onNavigateTab('leaderboards')}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                Leaderboard
              </button>
            </div>

            <div className="space-y-2">
              {teams.slice(0, 3).map((t, idx) => (
                <div
                  key={t.teamId}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-amber-400 w-4">#{idx + 1}</span>
                    <img
                      src={t.logoUrl}
                      alt={t.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded object-cover border border-slate-700"
                    />
                    <div>
                      <p className="font-bold text-white">{t.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Tag: [{t.tag}]</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-400 font-mono">{t.stats.rankPoints} PTS</p>
                    <p className="text-[10px] text-slate-400">{t.stats.tournamentsWon} Cups</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
