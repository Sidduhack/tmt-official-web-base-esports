import { useState } from 'react';
import { PlayerProfile, Team } from '../../types';
import { Trophy, Flame, Award, Medal, Crown, Target, Zap, Shield } from 'lucide-react';

interface Props {
  teams: Team[];
  players: PlayerProfile[];
}

export function LeaderboardsView({ teams, players }: Props) {
  const [tab, setTab] = useState<'TEAMS' | 'PLAYERS' | 'MVP_HALL_OF_FAME'>('TEAMS');

  // Sorted teams by rank points
  const sortedTeams = [...teams].sort((a, b) => b.stats.rankPoints - a.stats.rankPoints);

  // Sorted players by kills / KD
  const sortedPlayers = [...players].sort((a, b) => b.stats.kills - a.stats.kills);

  // MVP Hall of fame players
  const mvpPlayers = [...players].sort((a, b) => b.stats.mvpCount - a.stats.mvpCount);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-heading flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-400" /> TMT Official National Rankings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Authoritative leaderboard computed from verified match finishes, frags, and official tournament cups.
          </p>
        </div>

        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setTab('TEAMS')}
            className={`px-4 py-1.5 rounded-lg transition ${
              tab === 'TEAMS' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Top Squads
          </button>
          <button
            onClick={() => setTab('PLAYERS')}
            className={`px-4 py-1.5 rounded-lg transition ${
              tab === 'PLAYERS' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Fraggers (Kills)
          </button>
          <button
            onClick={() => setTab('MVP_HALL_OF_FAME')}
            className={`px-4 py-1.5 rounded-lg transition ${
              tab === 'MVP_HALL_OF_FAME' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            MVP Hall of Fame
          </button>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tab === 'TEAMS' && sortedTeams.slice(0, 3).map((team, idx) => (
          <div
            key={team.teamId}
            className={`p-5 rounded-2xl border flex flex-col justify-between relative overflow-hidden shadow-xl ${
              idx === 0
                ? 'bg-gradient-to-b from-amber-500/20 via-[#0f1422] to-[#0f1422] border-amber-500/50'
                : idx === 1
                ? 'bg-gradient-to-b from-slate-400/20 via-[#0f1422] to-[#0f1422] border-slate-400/30'
                : 'bg-gradient-to-b from-amber-700/20 via-[#0f1422] to-[#0f1422] border-amber-700/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm ${
                  idx === 0
                    ? 'bg-amber-500 text-black'
                    : idx === 1
                    ? 'bg-slate-300 text-black'
                    : 'bg-amber-800 text-white'
                }`}
              >
                #{idx + 1}
              </span>
              <Crown className={`w-5 h-5 ${idx === 0 ? 'text-amber-400' : 'text-slate-500'}`} />
            </div>

            <div className="my-4 text-center">
              <img
                src={team.logoUrl}
                alt={team.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl mx-auto object-cover border border-slate-700 shadow-md mb-2"
              />
              <h3 className="font-bold text-lg text-white font-heading">{team.name}</h3>
              <p className="text-xs text-slate-400 font-mono">[{team.tag}]</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <div>
                <p className="text-slate-500">Trophies</p>
                <p className="font-bold text-white">{team.stats.tournamentsWon} Cups</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">Rating</p>
                <p className="font-bold text-amber-400 text-sm">{team.stats.rankPoints} PTS</p>
              </div>
            </div>
          </div>
        ))}

        {tab === 'PLAYERS' && sortedPlayers.slice(0, 3).map((player, idx) => (
          <div
            key={player.global_user_id}
            className={`p-5 rounded-2xl border flex flex-col justify-between relative overflow-hidden shadow-xl ${
              idx === 0
                ? 'bg-gradient-to-b from-amber-500/20 via-[#0f1422] to-[#0f1422] border-amber-500/50'
                : idx === 1
                ? 'bg-gradient-to-b from-slate-400/20 via-[#0f1422] to-[#0f1422] border-slate-400/30'
                : 'bg-gradient-to-b from-amber-700/20 via-[#0f1422] to-[#0f1422] border-amber-700/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm ${
                  idx === 0
                    ? 'bg-amber-500 text-black'
                    : idx === 1
                    ? 'bg-slate-300 text-black'
                    : 'bg-amber-800 text-white'
                }`}
              >
                #{idx + 1}
              </span>
              <Target className="w-5 h-5 text-amber-400" />
            </div>

            <div className="my-4 text-center">
              <img
                src={player.avatarUrl}
                alt={player.displayName}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl mx-auto object-cover border border-slate-700 shadow-md mb-2"
              />
              <h3 className="font-bold text-lg text-white font-heading">{player.displayName}</h3>
              <p className="text-xs text-amber-400 font-mono">IGN: {player.freeFireIgn}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <div>
                <p className="text-slate-500">K/D Ratio</p>
                <p className="font-bold text-white">{player.stats.kdRatio}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">Total Kills</p>
                <p className="font-bold text-red-400 text-sm">{player.stats.kills}</p>
              </div>
            </div>
          </div>
        ))}

        {tab === 'MVP_HALL_OF_FAME' && mvpPlayers.slice(0, 3).map((player, idx) => (
          <div
            key={player.global_user_id}
            className="p-5 rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-500/20 via-[#0f1422] to-[#0f1422] flex flex-col justify-between shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-amber-500 text-black font-extrabold text-sm flex items-center justify-center">
                #{idx + 1}
              </span>
              <Award className="w-5 h-5 text-amber-400" />
            </div>

            <div className="my-4 text-center">
              <img
                src={player.avatarUrl}
                alt={player.displayName}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl mx-auto object-cover border border-amber-500/40 shadow-md mb-2"
              />
              <h3 className="font-bold text-lg text-white font-heading">{player.displayName}</h3>
              <p className="text-xs text-slate-400 font-mono">{player.ffRank}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <div>
                <p className="text-slate-500">Headshot %</p>
                <p className="font-bold text-emerald-400">{player.stats.headshotRate}%</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">MVP Titles</p>
                <p className="font-bold text-amber-400 text-base">{player.stats.mvpCount} MVPs</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-[#0f1422] rounded-2xl border border-slate-800 p-5 md:p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" /> Complete Roster Standings
        </h3>

        <div className="overflow-x-auto">
          {tab === 'TEAMS' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Squad Name</th>
                  <th className="py-3 px-4 text-center">Members</th>
                  <th className="py-3 px-4 text-center">Tournaments</th>
                  <th className="py-3 px-4 text-center">Cups Won</th>
                  <th className="py-3 px-4 text-center">Team Kills</th>
                  <th className="py-3 px-4 text-right">Rank Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {sortedTeams.map((team, idx) => (
                  <tr key={team.teamId} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-amber-400">#{idx + 1}</td>
                    <td className="py-3.5 px-4 font-sans font-bold text-white flex items-center gap-2.5">
                      <img
                        src={team.logoUrl}
                        alt={team.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded object-cover"
                      />
                      <span>{team.name} [{team.tag}]</span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-300">{team.members.length}</td>
                    <td className="py-3.5 px-4 text-center text-slate-300">{team.stats.tournamentsPlayed}</td>
                    <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">{team.stats.tournamentsWon}</td>
                    <td className="py-3.5 px-4 text-center text-red-400">{team.stats.totalKills}</td>
                    <td className="py-3.5 px-4 text-right text-amber-400 font-extrabold text-sm">
                      {team.stats.rankPoints} PTS
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab !== 'TEAMS' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Athlete / Free Fire IGN</th>
                  <th className="py-3 px-4">Free Fire UID</th>
                  <th className="py-3 px-4 text-center">Rank Tier</th>
                  <th className="py-3 px-4 text-center">Win Rate</th>
                  <th className="py-3 px-4 text-center">K/D</th>
                  <th className="py-3 px-4 text-center">Headshot %</th>
                  <th className="py-3 px-4 text-right">{tab === 'PLAYERS' ? 'Total Kills' : 'MVP Awards'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {(tab === 'PLAYERS' ? sortedPlayers : mvpPlayers).map((player, idx) => (
                  <tr key={player.global_user_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-amber-400">#{idx + 1}</td>
                    <td className="py-3.5 px-4 font-sans font-bold text-white flex items-center gap-2.5">
                      <img
                        src={player.avatarUrl}
                        alt={player.displayName}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <p>{player.displayName}</p>
                        <p className="text-[10px] text-amber-400 font-mono">{player.freeFireIgn}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{player.freeFireUid}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-amber-300">
                        {player.ffRank} ({player.ffLevel})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-300">{player.stats.winRate}%</td>
                    <td className="py-3.5 px-4 text-center text-slate-300">{player.stats.kdRatio}</td>
                    <td className="py-3.5 px-4 text-center text-emerald-400">{player.stats.headshotRate}%</td>
                    <td className="py-3.5 px-4 text-right text-amber-400 font-extrabold text-sm">
                      {tab === 'PLAYERS' ? `${player.stats.kills} KILLS` : `${player.stats.mvpCount} MVPs`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
