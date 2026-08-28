export type DatabaseId =
  | 'DB-01-MUMBAI'
  | 'DB-02-BENGALURU'
  | 'DB-03-DELHI'
  | 'DB-04-HYDERABAD'
  | 'DB-05-KOLKATA';
export type StorageDriveId = 'DRIVE-01-PRIMARY' | 'DRIVE-02-BACKUP' | 'DRIVE-03-MEDIA';

export type UserRole = 
  | 'PLAYER'
  | 'TEAM_CAPTAIN'
  | 'SUPER_ADMIN'
  | 'COMPETITION_ADMIN'
  | 'FINANCE_ADMIN'
  | 'VERIFICATION_ADMIN'
  | 'CONTENT_ADMIN'
  | 'SUPPORT_ADMIN';

export type PlayerStatus = 'ACTIVE' | 'WARNING' | 'TEMPORARY_SUSPENSION' | 'PERMANENT_BAN';

export type FreeFireRank = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'HEROIC' | 'MASTER' | 'GRANDMASTER';

export interface PlayerStats {
  matchesPlayed: number;
  wins: number;
  kills: number;
  mvpCount: number;
  winRate: number; // percentage e.g. 34.5
  kdRatio: number; // e.g. 4.2
  headshotRate: number; // percentage
  tournamentTrophies: number;
}

export interface PlayerProfile {
  global_user_id: string;
  database_id: DatabaseId;
  local_user_id: string;
  email: string;
  displayName: string;
  freeFireUid: string;
  freeFireIgn: string;
  ffRank: FreeFireRank;
  ffLevel: number;
  avatarUrl: string;
  role: UserRole;
  status: PlayerStatus;
  isEmailVerified: boolean;
  isUidVerified: boolean;
  currentTeamId?: string;
  state: string; // Indian state e.g. Maharashtra, UP, Punjab, Karnataka
  stats: PlayerStats;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  global_user_id: string;
  database_id: DatabaseId;
  displayName: string;
  freeFireUid: string;
  freeFireIgn: string;
  roleInTeam: 'CAPTAIN' | 'MAIN_ROSTER' | 'SUBSTITUTE';
  joinedAt: string;
  avatarUrl?: string;
}

export interface TeamInvite {
  inviteId: string;
  teamId: string;
  teamName: string;
  teamTag: string;
  captainName: string;
  invitedUserId: string;
  roleOffered: 'MAIN_ROSTER' | 'SUBSTITUTE';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
}

export interface Team {
  teamId: string;
  name: string;
  tag: string; // e.g. TMT, GOD, TX
  logoUrl: string;
  captainId: string; // global_user_id
  members: TeamMember[];
  maxMembers: number; // usually 4 + 2 subs = 6
  verified: boolean;
  status: 'ACTIVE' | 'DISBANDED' | 'DISQUALIFIED';
  stats: {
    tournamentsPlayed: number;
    tournamentsWon: number;
    totalKills: number;
    rankPoints: number;
  };
  createdAt: string;
}

export type CompetitionFormat = 'SOLO' | 'DUO' | 'SQUAD';
export type CompetitionMode = 'BATTLE_ROYALE' | 'CLASH_SQUAD';
export type CompetitionType = 'FREE' | 'PAID_COMPLIANCE_GATED';

export type CompetitionStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'ROSTER_LOCKED'
  | 'MATCH_ACTIVE'
  | 'RESULTS_PENDING'
  | 'RESULTS_VERIFIED'
  | 'COMPLETED';

export interface SlotAllocation {
  slotNumber: number;
  participantId: string; // global_user_id (for Solo) or teamId (for Duo/Squad)
  participantName: string;
  participantTag?: string;
  captainUid?: string;
  rosterUids: string[]; // List of FF UIDs for fair-play checking
  assignedAt: string;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'DISQUALIFIED';
}

export interface PrizeConfig {
  firstPlace: string;
  secondPlace: string;
  thirdPlace: string;
  mvpPrize: string;
  trophyDescription: string;
  cashPermitted: boolean; // Must be false unless compliance gate is cleared
}

export interface MvpRules {
  title: string;
  criteria: 'HIGHEST_KILLS' | 'KILL_PLUS_DAMAGE' | 'MOST_SURVIVAL_MINUTES' | 'OFFICIAL_SCORE_FORMULA';
  description: string;
  killWeight: number;
  placementWeight: number;
}

export interface RoomDetails {
  roomId: string;
  password?: string;
  mapName: 'Bermuda' | 'Purgatory' | 'Kalahari' | 'Alpine' | 'NextAI';
  releaseTime: string; // ISO string when credentials become visible to registered players
  matchStartTime: string;
  streamUrl?: string;
  youtubeLiveId?: string;
  discordVoiceChannel?: string;
}

export interface MatchResultEntry {
  rank: number;
  participantId: string;
  participantName: string;
  kills: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
  mvpPlayerUid?: string;
  mvpPlayerName?: string;
  verifiedByAdminId?: string;
}

export interface Competition {
  competitionId: string;
  title: string;
  description: string;
  format: CompetitionFormat;
  mode: CompetitionMode;
  type: CompetitionType;
  entryFee: number; // in INR (₹0 for FREE)
  status: CompetitionStatus;
  bannerUrl: string;
  organizer: string;
  totalSlots: number;
  slots: SlotAllocation[];
  registrationOpensAt: string;
  registrationClosesAt: string;
  scheduledAt: string;
  rules: string[];
  prizeConfig: PrizeConfig;
  mvpRules: MvpRules;
  roomDetails: RoomDetails;
  results?: MatchResultEntry[];
  mvpWinner?: {
    global_user_id: string;
    playerName: string;
    freeFireUid: string;
    kills: number;
    criteriaNotes: string;
    verified: boolean;
  };
  sponsorIds: string[];
  createdAt: string;
}

export type SponsorTier = 'PRESENTED_BY' | 'POWERED_BY' | 'SPONSORED_BY' | 'OFFICIAL_PARTNER';
export type SponsorStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'ACTIVE' | 'PAUSED' | 'EXPIRED';

export interface Sponsor {
  sponsorId: string;
  name: string;
  tier: SponsorTier;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  websiteUrl?: string;
  status: SponsorStatus;
  displayPriority: number; // 1 (highest) to 10
  campaignStart: string;
  campaignEnd: string;
  metrics: {
    impressions: number;
    bannerClicks: number;
    instagramClicks: number;
    youtubeClicks: number;
    websiteClicks: number;
  };
  createdAt: string;
}

export interface DatabaseNode {
  databaseId: DatabaseId;
  name: string;
  region: string;
  status: 'HEALTHY' | 'DEGRADED' | 'MAINTENANCE';
  userCapacity: number;
  activeUsers: number;
  latencyMs: number;
  lastHeartbeat: string;
}

export interface GlobalUserMapping {
  global_user_id: string;
  database_id: DatabaseId;
  local_user_id: string;
  email: string;
  freeFireUid: string;
  createdAt: string;
}

export interface StorageNode {
  driveId: StorageDriveId;
  name: string;
  provider: 'GOOGLE_DRIVE';
  status: 'ONLINE' | 'READ_ONLY' | 'MAINTENANCE';
  totalQuotaBytes: number;
  usedBytes: number;
  fileCount: number;
  lastSync: string;
}

export interface GlobalFileRecord {
  fileId: string;
  driveId: StorageDriveId;
  providerFileId: string;
  fileName: string;
  fileType: 'PROFILE' | 'TEAM_LOGO' | 'TOURNAMENT_BANNER' | 'SPONSOR_LOGO' | 'EVIDENCE' | 'CERTIFICATE' | 'REPORT';
  sizeBytes: number;
  mimeType: string;
  accessLevel: 'PUBLIC' | 'PRIVATE' | 'ADMIN_ONLY';
  url: string;
  uploadedBy: string; // global_user_id
  createdAt: string;
}

export type ReportReason =
  | 'HACK_AIMBOT'
  | 'SPEED_HACK'
  | 'WALL_HACK_ESP'
  | 'TEAMING_COLLUSION'
  | 'ACCOUNT_SHARING'
  | 'TOXIC_BEHAVIOR'
  | 'UNREGISTERED_PLAYER_UID';

export type PenaltyType = 'WARNING' | 'MATCH_PENALTY' | 'DISQUALIFICATION' | 'TEMPORARY_SUSPENSION' | 'PERMANENT_BAN' | 'NONE';

export interface FairPlayReport {
  reportId: string;
  reporterId: string;
  reporterName: string;
  targetPlayerUid: string;
  targetPlayerName?: string;
  competitionId?: string;
  matchName?: string;
  reason: ReportReason;
  description: string;
  evidenceUrls: string[];
  status: 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  penaltyApplied: PenaltyType;
  adminNotes?: string;
  reviewedByAdminId?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface FinancialLedgerEntry {
  global_transaction_id: string;
  global_user_id: string;
  competition_id: string;
  order_id: string;
  provider_reference: string;
  amount: number;
  currency: 'INR';
  status: 'CREATED' | 'PENDING' | 'VERIFIED' | 'FAILED' | 'CANCELLED' | 'REFUND_PENDING' | 'REFUNDED' | 'UNDER_REVIEW';
  paymentGateway: 'PHONEPE_SIMULATOR' | 'UPI_DIRECT' | 'MANUAL_COMPLIANCE';
  complianceCleared: boolean;
  createdAt: string;
  verifiedAt?: string;
}

export interface ComplianceGateState {
  monetaryCompetitionsEnabled: boolean;
  skillBasedGamingAffidavitVerified: boolean;
  restrictedStatesAcknowledged: string[]; // e.g. ["Telangana", "Assam", "Odisha", "Andhra Pradesh", "Nagaland", "Sikkim"]
  legalCounselApprovalRef: string;
  taxTdsDeductionSystemReady: boolean;
  lastAuditedAt: string;
  notes: string;
}

export interface EmergencyControlsState {
  registrationsPaused: boolean;
  accountCreationDisabled: boolean;
  financialsPaused: boolean;
  fileUploadsDisabled: boolean;
  maintenanceMode: boolean;
  activeIncidentNotice: string;
}

export interface AuditLog {
  logId: string;
  admin_global_user_id: string;
  adminName: string;
  action: string;
  targetType: 'COMPETITION' | 'USER' | 'TEAM' | 'SPONSOR' | 'STORAGE' | 'DATABASE' | 'EMERGENCY' | 'COMPLIANCE';
  targetId: string;
  oldValue?: string;
  newValue?: string;
  reason: string;
  timestamp: string;
  requestId: string;
}

export interface NotificationItem {
  notificationId: string;
  userId: string; // global_user_id or "ALL"
  type: 'SECURITY' | 'REGISTRATION' | 'MATCH_ROOM' | 'RESULT' | 'TEAM_INVITE' | 'ANNOUNCEMENT' | 'DISCIPLINARY';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface YouTubeStreamInfo {
  videoId: string;
  title: string;
  channelTitle: string;
  status: 'LIVE' | 'UPCOMING' | 'COMPLETED';
  scheduledStartTime?: string;
  viewerCount?: number;
  thumbnailUrl: string;
  embedUrl: string;
}
