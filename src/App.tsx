import { useState, useEffect } from 'react';
import {
  AuditLog,
  Competition,
  ComplianceGateState,
  DatabaseNode,
  EmergencyControlsState,
  FairPlayReport,
  FinancialLedgerEntry,
  GlobalFileRecord,
  NotificationItem,
  PlayerProfile,
  Sponsor,
  StorageNode,
  Team,
  YouTubeStreamInfo,
} from './types';
import { API } from './services/api';
import { Header } from './components/Header';
import { RollingSponsorBanner } from './components/RollingSponsorBanner';
import { EmergencyNoticeBanner } from './components/EmergencyNoticeBanner';
import { HomeView } from './components/views/HomeView';
import { CompetitionsView } from './components/views/CompetitionsView';
import { MatchDetailView } from './components/views/MatchDetailView';
import { TeamsView } from './components/views/TeamsView';
import { LeaderboardsView } from './components/views/LeaderboardsView';
import { PlayerProfileView } from './components/views/PlayerProfileView';
import { FairPlayView } from './components/views/FairPlayView';
import { MediaStreamView } from './components/views/MediaStreamView';
import { ComplianceLegalView } from './components/views/ComplianceLegalView';
import { AdminCommandCenter } from './components/views/AdminCommandCenter';
import { SystemArchitectureDiagModal } from './components/views/SystemArchitectureDiagModal';
import { Youtube, ExternalLink, Server } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string | null>(null);
  const [showDiagModal, setShowDiagModal] = useState<boolean>(false);

  // Core Platform Data State
  const [currentUser, setCurrentUser] = useState<PlayerProfile | null>(null);
  const [allPlayers, setAllPlayers] = useState<PlayerProfile[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [reports, setReports] = useState<FairPlayReport[]>([]);
  const [streams, setStreams] = useState<YouTubeStreamInfo[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dbNodes, setDbNodes] = useState<DatabaseNode[]>([]);
  const [storageNodes, setStorageNodes] = useState<StorageNode[]>([]);
  const [files, setFiles] = useState<GlobalFileRecord[]>([]);
  const [complianceState, setComplianceState] = useState<ComplianceGateState>({
    monetaryCompetitionsEnabled: false,
    skillBasedGamingAffidavitVerified: true,
    restrictedStatesAcknowledged: ['Telangana', 'Assam', 'Odisha', 'Andhra Pradesh', 'Nagaland', 'Sikkim'],
    legalCounselApprovalRef: 'IND-ESPORTS-2024-LEGAL-GATE-LOCKED',
    taxTdsDeductionSystemReady: true,
    lastAuditedAt: new Date().toISOString(),
    notes: 'Initial Gate Locked - Free Tournaments Only',
  });
  const [financialLedger, setFinancialLedger] = useState<FinancialLedgerEntry[]>([]);
  const [emergencyState, setEmergencyState] = useState<EmergencyControlsState>({
    maintenanceMode: false,
    registrationsPaused: false,
    accountCreationDisabled: false,
    financialsPaused: false,
    fileUploadsDisabled: false,
    activeIncidentNotice: '',
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Initial Load & Synchronize all modules
  const refreshAllData = async () => {
    try {
      const [
        userData,
        compsData,
        teamsData,
        sponsorsData,
        reportsData,
        streamsData,
        notifsData,
        dbData,
        storageData,
        compComplianceData,
        emergData,
      ] = await Promise.all([
        API.getCurrentUser(),
        API.getCompetitions(),
        API.getTeams(),
        API.getSponsors(),
        API.getFairPlayReports(),
        API.getStreams(),
        API.getNotifications(),
        API.getDatabaseRegistry(),
        API.getStorageRegistry(),
        API.getComplianceData(),
        API.getEmergencyData(),
      ]);

      if (userData?.user) {
        setCurrentUser(userData.user);
      }
      if (compsData?.competitions) setCompetitions(compsData.competitions);
      if (teamsData?.teams) setTeams(teamsData.teams);
      if (sponsorsData?.sponsors) setSponsors(sponsorsData.sponsors);
      if (reportsData?.reports) setReports(reportsData.reports);
      if (streamsData?.streams) setStreams(streamsData.streams);
      if (notifsData?.notifications) setNotifications(notifsData.notifications);
      if (dbData?.databases) setDbNodes(dbData.databases);
      if (storageData?.storageNodes) setStorageNodes(storageData.storageNodes);
      if (storageData?.files) setFiles(storageData.files);
      if (compComplianceData?.complianceState) setComplianceState(compComplianceData.complianceState);
      if (compComplianceData?.financialLedger) setFinancialLedger(compComplianceData.financialLedger);
      if (emergData?.emergencyState) setEmergencyState(emergData.emergencyState);
      if (emergData?.auditLogs) setAuditLogs(emergData.auditLogs);

      // Extract players for quick testing persona switcher across all 5 database shards
      if (dbData?.allPlayers && dbData.allPlayers.length > 0) {
        setAllPlayers(dbData.allPlayers);
      } else if (dbData?.sampleMappings) {
        const fetchedPlayers: PlayerProfile[] = [
          userData.user,
          {
            global_user_id: 'USR_GLOBAL_002',
            database_id: 'DB-01-MUMBAI',
            local_user_id: 'local_002',
            email: 'captain@tmtofficialyt.esports',
            displayName: 'TMT_Phantom',
            freeFireUid: '1894729104',
            freeFireIgn: 'TMT_Phantom_FF',
            ffLevel: 74,
            ffRank: 'GRANDMASTER',
            state: 'Maharashtra',
            avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
            isEmailVerified: true,
            isUidVerified: true,
            role: 'TEAM_CAPTAIN',
            status: 'ACTIVE',
            currentTeamId: 'TEAM_TMT_01',
            stats: { kills: 1420, matchesPlayed: 280, wins: 119, winRate: 42.5, kdRatio: 5.8, headshotRate: 68.4, mvpCount: 24, tournamentTrophies: 6 },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            global_user_id: 'USR_GLOBAL_003',
            database_id: 'DB-02-BENGALURU',
            local_user_id: 'local_003',
            email: 'rusher@tmtofficialyt.esports',
            displayName: 'Aman_OP',
            freeFireUid: '2049182741',
            freeFireIgn: 'TMT_AmanRusher',
            ffLevel: 68,
            ffRank: 'MASTER',
            state: 'Delhi',
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            isEmailVerified: true,
            isUidVerified: true,
            role: 'PLAYER',
            status: 'ACTIVE',
            currentTeamId: 'TEAM_TMT_01',
            stats: { kills: 980, matchesPlayed: 190, wins: 69, winRate: 36.2, kdRatio: 4.6, headshotRate: 54.1, mvpCount: 11, tournamentTrophies: 3 },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            global_user_id: 'USR_GLOBAL_004',
            database_id: 'DB-03-DELHI',
            local_user_id: 'local_004',
            email: 'sniper@tmtofficialyt.esports',
            displayName: 'Karan_AWP',
            freeFireUid: '3948201948',
            freeFireIgn: 'TMT_KaranSniper',
            ffLevel: 71,
            ffRank: 'MASTER',
            state: 'Karnataka',
            avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
            isEmailVerified: true,
            isUidVerified: true,
            role: 'PLAYER',
            status: 'ACTIVE',
            currentTeamId: 'TEAM_TMT_01',
            stats: { kills: 1120, matchesPlayed: 210, wins: 84, winRate: 39.8, kdRatio: 5.1, headshotRate: 72.0, mvpCount: 16, tournamentTrophies: 4 },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            global_user_id: 'USR_GLOBAL_008',
            database_id: 'DB-04-HYDERABAD',
            local_user_id: 'local_008',
            email: 'viper.hyd@tmtesports.in',
            displayName: 'Hyderabad_Viper',
            freeFireUid: '5591029384',
            freeFireIgn: 'HYD・VIPER🐍',
            ffLevel: 76,
            ffRank: 'GRANDMASTER',
            state: 'Telangana',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            isEmailVerified: true,
            isUidVerified: true,
            role: 'PLAYER',
            status: 'ACTIVE',
            currentTeamId: 'TEAM_TMT_01',
            stats: { kills: 1290, matchesPlayed: 310, wins: 145, winRate: 46.7, kdRatio: 5.2, headshotRate: 69.8, mvpCount: 42, tournamentTrophies: 12 },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            global_user_id: 'USR_GLOBAL_009',
            database_id: 'DB-05-KOLKATA',
            local_user_id: 'local_009',
            email: 'tiger.kolkata@tmtesports.in',
            displayName: 'Kolkata_Tiger',
            freeFireUid: '6681920391',
            freeFireIgn: 'KOL・TIGER🐅',
            ffLevel: 70,
            ffRank: 'MASTER',
            state: 'West Bengal',
            avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
            isEmailVerified: true,
            isUidVerified: true,
            role: 'PLAYER',
            status: 'ACTIVE',
            currentTeamId: 'TEAM_GOD_02',
            stats: { kills: 1040, matchesPlayed: 275, wins: 118, winRate: 42.9, kdRatio: 4.7, headshotRate: 61.5, mvpCount: 31, tournamentTrophies: 7 },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setAllPlayers(fetchedPlayers);
      }
    } catch (err) {
      console.error('Failed to initialize platform data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const handleSwitchPersona = async (globalUserId: string) => {
    try {
      const res = await API.switchPersona(globalUserId);
      if (res?.activeUser) {
        setCurrentUser(res.activeUser);
        refreshAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkNotificationRead = async (notifId: string) => {
    try {
      await API.markNotificationRead(notifId);
      setNotifications(prev =>
        prev.map(n => (n.notificationId === notifId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectCompetition = (id: string) => {
    setSelectedCompetitionId(id);
    setActiveTab('match-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Platform Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={tab => {
          setActiveTab(tab);
          if (tab !== 'match-detail') setSelectedCompetitionId(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        allPlayers={allPlayers}
        notifications={notifications}
        onSwitchPersona={handleSwitchPersona}
        onMarkNotificationRead={handleMarkNotificationRead}
        onOpenDiagModal={() => setShowDiagModal(true)}
      />

      {/* Rolling Sponsor Carousel & Banner */}
      <RollingSponsorBanner sponsors={sponsors} />

      {/* Emergency Advisory Banner */}
      <EmergencyNoticeBanner emergencyState={emergencyState} />

      {/* Main Container View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-slate-400 font-mono">
              Booting TMT Multi-Supabase Cluster (3 Nodes) & GDrive Vaults...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView
                competitions={competitions}
                teams={teams}
                sponsors={sponsors}
                streams={streams}
                currentUser={currentUser}
                onSelectCompetition={handleSelectCompetition}
                onNavigateTab={tab => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {activeTab === 'competitions' && (
              <CompetitionsView
                competitions={competitions}
                teams={teams}
                currentUser={currentUser}
                onSelectCompetition={handleSelectCompetition}
                onRefreshData={refreshAllData}
              />
            )}

            {activeTab === 'match-detail' && selectedCompetitionId && (
              <MatchDetailView
                competitionId={selectedCompetitionId}
                currentUser={currentUser}
                teams={teams}
                sponsors={sponsors}
                onBack={() => {
                  setActiveTab('competitions');
                  setSelectedCompetitionId(null);
                }}
                onRefreshData={refreshAllData}
              />
            )}

            {activeTab === 'teams' && (
              <TeamsView
                teams={teams}
                currentUser={currentUser}
                onRefreshData={refreshAllData}
              />
            )}

            {activeTab === 'leaderboards' && (
              <LeaderboardsView teams={teams} players={allPlayers} />
            )}

            {activeTab === 'profile' && (
              <PlayerProfileView currentUser={currentUser} onRefreshData={refreshAllData} />
            )}

            {activeTab === 'fairplay' && (
              <FairPlayView
                reports={reports}
                competitions={competitions}
                currentUser={currentUser}
                onRefreshData={refreshAllData}
              />
            )}

            {activeTab === 'stream' && <MediaStreamView streams={streams} />}

            {activeTab === 'compliance' && (
              <ComplianceLegalView complianceState={complianceState} />
            )}

            {activeTab === 'admin' && (
              <AdminCommandCenter
                currentUser={currentUser}
                competitions={competitions}
                teams={teams}
                sponsors={sponsors}
                reports={reports}
                dbNodes={dbNodes}
                storageNodes={storageNodes}
                files={files}
                complianceState={complianceState}
                financialLedger={financialLedger}
                emergencyState={emergencyState}
                auditLogs={auditLogs}
                onRefreshData={refreshAllData}
              />
            )}
          </>
        )}
      </main>

      {/* Cluster Diagnostics Modal */}
      {showDiagModal && (
        <SystemArchitectureDiagModal
          dbNodes={dbNodes}
          storageNodes={storageNodes}
          onClose={() => setShowDiagModal(false)}
        />
      )}

      {/* Global Footer */}
      <footer className="bg-[#06080e] border-t border-slate-800/80 mt-16 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-extrabold text-black text-sm">
                TMT
              </div>
              <span className="font-extrabold text-white text-base tracking-wider font-heading uppercase">
                TMT Official YT
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              India's premier competitive Free Fire tournament platform. Built with multi-database high availability and zero server cost free-tier architecture.
            </p>
            <p className="text-[11px] font-mono text-slate-500">
              © {new Date().getFullYear()} TMT Official YT Esports. All rights reserved.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-white uppercase tracking-wider font-heading text-xs">Platform Modules</p>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => { setActiveTab('competitions'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-amber-400 transition cursor-pointer">
                  Tournaments & Scrims
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('teams'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-amber-400 transition cursor-pointer">
                  Teams & Cross-DB Rosters
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('leaderboards'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-amber-400 transition cursor-pointer">
                  National Leaderboard
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('stream'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-amber-400 transition cursor-pointer">
                  YouTube Broadcast Center
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-white uppercase tracking-wider font-heading text-xs">Integrity & Policies</p>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => { setActiveTab('fairplay'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-emerald-400 transition cursor-pointer">
                  Anti-Cheat Protocol
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('compliance'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-amber-400 transition cursor-pointer">
                  Indian Legal & IT Rules 2023
                </button>
              </li>
              <li>
                <button onClick={() => setShowDiagModal(true)} className="hover:text-cyan-400 transition cursor-pointer flex items-center gap-1 font-mono">
                  <Server className="w-3 h-3" />
                  <span>Cluster Diagnostics</span>
                </button>
              </li>
              <li>
                <span className="text-slate-500">Grievance: legal@tmtofficialyt.esports</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="font-bold text-white uppercase tracking-wider font-heading text-xs">Official Channels</p>
            <a
              href="https://youtube.com/@tmtofficialyt"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-400 text-xs font-bold transition"
            >
              <Youtube className="w-4 h-4" />
              <span>Subscribe YouTube Channel</span>
              <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
            <p className="text-[11px] text-slate-400">
              Free Fire is a registered trademark of Garena International. TMT Official YT is an independent grassroots eSports competitive organizer.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
