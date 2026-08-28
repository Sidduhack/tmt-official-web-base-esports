import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_COMPETITIONS,
  INITIAL_DATABASES,
  INITIAL_FAIRPLAY_REPORTS,
  INITIAL_FILES,
  INITIAL_FINANCIAL_LEDGER,
  INITIAL_PLAYERS,
  INITIAL_SPONSORS,
  INITIAL_STORAGE_NODES,
  INITIAL_TEAMS,
  INITIAL_USER_MAPPINGS,
  INITIAL_COMPLIANCE_STATE,
  INITIAL_EMERGENCY_STATE,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_YOUTUBE_STREAMS,
} from './src/data/initialData';
import {
  Competition,
  DatabaseId,
  DatabaseNode,
  FairPlayReport,
  FinancialLedgerEntry,
  GlobalFileRecord,
  GlobalUserMapping,
  PenaltyType,
  PlayerProfile,
  SlotAllocation,
  Sponsor,
  StorageDriveId,
  StorageNode,
  Team,
  AuditLog,
  ComplianceGateState,
  EmergencyControlsState,
  NotificationItem,
  UserRole,
} from './src/types';

// In-Memory Database Store (Simulating deterministic multi-Supabase and multi-GDrive nodes)
let databases: DatabaseNode[] = [...INITIAL_DATABASES];
let storageNodes: StorageNode[] = [...INITIAL_STORAGE_NODES];
let globalUserMappings: GlobalUserMapping[] = [...INITIAL_USER_MAPPINGS];
let players: PlayerProfile[] = [...INITIAL_PLAYERS];
let teams: Team[] = [...INITIAL_TEAMS];
let competitions: Competition[] = [...INITIAL_COMPETITIONS];
let sponsors: Sponsor[] = [...INITIAL_SPONSORS];
let files: GlobalFileRecord[] = [...INITIAL_FILES];
let fairPlayReports: FairPlayReport[] = [...INITIAL_FAIRPLAY_REPORTS];
let financialLedger: FinancialLedgerEntry[] = [...INITIAL_FINANCIAL_LEDGER];
let complianceState: ComplianceGateState = { ...INITIAL_COMPLIANCE_STATE };
let emergencyState: EmergencyControlsState = { ...INITIAL_EMERGENCY_STATE };
let auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
let notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];

// Current active session global user (defaults to Super Admin for demo testing, switchable via API)
let currentActiveUserId = 'USR_GLOBAL_001';

// Helper: Deterministic Audit Log Creator
function logAdminAction(
  adminId: string,
  action: string,
  targetType: AuditLog['targetType'],
  targetId: string,
  reason: string,
  oldValue?: string,
  newValue?: string
) {
  const admin = players.find(p => p.global_user_id === adminId);
  const log: AuditLog = {
    logId: `AUDIT_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    admin_global_user_id: adminId,
    adminName: admin ? `${admin.displayName} (${admin.role})` : 'System Admin',
    action,
    targetType,
    targetId,
    oldValue,
    newValue,
    reason,
    timestamp: new Date().toISOString(),
    requestId: `REQ_${Date.now()}`,
  };
  auditLogs.unshift(log);
  return log;
}

// Helper: Deterministic Multi-Database Router
function selectOptimalDatabase(): DatabaseNode {
  // Check active databases with status HEALTHY and capacity < 90%
  const eligibleNodes = databases.filter(
    db => db.status === 'HEALTHY' && db.activeUsers < db.userCapacity * 0.95
  );

  if (eligibleNodes.length === 0) {
    // Fallback to least loaded node even if near capacity
    const sorted = [...databases].sort((a, b) => a.activeUsers / a.userCapacity - b.activeUsers / b.userCapacity);
    return sorted[0];
  }

  // Pick node with lowest utilization ratio
  eligibleNodes.sort((a, b) => a.activeUsers / a.userCapacity - b.activeUsers / b.userCapacity);
  return eligibleNodes[0];
}

// Helper: Deterministic Storage Node Router
function selectOptimalStorageNode(): StorageNode {
  const eligibleDrives = storageNodes.filter(
    drive => drive.status === 'ONLINE' && drive.usedBytes < drive.totalQuotaBytes * 0.95
  );
  if (eligibleDrives.length === 0) {
    return storageNodes[0];
  }
  eligibleDrives.sort((a, b) => a.usedBytes / a.totalQuotaBytes - b.usedBytes / b.totalQuotaBytes);
  return eligibleDrives[0];
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Request logger middleware
  app.use((req, res, next) => {
    // Basic audit trace for mutations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      console.log(`[TMT-API] ${req.method} ${req.path} from User:${currentActiveUserId}`);
    }
    next();
  });

  // ==========================================
  // 1. HEALTH & SYSTEM OVERVIEW
  // ==========================================
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      platform: 'TMT Official YT Free Fire eSports Platform',
      version: '4.2.0-prod',
      environment: 'India (ap-south-1)',
      emergencyState,
      activeDatabases: databases.length,
      activeStorageNodes: storageNodes.length,
      complianceGate: complianceState.monetaryCompetitionsEnabled ? 'MONETARY_ENABLED' : 'STRICT_COMPLIANCE_LOCKED',
    });
  });

  // ==========================================
  // 2. AUTHENTICATION & GLOBAL IDENTITY
  // ==========================================
  app.get('/api/auth/current-user', (req, res) => {
    const user = players.find(p => p.global_user_id === currentActiveUserId);
    if (!user) {
      return res.status(404).json({ error: 'Active user profile not found' });
    }
    const mapping = globalUserMappings.find(m => m.global_user_id === user.global_user_id);
    res.json({ user, mapping });
  });

  // Switch demo active persona for testing all user types (Player, Captain, Admins)
  app.post('/api/auth/switch-persona', (req, res) => {
    const { global_user_id } = req.body;
    const target = players.find(p => p.global_user_id === global_user_id);
    if (!target) {
      return res.status(404).json({ error: 'Target persona user not found' });
    }
    currentActiveUserId = target.global_user_id;
    res.json({ success: true, activeUser: target });
  });

  // Register a new player with deterministic Multi-DB routing
  app.post('/api/auth/register', (req, res) => {
    if (emergencyState.accountCreationDisabled || emergencyState.maintenanceMode) {
      return res.status(503).json({
        error: 'Account registrations are temporarily paused under active emergency controls or maintenance.',
      });
    }

    const { email, displayName, freeFireUid, freeFireIgn, state, role } = req.body;

    if (!email || !displayName || !freeFireUid || !freeFireIgn) {
      return res.status(400).json({ error: 'Missing required registration parameters.' });
    }

    // UID duplicate check across all nodes
    const existingUid = players.find(p => p.freeFireUid === freeFireUid);
    if (existingUid) {
      return res.status(409).json({ error: `Free Fire UID ${freeFireUid} is already registered on TMT Platform.` });
    }

    // Step 1: Check active databases & select optimal node
    const targetDb = selectOptimalDatabase();

    // Step 2: Generate global_user_id and local_user_id
    const newGlobalUserId = `USR_GLOBAL_${(players.length + 1).toString().padStart(3, '0')}`;
    const localUserId = `sub_${targetDb.databaseId.substring(0, 5).toLowerCase()}_${Math.random().toString(36).substring(2, 8)}`;

    const newProfile: PlayerProfile = {
      global_user_id: newGlobalUserId,
      database_id: targetDb.databaseId,
      local_user_id: localUserId,
      email,
      displayName,
      freeFireUid,
      freeFireIgn,
      ffRank: 'HEROIC',
      ffLevel: 45,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${displayName}`,
      role: role || 'PLAYER',
      status: 'ACTIVE',
      isEmailVerified: true,
      isUidVerified: true,
      state: state || 'Maharashtra',
      stats: {
        matchesPlayed: 0,
        wins: 0,
        kills: 0,
        mvpCount: 0,
        winRate: 0,
        kdRatio: 0,
        headshotRate: 0,
        tournamentTrophies: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Step 3: Record global mapping
    const newMapping: GlobalUserMapping = {
      global_user_id: newGlobalUserId,
      database_id: targetDb.databaseId,
      local_user_id: localUserId,
      email,
      freeFireUid,
      createdAt: new Date().toISOString(),
    };

    // Increment node active users
    targetDb.activeUsers += 1;

    players.push(newProfile);
    globalUserMappings.push(newMapping);
    currentActiveUserId = newGlobalUserId;

    // Dispatch welcome notification
    notifications.unshift({
      notificationId: `NOTIF_${Date.now()}`,
      userId: newGlobalUserId,
      type: 'SECURITY',
      title: 'Welcome to TMT Official YT',
      message: `Account routed to ${targetDb.name}. Your Global ID: ${newGlobalUserId}.`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: `Player registered and mapped to ${targetDb.name} (${targetDb.region})`,
      user: newProfile,
      mapping: newMapping,
    });
  });

  // Update profile / Free Fire UID
  app.put('/api/auth/profile', (req, res) => {
    const userIndex = players.findIndex(p => p.global_user_id === currentActiveUserId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { displayName, freeFireUid, freeFireIgn, ffRank, ffLevel, state, avatarUrl } = req.body;

    if (freeFireUid && freeFireUid !== players[userIndex].freeFireUid) {
      // UID uniqueness check
      const duplicate = players.find(p => p.freeFireUid === freeFireUid && p.global_user_id !== currentActiveUserId);
      if (duplicate) {
        return res.status(409).json({ error: 'Free Fire UID is already in use by another athlete.' });
      }
      players[userIndex].freeFireUid = freeFireUid;
    }

    if (displayName) players[userIndex].displayName = displayName;
    if (freeFireIgn) players[userIndex].freeFireIgn = freeFireIgn;
    if (ffRank) players[userIndex].ffRank = ffRank;
    if (ffLevel) players[userIndex].ffLevel = Number(ffLevel);
    if (state) players[userIndex].state = state;
    if (avatarUrl) players[userIndex].avatarUrl = avatarUrl;
    players[userIndex].updatedAt = new Date().toISOString();

    res.json({ success: true, user: players[userIndex] });
  });

  // ==========================================
  // 3. DATABASE REGISTRY & CROSS-DB ROUTING
  // ==========================================
  app.get('/api/database-registry', (req, res) => {
    res.json({
      databases,
      mappingsCount: globalUserMappings.length,
      sampleMappings: globalUserMappings.slice(0, 20),
      allPlayers: players,
    });
  });

  app.get('/api/players', (req, res) => {
    res.json({ players });
  });

  // Simulate Database Maintenance or Health State Toggle
  app.post('/api/database-registry/toggle-health', (req, res) => {
    const { databaseId, status } = req.body;
    const node = databases.find(db => db.databaseId === databaseId);
    if (!node) {
      return res.status(404).json({ error: 'Database node not found' });
    }
    const oldStatus = node.status;
    node.status = status;
    node.lastHeartbeat = new Date().toISOString();

    logAdminAction(
      currentActiveUserId,
      'DATABASE_HEALTH_TOGGLE',
      'DATABASE',
      databaseId,
      `Changed node status from ${oldStatus} to ${status}`,
      oldStatus,
      status
    );

    res.json({ success: true, node });
  });

  // Controlled Cross-DB Migration Utility
  app.post('/api/database-registry/migrate-user', (req, res) => {
    const { global_user_id, targetDatabaseId, reason } = req.body;
    const user = players.find(p => p.global_user_id === global_user_id);
    const targetDb = databases.find(db => db.databaseId === targetDatabaseId);
    const mapping = globalUserMappings.find(m => m.global_user_id === global_user_id);

    if (!user || !targetDb || !mapping) {
      return res.status(400).json({ error: 'Invalid migration parameters.' });
    }

    const oldDbId = user.database_id;
    const oldDb = databases.find(db => db.databaseId === oldDbId);
    if (oldDb) oldDb.activeUsers = Math.max(0, oldDb.activeUsers - 1);
    targetDb.activeUsers += 1;

    user.database_id = targetDatabaseId;
    mapping.database_id = targetDatabaseId;

    logAdminAction(
      currentActiveUserId,
      'CONTROLLED_USER_MIGRATION',
      'USER',
      global_user_id,
      reason || 'Rebalancing load across Supabase cluster nodes',
      oldDbId,
      targetDatabaseId
    );

    res.json({
      success: true,
      message: `User ${user.displayName} safely migrated from ${oldDbId} to ${targetDatabaseId}. Team relationships remain intact.`,
      user,
      mapping,
    });
  });

  // ==========================================
  // 4. STORAGE REGISTRY (GOOGLE DRIVE MULTI-VAULT)
  // ==========================================
  app.get('/api/storage/registry', (req, res) => {
    res.json({
      storageNodes,
      files,
    });
  });

  // Upload/Register a new global file record
  app.post('/api/storage/upload', (req, res) => {
    if (emergencyState.fileUploadsDisabled) {
      return res.status(503).json({ error: 'File uploads are temporarily disabled by platform administrators.' });
    }

    const { fileName, fileType, sizeBytes, mimeType, accessLevel, url } = req.body;
    const optimalDrive = selectOptimalStorageNode();

    const newFileId = `FILE_TMT_${Date.now().toString().slice(-6)}`;
    const newRecord: GlobalFileRecord = {
      fileId: newFileId,
      driveId: optimalDrive.driveId,
      providerFileId: `GDRIVE_${optimalDrive.driveId.slice(0, 8)}_${Math.random().toString(36).substring(2, 9)}`,
      fileName: fileName || 'uploaded_asset.png',
      fileType: fileType || 'PROFILE',
      sizeBytes: sizeBytes || 350000,
      mimeType: mimeType || 'image/png',
      accessLevel: accessLevel || 'PUBLIC',
      url: url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      uploadedBy: currentActiveUserId,
      createdAt: new Date().toISOString(),
    };

    optimalDrive.usedBytes += newRecord.sizeBytes;
    optimalDrive.fileCount += 1;
    files.unshift(newRecord);

    res.status(201).json({
      success: true,
      message: `File securely indexed to ${optimalDrive.name}`,
      file: newRecord,
    });
  });

  // ==========================================
  // 5. TEAMS & CROSS-DB ROSTER MANAGEMENT
  // ==========================================
  app.get('/api/teams', (req, res) => {
    res.json({ teams });
  });

  app.get('/api/teams/:teamId', (req, res) => {
    const team = teams.find(t => t.teamId === req.params.teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json({ team });
  });

  // Create a new team
  app.post('/api/teams', (req, res) => {
    const { name, tag, logoUrl } = req.body;
    const captain = players.find(p => p.global_user_id === currentActiveUserId);

    if (!captain) {
      return res.status(401).json({ error: 'Must be logged in to create a team.' });
    }

    if (!name || !tag) {
      return res.status(400).json({ error: 'Team name and tag are required.' });
    }

    const newTeamId = `TEAM_${tag.toUpperCase()}_${Date.now().toString().slice(-4)}`;
    const newTeam: Team = {
      teamId: newTeamId,
      name,
      tag: tag.toUpperCase(),
      logoUrl: logoUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80',
      captainId: captain.global_user_id,
      members: [
        {
          global_user_id: captain.global_user_id,
          database_id: captain.database_id,
          displayName: captain.displayName,
          freeFireUid: captain.freeFireUid,
          freeFireIgn: captain.freeFireIgn,
          roleInTeam: 'CAPTAIN',
          joinedAt: new Date().toISOString(),
          avatarUrl: captain.avatarUrl,
        },
      ],
      maxMembers: 6,
      verified: true,
      status: 'ACTIVE',
      stats: {
        tournamentsPlayed: 0,
        tournamentsWon: 0,
        totalKills: 0,
        rankPoints: 1000,
      },
      createdAt: new Date().toISOString(),
    };

    captain.currentTeamId = newTeamId;
    captain.role = 'TEAM_CAPTAIN';
    teams.push(newTeam);

    res.status(201).json({ success: true, team: newTeam });
  });

  // Invite member to team (Cross-Database safe)
  app.post('/api/teams/:teamId/add-member', (req, res) => {
    const { teamId } = req.params;
    const { targetUserIdOrUid, roleInTeam } = req.body;

    const team = teams.find(t => t.teamId === teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.captainId !== currentActiveUserId) {
      // Check if caller is super admin or captain
      const caller = players.find(p => p.global_user_id === currentActiveUserId);
      if (!caller || caller.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Only the team captain or administrator can add roster members.' });
      }
    }

    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ error: 'Team roster has reached maximum capacity (6 players).' });
    }

    // Find target user by global_user_id or freeFireUid
    const targetPlayer = players.find(
      p => p.global_user_id === targetUserIdOrUid || p.freeFireUid === targetUserIdOrUid
    );

    if (!targetPlayer) {
      return res.status(404).json({ error: 'Target player with that ID or Free Fire UID was not found.' });
    }

    // Check if player is already in roster
    if (team.members.some(m => m.global_user_id === targetPlayer.global_user_id)) {
      return res.status(409).json({ error: 'Player is already on this team roster.' });
    }

    // Cross-Database transparent addition
    team.members.push({
      global_user_id: targetPlayer.global_user_id,
      database_id: targetPlayer.database_id,
      displayName: targetPlayer.displayName,
      freeFireUid: targetPlayer.freeFireUid,
      freeFireIgn: targetPlayer.freeFireIgn,
      roleInTeam: roleInTeam || 'MAIN_ROSTER',
      joinedAt: new Date().toISOString(),
      avatarUrl: targetPlayer.avatarUrl,
    });

    targetPlayer.currentTeamId = teamId;

    // Send in-app notification to invited player
    notifications.unshift({
      notificationId: `NOTIF_${Date.now()}`,
      userId: targetPlayer.global_user_id,
      type: 'TEAM_INVITE',
      title: `Roster Added: ${team.name}`,
      message: `You were added to ${team.name} [${team.tag}] as ${roleInTeam || 'MAIN_ROSTER'}.`,
      link: `/team/${teamId}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: `Player ${targetPlayer.displayName} (from ${targetPlayer.database_id}) added to ${team.name}`,
      team,
    });
  });

  // Remove member from team
  app.delete('/api/teams/:teamId/members/:memberId', (req, res) => {
    const { teamId, memberId } = req.params;
    const team = teams.find(t => t.teamId === teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    if (team.captainId !== currentActiveUserId && memberId !== currentActiveUserId) {
      return res.status(403).json({ error: 'Unauthorized to remove member.' });
    }

    if (memberId === team.captainId && team.members.length > 1) {
      return res.status(400).json({ error: 'Captain cannot leave without transferring captaincy or disbanding.' });
    }

    team.members = team.members.filter(m => m.global_user_id !== memberId);
    const targetPlayer = players.find(p => p.global_user_id === memberId);
    if (targetPlayer) targetPlayer.currentTeamId = undefined;

    res.json({ success: true, team });
  });

  // ==========================================
  // 6. COMPETITIONS, TOURNAMENTS & SLOTS
  // ==========================================
  app.get('/api/competitions', (req, res) => {
    res.json({ competitions });
  });

  app.get('/api/competitions/:competitionId', (req, res) => {
    const comp = competitions.find(c => c.competitionId === req.params.competitionId);
    if (!comp) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    // Check if current user is registered to reveal room credentials safely
    const isParticipant = comp.slots.some(
      s =>
        s.participantId === currentActiveUserId ||
        s.rosterUids.includes(players.find(p => p.global_user_id === currentActiveUserId)?.freeFireUid || '')
    );
    const isAdmin = players.some(
      p => p.global_user_id === currentActiveUserId && ['SUPER_ADMIN', 'COMPETITION_ADMIN'].includes(p.role)
    );

    const now = new Date();
    const releaseTime = new Date(comp.roomDetails.releaseTime);
    const isReleaseTimePassed = now >= releaseTime;

    // Secure response stripping room password unless eligible
    const sanitizedComp = JSON.parse(JSON.stringify(comp));
    if (!(isAdmin || (isParticipant && isReleaseTimePassed))) {
      sanitizedComp.roomDetails.password = '••• LOCKED UNTIL RELEASE TIME •••';
      if (!isParticipant && !isAdmin) {
        sanitizedComp.roomDetails.roomId = '••• RESTRICTED TO REGISTERED ATHLETES •••';
      }
    }

    res.json({
      competition: sanitizedComp,
      userRegistration: {
        isRegistered: isParticipant,
        canViewRoomCredentials: isAdmin || (isParticipant && isReleaseTimePassed),
        releaseTimePassed: isReleaseTimePassed,
      },
    });
  });

  // Create new competition
  app.post('/api/competitions', (req, res) => {
    const admin = players.find(p => p.global_user_id === currentActiveUserId);
    if (!admin || !['SUPER_ADMIN', 'COMPETITION_ADMIN'].includes(admin.role)) {
      return res.status(403).json({ error: 'Access denied: Requires COMPETITION_ADMIN or SUPER_ADMIN role.' });
    }

    const {
      title,
      description,
      format,
      mode,
      type,
      entryFee,
      totalSlots,
      registrationOpensAt,
      registrationClosesAt,
      scheduledAt,
      rules,
      prizeConfig,
      mvpRules,
      roomDetails,
      sponsorIds,
    } = req.body;

    // Strict Indian Compliance Gate Check for Paid Tournaments
    if (type === 'PAID_COMPLIANCE_GATED' || (entryFee && entryFee > 0)) {
      if (!complianceState.monetaryCompetitionsEnabled) {
        return res.status(403).json({
          error:
            'COMPLIANCE REJECTION: Paid monetary entry competitions are strictly disabled until full Indian gaming law certification and payment gateway clearing is completed.',
        });
      }
    }

    const newCompId = `COMP_TMT_FF_${Date.now().toString().slice(-4)}`;
    const newComp: Competition = {
      competitionId: newCompId,
      title: title || 'TMT Community Scrims Match',
      description: description || 'Official Free Fire competitive match on TMT Official YT.',
      format: format || 'SQUAD',
      mode: mode || 'BATTLE_ROYALE',
      type: type || 'FREE',
      entryFee: Number(entryFee) || 0,
      status: 'REGISTRATION_OPEN',
      bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
      organizer: 'TMT Official YT eSports Management',
      totalSlots: Number(totalSlots) || 12,
      slots: [],
      registrationOpensAt: registrationOpensAt || new Date().toISOString(),
      registrationClosesAt: registrationClosesAt || new Date(Date.now() + 86400000).toISOString(),
      scheduledAt: scheduledAt || new Date(Date.now() + 90000000).toISOString(),
      rules: rules || ['No emulators', 'Verified FF UIDs required', 'No teaming'],
      prizeConfig: prizeConfig || {
        firstPlace: 'Champions Trophy + 500 TMT Points',
        secondPlace: '300 TMT Points',
        thirdPlace: '150 TMT Points',
        mvpPrize: 'MVP Golden Skull',
        trophyDescription: 'Official Trophy',
        cashPermitted: false,
      },
      mvpRules: mvpRules || {
        title: 'TMT MVP Standard',
        criteria: 'HIGHEST_KILLS',
        description: 'Awarded to player with most kills',
        killWeight: 2.0,
        placementWeight: 1.0,
      },
      roomDetails: roomDetails || {
        roomId: `TMT-RM-${Math.floor(1000 + Math.random() * 9000)}`,
        password: `TMT_${Math.floor(100 + Math.random() * 900)}`,
        mapName: 'Bermuda',
        releaseTime: new Date(Date.now() + 85000000).toISOString(),
        matchStartTime: scheduledAt || new Date(Date.now() + 90000000).toISOString(),
        streamUrl: 'https://youtube.com/@tmtofficialyt',
        youtubeLiveId: 'jfKfPfyJRdk',
        discordVoiceChannel: 'https://discord.gg/tmt-esports-scrims',
      },
      sponsorIds: sponsorIds || ['SPON_001', 'SPON_002'],
      createdAt: new Date().toISOString(),
    };

    competitions.unshift(newComp);

    logAdminAction(
      currentActiveUserId,
      'CREATE_COMPETITION',
      'COMPETITION',
      newCompId,
      `Created ${newComp.title} (${newComp.format} - ${newComp.type})`
    );

    res.status(201).json({ success: true, competition: newComp });
  });

  // Slot System: Atomic, Race-Condition-Protected Registration
  app.post('/api/competitions/:competitionId/register', (req, res) => {
    if (emergencyState.registrationsPaused || emergencyState.maintenanceMode) {
      return res.status(503).json({
        error: 'Tournament registrations are currently paused under emergency controls.',
      });
    }

    const { competitionId } = req.params;
    const { teamId } = req.body;
    const comp = competitions.find(c => c.competitionId === competitionId);

    if (!comp) {
      return res.status(404).json({ error: 'Competition not found.' });
    }

    if (comp.status !== 'REGISTRATION_OPEN') {
      return res.status(400).json({ error: `Registration is not open (Current status: ${comp.status}).` });
    }

    const now = new Date();
    if (now < new Date(comp.registrationOpensAt) || now > new Date(comp.registrationClosesAt)) {
      return res.status(400).json({ error: 'Registration window has either not opened or has expired.' });
    }

    // Atomic Slot capacity check
    if (comp.slots.length >= comp.totalSlots) {
      return res.status(409).json({ error: 'All slots for this competition are full.' });
    }

    let participantId = currentActiveUserId;
    let participantName = '';
    let participantTag = '';
    let captainUid = '';
    let rosterUids: string[] = [];

    if (comp.format === 'SOLO') {
      const player = players.find(p => p.global_user_id === currentActiveUserId);
      if (!player) return res.status(401).json({ error: 'Player profile required.' });
      if (!player.isUidVerified) {
        return res.status(400).json({ error: 'Your Free Fire UID must be verified before tournament entry.' });
      }

      // Check duplicate solo registration
      if (comp.slots.some(s => s.participantId === player.global_user_id || s.rosterUids.includes(player.freeFireUid))) {
        return res.status(409).json({ error: 'You are already registered for this tournament.' });
      }

      participantId = player.global_user_id;
      participantName = player.freeFireIgn;
      captainUid = player.freeFireUid;
      rosterUids = [player.freeFireUid];
    } else {
      // DUO or SQUAD requires team
      const targetTeamId = teamId || players.find(p => p.global_user_id === currentActiveUserId)?.currentTeamId;
      if (!targetTeamId) {
        return res.status(400).json({ error: 'Squad/Duo registration requires an active team roster.' });
      }
      const team = teams.find(t => t.teamId === targetTeamId);
      if (!team) {
        return res.status(404).json({ error: 'Team not found.' });
      }

      const requiredPlayers = comp.format === 'DUO' ? 2 : 4;
      if (team.members.length < requiredPlayers) {
        return res.status(400).json({
          error: `Team roster requires at least ${requiredPlayers} members for ${comp.format} competition (Current: ${team.members.length}).`,
        });
      }

      // Check duplicate team registration
      if (comp.slots.some(s => s.participantId === team.teamId)) {
        return res.status(409).json({ error: 'This team is already registered for this competition.' });
      }

      // Check duplicate roster player across other slots
      const teamUids = team.members.map(m => m.freeFireUid);
      const alreadyInSlot = comp.slots.some(s => s.rosterUids.some(uid => teamUids.includes(uid)));
      if (alreadyInSlot) {
        return res.status(409).json({
          error: 'One or more players in your team roster are already registered in another slot.',
        });
      }

      participantId = team.teamId;
      participantName = team.name;
      participantTag = team.tag;
      captainUid = team.members.find(m => m.roleInTeam === 'CAPTAIN')?.freeFireUid || team.members[0].freeFireUid;
      rosterUids = teamUids;
    }

    // Determine next slot number deterministically
    const nextSlotNumber = comp.slots.length + 1;
    const newSlot: SlotAllocation = {
      slotNumber: nextSlotNumber,
      participantId,
      participantName,
      participantTag,
      captainUid,
      rosterUids,
      assignedAt: new Date().toISOString(),
      status: 'CONFIRMED',
    };

    comp.slots.push(newSlot);

    // Record financial ledger entry for audit (₹0 for free)
    financialLedger.unshift({
      global_transaction_id: `TXN_${Date.now()}`,
      global_user_id: currentActiveUserId,
      competition_id: comp.competitionId,
      order_id: `ORD_ENTRY_${Date.now()}`,
      provider_reference: 'FREE_COMMUNITY_PASS_TMT',
      amount: comp.entryFee,
      currency: 'INR',
      status: 'VERIFIED',
      paymentGateway: 'MANUAL_COMPLIANCE',
      complianceCleared: true,
      createdAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
    });

    // Notify user
    notifications.unshift({
      notificationId: `NOTIF_${Date.now()}`,
      userId: currentActiveUserId,
      type: 'REGISTRATION',
      title: `Registration Confirmed: ${comp.title}`,
      message: `Slot #${nextSlotNumber} successfully reserved for ${participantName}. Room ID & Password will be released in match view.`,
      link: `/match/${comp.competitionId}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: `Slot #${nextSlotNumber} assigned to ${participantName}`,
      slot: newSlot,
      competition: comp,
    });
  });

  // Update competition lifecycle status
  app.post('/api/competitions/:competitionId/update-status', (req, res) => {
    const { competitionId } = req.params;
    const { status, reason } = req.body;
    const comp = competitions.find(c => c.competitionId === competitionId);

    if (!comp) return res.status(404).json({ error: 'Competition not found' });

    const admin = players.find(p => p.global_user_id === currentActiveUserId);
    if (!admin || !['SUPER_ADMIN', 'COMPETITION_ADMIN'].includes(admin.role)) {
      return res.status(403).json({ error: 'Admin authorization required.' });
    }

    const oldStatus = comp.status;
    comp.status = status;

    logAdminAction(
      currentActiveUserId,
      'UPDATE_COMPETITION_LIFECYCLE',
      'COMPETITION',
      competitionId,
      reason || `Advanced competition status from ${oldStatus} to ${status}`,
      oldStatus,
      status
    );

    res.json({ success: true, competition: comp });
  });

  // Submit and verify match results & MVP
  app.post('/api/competitions/:competitionId/results', (req, res) => {
    const { competitionId } = req.params;
    const { results, mvpWinner } = req.body;
    const comp = competitions.find(c => c.competitionId === competitionId);

    if (!comp) return res.status(404).json({ error: 'Competition not found' });

    const admin = players.find(p => p.global_user_id === currentActiveUserId);
    if (!admin || !['SUPER_ADMIN', 'COMPETITION_ADMIN', 'VERIFICATION_ADMIN'].includes(admin.role)) {
      return res.status(403).json({ error: 'Only authorized admins can submit and verify authoritative match results.' });
    }

    comp.results = results;
    if (mvpWinner) {
      comp.mvpWinner = {
        ...mvpWinner,
        verified: true,
      };
    }
    comp.status = 'RESULTS_VERIFIED';

    logAdminAction(
      currentActiveUserId,
      'VERIFY_MATCH_RESULTS',
      'COMPETITION',
      competitionId,
      'Adjudicated and verified official match results and MVP award.'
    );

    // Notify participants of verified results
    notifications.unshift({
      notificationId: `NOTIF_${Date.now()}`,
      userId: 'ALL',
      type: 'RESULT',
      title: `Verified Results: ${comp.title}`,
      message: `Official match results and MVP rankings are published for ${comp.title}.`,
      link: `/match/${comp.competitionId}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, competition: comp });
  });

  // ==========================================
  // 7. SPONSORSHIP SYSTEM & ROLLING BANNER
  // ==========================================
  app.get('/api/sponsors', (req, res) => {
    res.json({ sponsors });
  });

  app.get('/api/sponsors/active-banner', (req, res) => {
    const active = sponsors
      .filter(s => s.status === 'ACTIVE')
      .sort((a, b) => a.displayPriority - b.displayPriority);
    res.json({ sponsors: active });
  });

  // Aggregated analytics impression/click recorder
  app.post('/api/sponsors/:sponsorId/track', (req, res) => {
    const { sponsorId } = req.params;
    const { eventType } = req.body; // 'impression' | 'bannerClick' | 'instagramClick' | 'youtubeClick' | 'websiteClick'

    const sponsor = sponsors.find(s => s.sponsorId === sponsorId);
    if (!sponsor) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    if (eventType === 'impression') sponsor.metrics.impressions += 1;
    else if (eventType === 'bannerClick') sponsor.metrics.bannerClicks += 1;
    else if (eventType === 'instagramClick') sponsor.metrics.instagramClicks += 1;
    else if (eventType === 'youtubeClick') sponsor.metrics.youtubeClicks += 1;
    else if (eventType === 'websiteClick') sponsor.metrics.websiteClicks += 1;

    res.json({ success: true, metrics: sponsor.metrics });
  });

  // Add / Edit Sponsor
  app.post('/api/sponsors', (req, res) => {
    const admin = players.find(p => p.global_user_id === currentActiveUserId);
    if (!admin || !['SUPER_ADMIN', 'CONTENT_ADMIN'].includes(admin.role)) {
      return res.status(403).json({ error: 'Content Admin or Super Admin permission required.' });
    }

    const { name, tier, description, logoUrl, bannerUrl, instagramUrl, youtubeUrl, websiteUrl, status, displayPriority } = req.body;

    const newSponsorId = `SPON_${(sponsors.length + 1).toString().padStart(3, '0')}`;
    const newSponsor: Sponsor = {
      sponsorId: newSponsorId,
      name,
      tier: tier || 'SPONSORED_BY',
      description: description || '',
      logoUrl: logoUrl || 'https://images.unsplash.com/photo-1612287233261-b4618e77519e?w=150&auto=format&fit=crop&q=80',
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      instagramUrl,
      youtubeUrl,
      websiteUrl,
      status: status || 'ACTIVE',
      displayPriority: Number(displayPriority) || 5,
      campaignStart: new Date().toISOString(),
      campaignEnd: new Date(Date.now() + 365 * 86400000).toISOString(),
      metrics: {
        impressions: 0,
        bannerClicks: 0,
        instagramClicks: 0,
        youtubeClicks: 0,
        websiteClicks: 0,
      },
      createdAt: new Date().toISOString(),
    };

    sponsors.push(newSponsor);

    logAdminAction(
      currentActiveUserId,
      'CREATE_SPONSOR',
      'SPONSOR',
      newSponsorId,
      `Added official sponsor partner ${newSponsor.name} (${newSponsor.tier})`
    );

    res.status(201).json({ success: true, sponsor: newSponsor });
  });

  // ==========================================
  // 8. ANTI-CHEAT, FAIR-PLAY & DISCIPLINE
  // ==========================================
  app.get('/api/fairplay/reports', (req, res) => {
    res.json({ reports: fairPlayReports });
  });

  app.post('/api/fairplay/reports', (req, res) => {
    const { targetPlayerUid, targetPlayerName, competitionId, matchName, reason, description, evidenceUrls } = req.body;
    const reporter = players.find(p => p.global_user_id === currentActiveUserId);

    if (!reporter) return res.status(401).json({ error: 'Login required to submit report.' });
    if (!targetPlayerUid || !reason || !description) {
      return res.status(400).json({ error: 'Target Free Fire UID, reason, and detailed description are required.' });
    }

    const newReport: FairPlayReport = {
      reportId: `REP_FP_${Date.now().toString().slice(-5)}`,
      reporterId: reporter.global_user_id,
      reporterName: reporter.displayName,
      targetPlayerUid,
      targetPlayerName,
      competitionId,
      matchName,
      reason,
      description,
      evidenceUrls: evidenceUrls || [],
      status: 'PENDING',
      penaltyApplied: 'NONE',
      createdAt: new Date().toISOString(),
    };

    fairPlayReports.unshift(newReport);
    res.status(201).json({ success: true, report: newReport });
  });

  // Admin Review & Adjudicate Penalty
  app.post('/api/fairplay/reports/:reportId/adjudicate', (req, res) => {
    const admin = players.find(p => p.global_user_id === currentActiveUserId);
    if (!admin || !['SUPER_ADMIN', 'VERIFICATION_ADMIN'].includes(admin.role)) {
      return res.status(403).json({ error: 'Verification Admin or Super Admin permission required.' });
    }

    const { reportId } = req.params;
    const { status, penaltyApplied, adminNotes } = req.body;
    const report = fairPlayReports.find(r => r.reportId === reportId);

    if (!report) return res.status(404).json({ error: 'Report not found' });

    report.status = status;
    report.penaltyApplied = penaltyApplied as PenaltyType;
    report.adminNotes = adminNotes;
    report.reviewedByAdminId = currentActiveUserId;
    report.resolvedAt = new Date().toISOString();

    // If penalty applied, update player status
    const targetPlayer = players.find(p => p.freeFireUid === report.targetPlayerUid);
    if (targetPlayer && penaltyApplied && penaltyApplied !== 'NONE') {
      if (penaltyApplied === 'PERMANENT_BAN') targetPlayer.status = 'PERMANENT_BAN';
      else if (penaltyApplied === 'TEMPORARY_SUSPENSION') targetPlayer.status = 'TEMPORARY_SUSPENSION';
      else if (penaltyApplied === 'WARNING') targetPlayer.status = 'WARNING';
    }

    logAdminAction(
      currentActiveUserId,
      'ADJUDICATE_FAIRPLAY_REPORT',
      'USER',
      report.targetPlayerUid,
      `Applied penalty ${penaltyApplied} for ${report.reason}. Notes: ${adminNotes || 'None'}`
    );

    res.json({ success: true, report });
  });

  // ==========================================
  // 9. COMPLIANCE GATE & FINANCIAL LEDGER
  // ==========================================
  app.get('/api/compliance', (req, res) => {
    res.json({
      complianceState,
      financialLedger,
    });
  });

  // Admin Compliance Gate Toggle (strictly controlled & audited)
  app.post('/api/compliance/update-gate', (req, res) => {
    const admin = players.find(p => p.global_user_id === currentActiveUserId);
    if (!admin || admin.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only the SUPER_ADMIN can modify statutory compliance settings.' });
    }

    const { monetaryCompetitionsEnabled, skillAffidavit, legalApprovalRef, notes } = req.body;
    const oldVal = String(complianceState.monetaryCompetitionsEnabled);

    complianceState.monetaryCompetitionsEnabled = Boolean(monetaryCompetitionsEnabled);
    if (skillAffidavit !== undefined) complianceState.skillBasedGamingAffidavitVerified = Boolean(skillAffidavit);
    if (legalApprovalRef) complianceState.legalCounselApprovalRef = legalApprovalRef;
    if (notes) complianceState.notes = notes;
    complianceState.lastAuditedAt = new Date().toISOString();

    logAdminAction(
      currentActiveUserId,
      'UPDATE_COMPLIANCE_GATE',
      'COMPLIANCE',
      'INDIA_SKILL_GAMING_GATE',
      notes || 'Updated monetary competition compliance state',
      oldVal,
      String(complianceState.monetaryCompetitionsEnabled)
    );

    res.json({ success: true, complianceState });
  });

  // ==========================================
  // 10. EMERGENCY CONTROLS & AUDIT LOGS
  // ==========================================
  app.get('/api/admin/emergency-controls', (req, res) => {
    res.json({ emergencyState, auditLogs });
  });

  app.post('/api/admin/emergency-controls', (req, res) => {
    const admin = players.find(p => p.global_user_id === currentActiveUserId);
    if (!admin || admin.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'SUPER_ADMIN permissions required for emergency controls.' });
    }

    const {
      registrationsPaused,
      accountCreationDisabled,
      financialsPaused,
      fileUploadsDisabled,
      maintenanceMode,
      activeIncidentNotice,
      reason,
    } = req.body;

    const oldStateStr = JSON.stringify(emergencyState);

    if (registrationsPaused !== undefined) emergencyState.registrationsPaused = registrationsPaused;
    if (accountCreationDisabled !== undefined) emergencyState.accountCreationDisabled = accountCreationDisabled;
    if (financialsPaused !== undefined) emergencyState.financialsPaused = financialsPaused;
    if (fileUploadsDisabled !== undefined) emergencyState.fileUploadsDisabled = fileUploadsDisabled;
    if (maintenanceMode !== undefined) emergencyState.maintenanceMode = maintenanceMode;
    if (activeIncidentNotice !== undefined) emergencyState.activeIncidentNotice = activeIncidentNotice;

    logAdminAction(
      currentActiveUserId,
      'EMERGENCY_CONTROLS_MUTATED',
      'EMERGENCY',
      'GLOBAL_SWITCHES',
      reason || 'Emergency switch updated by Super Admin',
      oldStateStr,
      JSON.stringify(emergencyState)
    );

    res.json({ success: true, emergencyState });
  });

  // ==========================================
  // 11. NOTIFICATIONS & YOUTUBE STREAMS
  // ==========================================
  app.get('/api/notifications', (req, res) => {
    const userNotifs = notifications.filter(
      n => n.userId === currentActiveUserId || n.userId === 'ALL'
    );
    res.json({ notifications: userNotifs });
  });

  app.post('/api/notifications/mark-read', (req, res) => {
    const { notificationId } = req.body;
    const notif = notifications.find(n => n.notificationId === notificationId);
    if (notif) notif.isRead = true;
    res.json({ success: true });
  });

  app.get('/api/youtube/streams', (req, res) => {
    res.json({ streams: INITIAL_YOUTUBE_STREAMS });
  });

  // ==========================================
  // 12. VITE MIDDLEWARE & SPA FALLBACK
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TMT Official YT] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
