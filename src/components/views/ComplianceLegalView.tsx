import { ComplianceGateState } from '../../types';
import {
  Scale,
  ShieldCheck,
  Lock,
  FileCheck,
  AlertTriangle,
  Building,
} from 'lucide-react';

interface Props {
  complianceState: ComplianceGateState;
}

export function ComplianceLegalView({ complianceState }: Props) {
  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-[#0f1422] rounded-2xl border border-amber-500/30 p-6 shadow-2xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold font-mono uppercase">
            REGULATORY TRANSPARENCY
          </span>
          <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold font-mono">
            REPUBLIC OF INDIA
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-white font-heading">
          Indian Legal & Esports Compliance Policy
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          TMT Official YT operates strictly within the legal framework governing electronic sports and skill-based competitions in India, complying with the <strong>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2023</strong> and landmark judicial precedents on Games of Skill.
        </p>
      </div>

      {/* Explicit Compliance Gate Status Box */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0f1422] to-[#1a1208] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" /> Platform Compliance Gate Status
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
              complianceState.monetaryCompetitionsEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}
          >
            {complianceState.monetaryCompetitionsEnabled
              ? 'MONETARY GATE: ACTIVE'
              : 'MONETARY GATE: LOCKED (FREE COMPETITIONS ONLY)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <p className="font-bold text-slate-200">Current Operational Protocol</p>
            <p className="text-slate-400 leading-relaxed">
              In accordance with safety mandates, all competitions hosted on TMT Official YT are <strong>100% Free to Enter (₹0 Entry Fee)</strong>. Prize distributions are funded exclusively via brand sponsorships and channel grants.
            </p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <p className="font-bold text-slate-200">Legal Audit & Gating Checkpoints</p>
            <p className="text-slate-400 leading-relaxed font-mono">
              Audit Note: {complianceState.notes}
            </p>
            <p className="text-[11px] text-slate-500">
              Last Verified: {new Date(complianceState.lastAuditedAt).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* Game of Skill Justification */}
      <div className="bg-[#0f1422] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" /> Jurisprudential Skill Classification: Free Fire
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Under Indian jurisprudence (including judgments by the Supreme Court of India in <em>State of Bombay v. R.M.D. Chamarbaugwala</em> and <em>K.R. Lakshmanan v. State of Tamil Nadu</em>), games where success depends predominantly on the superior knowledge, training, attention, experience, and adroitness of the player are recognized as <strong>Games of Mere Skill</strong> protected under Article 19(1)(g) of the Constitution of India.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-bold text-amber-300 mb-1">1. Reflexes & Weapon Mastery</h4>
            <p className="text-slate-400">Precision crosshair placement, drag headshots, recoil handling, and gloo wall deployment mechanics.</p>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-bold text-amber-300 mb-1">2. Zone Tactics & Positioning</h4>
            <p className="text-slate-400">Map rotations, safe zone prediction, high-ground control, and strategic resource allocation.</p>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-bold text-amber-300 mb-1">3. Team Coordination</h4>
            <p className="text-slate-400">In-game leader (IGL) decision making, role distribution (Rusher, Sniper, Support), and callout synergy.</p>
          </div>
        </div>
      </div>

      {/* State Restrictions Matrix & Tax Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* State Restrictions */}
        <div className="bg-[#0f1422] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> State Regulatory Advisory
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The following states maintain specific statutes regarding online gaming contests:
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {complianceState.restrictedStatesAcknowledged.map(st => (
              <span
                key={st}
                className="px-2.5 py-1 bg-red-950/60 text-red-300 border border-red-800/60 rounded-lg text-xs font-mono"
              >
                {st}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            * Athletes residing in these jurisdictions are permitted in free community tournaments but are excluded from paid entry structures if enabled.
          </p>
        </div>

        {/* Section 194BA & TDS Readiness */}
        <div className="bg-[#0f1422] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-cyan-400" /> Section 194BA & TDS Readiness
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            In compliance with the Finance Act 2023, TMT platform architecture includes automated 30% Tax Deducted at Source (TDS) calculation on net cumulative winnings for monetary events, requiring verified PAN card credentials prior to disbursement.
          </p>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
            TDS Rate: <strong className="text-amber-400">30%</strong> • Mandatory KYC on ₹10,000+
          </div>
        </div>
      </div>

      {/* Grievance Officer & Contact */}
      <div className="bg-[#0f1422] rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-400" /> Designated Grievance Redressal Officer
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Officer: <strong>Grievance Cell, TMT Official YT</strong> • Email: <code className="text-amber-300">legal@tmtofficialyt.esports</code>
          </p>
        </div>
        <a
          href="mailto:legal@tmtofficialyt.esports"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
        >
          Contact Legal Cell
        </a>
      </div>
    </div>
  );
}
