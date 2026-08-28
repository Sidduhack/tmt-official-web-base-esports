import { EmergencyControlsState } from '../types';
import { AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  emergencyState: EmergencyControlsState;
}

export function EmergencyNoticeBanner({ emergencyState }: Props) {
  const isEmergency =
    emergencyState.maintenanceMode ||
    emergencyState.registrationsPaused ||
    emergencyState.accountCreationDisabled ||
    emergencyState.financialsPaused;

  if (!isEmergency && !emergencyState.activeIncidentNotice) return null;

  return (
    <div
      id="tmt-emergency-incident-banner"
      className={`w-full py-2 px-4 text-xs font-semibold flex items-center justify-between border-b ${
        emergencyState.maintenanceMode
          ? 'bg-red-950/90 text-red-200 border-red-800'
          : emergencyState.registrationsPaused
          ? 'bg-amber-950/90 text-amber-200 border-amber-800'
          : 'bg-blue-950/90 text-blue-200 border-blue-800'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-2.5 w-full">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
        <div className="flex-1 truncate">
          <span className="font-bold uppercase tracking-wider mr-2">
            {emergencyState.maintenanceMode
              ? '[MAINTENANCE MODE ACTIVE]'
              : emergencyState.registrationsPaused
              ? '[REGISTRATIONS TEMPORARILY PAUSED]'
              : '[TMT ADVISORY]'}
          </span>
          <span className="font-normal opacity-90">{emergencyState.activeIncidentNotice}</span>
        </div>
      </div>
    </div>
  );
}
