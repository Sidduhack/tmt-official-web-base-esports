import { DatabaseNode, StorageNode } from '../../types';
import { Server, HardDrive, Database, Zap } from 'lucide-react';

interface Props {
  dbNodes: DatabaseNode[];
  storageNodes: StorageNode[];
  onClose: () => void;
}

export function SystemArchitectureDiagModal({ dbNodes, storageNodes, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0b0f19] border border-amber-500/30 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-heading">
                TMT Distributed Cluster Architecture & Shard Diagnostics
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Multi-Supabase Shards ({dbNodes.length || 5}) + Free-Tier Google Drive Multi-Vault Matrix ({storageNodes.length || 3})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Global Identity & Router Layer */}
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-cyan-500/10 p-5 rounded-2xl border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Global Identity Router
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
              DETERMINISTIC ROUTING ACTIVE (5 SHARDS)
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Athletes log in using unified identity tokens (<code className="text-amber-300">USR_GLOBAL_XXX</code>). The backend router determines shard mapping dynamically across all {dbNodes.length || 5} distributed Supabase database instances based on node capacity, regional latency, and health state.
          </p>
        </div>

        {/* Architecture Shard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Multi-Supabase Nodes */}
          <div className="bg-[#0f1422] p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" /> Supabase Database Nodes ({dbNodes.length || 5} Shards)
            </h3>

            <div className="space-y-2.5">
              {dbNodes.map(db => (
                <div
                  key={db.databaseId}
                  className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white">{db.name}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                        db.status === 'HEALTHY'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {db.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Region: {db.region} • Capacity: {db.activeUsers}/{db.userCapacity} ({Math.round((db.activeUsers / db.userCapacity) * 100)}%)
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Heartbeat: {new Date(db.lastHeartbeat).toLocaleTimeString()} • Latency: {db.latencyMs}ms
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Google Drive Storage Nodes */}
          <div className="bg-[#0f1422] p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-400" /> Google Drive Free-Tier Vaults (3 Accounts)
            </h3>

            <div className="space-y-2.5">
              {storageNodes.map(st => {
                const usedGb = (st.usedBytes / (1024 * 1024 * 1024)).toFixed(2);
                const totalGb = (st.totalQuotaBytes / (1024 * 1024 * 1024)).toFixed(0);

                return (
                  <div
                    key={st.driveId}
                    className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white">{st.name}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                        {st.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Vault ID: {st.driveId} • Files Managed: {st.fileCount}
                    </p>
                    <p className="text-[10px] text-amber-300 font-mono">
                      Quota Utilization: {usedGb} GB / {totalGb} GB Free Tier
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Zero Server Cost Architecture Design</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
