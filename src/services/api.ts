import {
  Competition,
  DatabaseNode,
  FairPlayReport,
  FinancialLedgerEntry,
  GlobalFileRecord,
  GlobalUserMapping,
  PlayerProfile,
  SlotAllocation,
  Sponsor,
  StorageNode,
  Team,
  AuditLog,
  ComplianceGateState,
  EmergencyControlsState,
  NotificationItem,
  YouTubeStreamInfo,
} from '../types';

export const API = {
  // Health
  async getHealth() {
    const res = await fetch('/api/health');
    return res.json();
  },

  // Auth & User Profile
  async getCurrentUser(): Promise<{ user: PlayerProfile; mapping: GlobalUserMapping }> {
    const res = await fetch('/api/auth/current-user');
    return res.json();
  },

  async switchPersona(global_user_id: string): Promise<{ success: boolean; activeUser: PlayerProfile }> {
    const res = await fetch('/api/auth/switch-persona', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ global_user_id }),
    });
    return res.json();
  },

  async registerPlayer(data: {
    email: string;
    displayName: string;
    freeFireUid: string;
    freeFireIgn: string;
    state: string;
    role?: string;
  }): Promise<{ success: boolean; message: string; user: PlayerProfile; mapping: GlobalUserMapping }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async updateProfile(data: Partial<PlayerProfile>): Promise<{ success: boolean; user: PlayerProfile }> {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Update profile failed');
    }
    return res.json();
  },

  async requestUidVerification(): Promise<{ success: boolean; user: PlayerProfile }> {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isUidVerified: true }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'UID Verification failed');
    }
    return res.json();
  },

  // Database Registry
  async getDatabaseRegistry(): Promise<{
    databases: DatabaseNode[];
    mappingsCount: number;
    sampleMappings: GlobalUserMapping[];
    allPlayers?: PlayerProfile[];
  }> {
    const res = await fetch('/api/database-registry');
    return res.json();
  },

  async getAllPlayers(): Promise<{ players: PlayerProfile[] }> {
    const res = await fetch('/api/players');
    return res.json();
  },

  async toggleDbHealth(databaseId: string, status: string): Promise<{ success: boolean; node: DatabaseNode }> {
    const res = await fetch('/api/database-registry/toggle-health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ databaseId, status }),
    });
    return res.json();
  },

  async migrateUserDb(global_user_id: string, targetDatabaseId: string, reason: string): Promise<any> {
    const res = await fetch('/api/database-registry/migrate-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ global_user_id, targetDatabaseId, reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Migration failed');
    }
    return res.json();
  },

  // Storage
  async getStorageRegistry(): Promise<{ storageNodes: StorageNode[]; files: GlobalFileRecord[] }> {
    const res = await fetch('/api/storage/registry');
    return res.json();
  },

  async uploadFile(data: {
    fileName: string;
    fileType: string;
    sizeBytes: number;
    mimeType: string;
    accessLevel?: string;
    url?: string;
  }): Promise<{ success: boolean; message: string; file: GlobalFileRecord }> {
    const res = await fetch('/api/storage/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Upload failed');
    }
    return res.json();
  },

  // Teams
  async getTeams(): Promise<{ teams: Team[] }> {
    const res = await fetch('/api/teams');
    return res.json();
  },

  async getTeam(teamId: string): Promise<{ team: Team }> {
    const res = await fetch(`/api/teams/${teamId}`);
    return res.json();
  },

  async createTeam(data: { name: string; tag: string; logoUrl?: string }): Promise<{ success: boolean; team: Team }> {
    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Create team failed');
    }
    return res.json();
  },

  async addTeamMember(teamId: string, data: { targetUserIdOrUid: string; roleInTeam?: string }): Promise<{ success: boolean; message: string; team: Team }> {
    const res = await fetch(`/api/teams/${teamId}/add-member`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Add team member failed');
    }
    return res.json();
  },

  async removeTeamMember(teamId: string, memberId: string): Promise<{ success: boolean; team: Team }> {
    const res = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Remove team member failed');
    }
    return res.json();
  },

  // Competitions
  async getCompetitions(): Promise<{ competitions: Competition[] }> {
    const res = await fetch('/api/competitions');
    return res.json();
  },

  async getCompetition(competitionId: string): Promise<{
    competition: Competition;
    userRegistration: { isRegistered: boolean; canViewRoomCredentials: boolean; releaseTimePassed: boolean };
  }> {
    const res = await fetch(`/api/competitions/${competitionId}`);
    return res.json();
  },

  async createCompetition(data: any): Promise<{ success: boolean; competition: Competition }> {
    const res = await fetch('/api/competitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Create competition failed');
    }
    return res.json();
  },

  async registerForCompetition(competitionId: string, teamId?: string): Promise<{ success: boolean; message: string; slot: SlotAllocation; competition: Competition }> {
    const res = await fetch(`/api/competitions/${competitionId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async updateCompetitionStatus(competitionId: string, status: string, reason?: string): Promise<{ success: boolean; competition: Competition }> {
    const res = await fetch(`/api/competitions/${competitionId}/update-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Update status failed');
    }
    return res.json();
  },

  async submitResults(competitionId: string, data: { results: any[]; mvpWinner?: any }): Promise<{ success: boolean; competition: Competition }> {
    const res = await fetch(`/api/competitions/${competitionId}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Submit results failed');
    }
    return res.json();
  },

  // Sponsors
  async getSponsors(): Promise<{ sponsors: Sponsor[] }> {
    const res = await fetch('/api/sponsors');
    return res.json();
  },

  async getActiveBannerSponsors(): Promise<{ sponsors: Sponsor[] }> {
    const res = await fetch('/api/sponsors/active-banner');
    return res.json();
  },

  async trackSponsorEvent(sponsorId: string, eventType: string): Promise<any> {
    const res = await fetch(`/api/sponsors/${sponsorId}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType }),
    });
    return res.json();
  },

  async createSponsor(data: any): Promise<{ success: boolean; sponsor: Sponsor }> {
    const res = await fetch('/api/sponsors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Create sponsor failed');
    }
    return res.json();
  },

  // Fair Play & Reports
  async getFairPlayReports(): Promise<{ reports: FairPlayReport[] }> {
    const res = await fetch('/api/fairplay/reports');
    return res.json();
  },

  async submitFairPlayReport(data: any): Promise<{ success: boolean; report: FairPlayReport }> {
    const res = await fetch('/api/fairplay/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Submit report failed');
    }
    return res.json();
  },

  async adjudicateReport(reportId: string, data: any): Promise<{ success: boolean; report: FairPlayReport }> {
    const res = await fetch(`/api/fairplay/reports/${reportId}/adjudicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Adjudicate failed');
    }
    return res.json();
  },

  // Compliance & Financials
  async getComplianceData(): Promise<{ complianceState: ComplianceGateState; financialLedger: FinancialLedgerEntry[] }> {
    const res = await fetch('/api/compliance');
    return res.json();
  },

  async updateComplianceGate(data: any): Promise<{ success: boolean; complianceState: ComplianceGateState }> {
    const res = await fetch('/api/compliance/update-gate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Update compliance gate failed');
    }
    return res.json();
  },

  // Emergency & Audit
  async getEmergencyData(): Promise<{ emergencyState: EmergencyControlsState; auditLogs: AuditLog[] }> {
    const res = await fetch('/api/admin/emergency-controls');
    return res.json();
  },

  async updateEmergencyControls(data: any): Promise<{ success: boolean; emergencyState: EmergencyControlsState }> {
    const res = await fetch('/api/admin/emergency-controls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Update emergency controls failed');
    }
    return res.json();
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[] }> {
    const res = await fetch('/api/notifications');
    return res.json();
  },

  async markNotificationRead(notificationId: string): Promise<any> {
    const res = await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId }),
    });
    return res.json();
  },

  // YouTube
  async getStreams(): Promise<{ streams: YouTubeStreamInfo[] }> {
    const res = await fetch('/api/youtube/streams');
    return res.json();
  },
};
